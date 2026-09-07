/**
 * Address and prefix arithmetic.
 *
 * Everything is done in BigInt so that v4 and v6 share one code path. The
 * enumeration guard matters more than the arithmetic: a /64 holds 1.8e19
 * addresses, and the only safe answer for such a prefix is to refuse to walk it.
 */

const V4_MAX = 32n;
const V6_MAX = 128n;

export function parseIp(text) {
  const value = String(text || '').trim();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    const parts = value.split('.').map(Number);
    if (parts.some(p => p > 255)) return null;
    return { version: 4, bits: parts.reduce((a, p) => (a << 8n) | BigInt(p), 0n), text: value };
  }
  if (value.includes(':')) {
    const bits = parseV6(value);
    return bits === null ? null : { version: 6, bits, text: formatV6(bits) };
  }
  return null;
}

function parseV6(value) {
  const halves = value.split('::');
  if (halves.length > 2) return null;

  const split = part => (part ? part.split(':') : []);
  const head = split(halves[0]);
  const tail = halves.length === 2 ? split(halves[1]) : [];

  /* A trailing v4 form (::ffff:1.2.3.4) stands for the last two groups. */
  const side = tail.length ? tail : head;
  const last = side[side.length - 1];
  if (last && last.includes('.')) {
    const v4 = parseIp(last);
    if (!v4 || v4.version !== 4) return null;
    side.splice(-1, 1, (v4.bits >> 16n).toString(16), (v4.bits & 0xffffn).toString(16));
  }

  let groups;
  if (halves.length === 2) {
    const missing = 8 - head.length - tail.length;
    if (missing < 1) return null;
    groups = [...head, ...Array(missing).fill('0'), ...tail];
  } else {
    if (head.length !== 8) return null;
    groups = head;
  }

  let bits = 0n;
  for (const group of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
    bits = (bits << 16n) | BigInt(parseInt(group, 16));
  }
  return bits;
}

export function formatIp(bits, version) {
  return version === 4 ? formatV4(bits) : formatV6(bits);
}

function formatV4(bits) {
  return [24n, 16n, 8n, 0n].map(shift => Number((bits >> shift) & 0xffn)).join('.');
}

/** ::ffff:0:0/96 — the range that carries an IPv4 address inside a v6 one. */
const V4_MAPPED_PREFIX = 0xffffn;

function formatV6(bits) {
  /* RFC 5952 §5: an IPv4-mapped address is written with its last four bytes
     dotted. That is not only convention — the shared private-address guard
     recognises these by the dotted tail, and without it every ::ffff:a.b.c.d
     falls through to its "unknown, therefore private" branch and the address
     is refused. */
  if (bits >> 32n === V4_MAPPED_PREFIX) return `::ffff:${formatV4(bits & 0xffffffffn)}`;

  const groups = [];
  for (let shift = 112n; shift >= 0n; shift -= 16n) groups.push(Number((bits >> shift) & 0xffffn).toString(16));

  /* RFC 5952: compress the longest run of zero groups, leftmost on a tie. */
  let bestStart = -1, bestLength = 0, runStart = -1;
  groups.forEach((group, index) => {
    if (group === '0') {
      if (runStart < 0) runStart = index;
      const length = index - runStart + 1;
      if (length > bestLength) { bestLength = length; bestStart = runStart; }
    } else runStart = -1;
  });
  if (bestLength < 2) return groups.join(':');
  return `${groups.slice(0, bestStart).join(':')}::${groups.slice(bestStart + bestLength).join(':')}`;
}

/** Parse "1.2.3.0/24"; a bare address is treated as a host prefix. */
export function parseCidr(text) {
  const [address, length] = String(text || '').trim().split('/');
  const ip = parseIp(address);
  if (!ip) return null;
  const max = ip.version === 4 ? V4_MAX : V6_MAX;
  if (length !== undefined && !/^\d+$/.test(length)) return null;
  const prefix = length === undefined ? max : BigInt(length);
  if (prefix > max) return null;
  return network(ip, prefix);
}

export function network(ip, prefix) {
  const max = ip.version === 4 ? V4_MAX : V6_MAX;
  const bits = BigInt(prefix);
  const mask = bits === 0n ? 0n : ((1n << bits) - 1n) << (max - bits);
  const first = ip.bits & mask;
  const last = first | ((1n << (max - bits)) - 1n);
  return {
    version: ip.version,
    prefix: Number(bits),
    first,
    last,
    size: last - first + 1n,
    cidr: `${formatIp(first, ip.version)}/${bits}`,
    network: formatIp(first, ip.version),
    broadcast: formatIp(last, ip.version),
  };
}

export function contains(block, ip) {
  return ip.version === block.version && ip.bits >= block.first && ip.bits <= block.last;
}

/**
 * Addresses of a block, capped. Returns null when the block is too large to
 * walk — the caller must then fall back to passive sources only.
 */
export function enumerate(block, limit = 1024) {
  if (block.size > BigInt(limit)) return null;
  const out = [];
  for (let bits = block.first; bits <= block.last; bits++) out.push(formatIp(bits, block.version));
  return out;
}

/** The reverse-DNS name for an address: 4.3.2.1.in-addr.arpa / nibbles.ip6.arpa. */
export function arpaName(ip) {
  if (ip.version === 4) return `${formatV4(ip.bits).split('.').reverse().join('.')}.in-addr.arpa`;
  const nibbles = ip.bits.toString(16).padStart(32, '0').split('').reverse();
  return `${nibbles.join('.')}.ip6.arpa`;
}
