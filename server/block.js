/**
 * Which block the address is actually in.
 *
 * "The same subnet" sounds like one fact and is at least three, which is why
 * this stage reports all of them instead of picking quietly:
 *
 *   · the registry allocation — the range a RIR handed to somebody. It says
 *     who owns the address, and it can be a /29 with one customer in it;
 *   · the routed prefix — what the internet's routing table actually carries,
 *     read from Team Cymru's DNS interface. It says whose network announces
 *     the address, and it is often a /22 or wider;
 *   · the /24 around the address — not a fact from any registry, but the unit
 *     hosting companies hand out and the one a sweep can finish.
 *
 * The sweep then runs over the widest of those that fits under the cap, and
 * every neighbour found is marked with which of the three it also falls in. A
 * reader who wanted the strict answer can still see it; a reader who wanted
 * "who else is around here" gets the useful one.
 */

import { TYPE, query, defaultResolver } from '@sharapov/dns-wire';

import { getJson } from './upstream.js';
import { parseIp, network, contains, formatIp } from './cidr.js';
import { MAX_HOSTS } from './target.js';

const RIR_NAMES = {
  'whois.arin.net': 'ARIN',
  'whois.ripe.net': 'RIPE NCC',
  'whois.apnic.net': 'APNIC',
  'whois.lacnic.net': 'LACNIC',
  'whois.afrinic.net': 'AFRINIC',
};

/* ------------------------------------------------------------------ *
 * RDAP — who the registry says owns this
 * ------------------------------------------------------------------ */

function vcard(entity, key) {
  const rows = entity?.vcardArray?.[1];
  if (!Array.isArray(rows)) return undefined;
  const row = rows.find(item => Array.isArray(item) && item[0] === key);
  if (!row) return undefined;
  if (typeof row[3] === 'string') return row[3];
  if (Array.isArray(row[3])) return row[3].filter(Boolean).join(', ');
  return undefined;
}

function findEntity(entities, role) {
  for (const entity of entities || []) {
    if ((entity.roles || []).includes(role)) return entity;
    const nested = findEntity(entity.entities, role);
    if (nested) return nested;
  }
  return null;
}

async function fetchRdap(address) {
  for (const url of [`https://rdap.org/ip/${address}`, `https://rdap.db.ripe.net/ip/${address}`]) {
    const data = await getJson(url, { accept: 'application/rdap+json, application/json', timeout: 7000 });
    if (!data?.startAddress) continue;

    const event = action => (data.events || []).find(item => item.eventAction === action)?.eventDate;
    const holder = findEntity(data.entities, 'registrant') ||
      findEntity(data.entities, 'administrative') ||
      (data.entities || [])[0];
    const abuse = findEntity(data.entities, 'abuse');

    const cidrs = (data.cidr0_cidrs || [])
      .map(entry => `${entry.v4prefix || entry.v6prefix}/${entry.length}`)
      .filter(Boolean);

    return {
      name: data.name,
      handle: data.handle,
      range: `${data.startAddress} – ${data.endAddress}`,
      cidr: cidrs.join(', ') || undefined,
      cidrs,
      type: data.type,
      holder: holder ? (vcard(holder, 'fn') || holder.handle) : undefined,
      country: data.country,
      rir: RIR_NAMES[data.port43] || data.port43,
      registered: event('registration'),
      updated: event('last changed'),
      abuse: abuse ? (vcard(abuse, 'email') || vcard(abuse, 'fn')) : undefined,
    };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Routing — what the table actually carries
 * ------------------------------------------------------------------ */

/** Team Cymru answers over DNS, so this costs one query rather than an API key. */
function cymruName(ip) {
  if (ip.version === 4) {
    return `${formatIp(ip.bits, 4).split('.').reverse().join('.')}.origin.asn.cymru.com`;
  }
  const nibbles = ip.bits.toString(16).padStart(32, '0').split('').reverse().join('.');
  return `${nibbles}.origin6.asn.cymru.com`;
}

const txtOf = answer => (answer?.message?.answers || [])
  .filter(record => record.type === TYPE.TXT)
  .map(record => (record.data?.strings || []).join(''))
  .filter(Boolean);

async function fetchRouting(ip) {
  const server = defaultResolver();
  let rows;
  try {
    rows = txtOf(await query({ name: cymruName(ip), type: 'TXT', server, timeout: 4000 }));
  } catch {
    return null;
  }
  if (!rows.length) return null;

  /* "15169 | 8.8.8.0/24 | US | arin | 1992-12-01". The first field can list
     several origins for an anycast prefix; the first one is enough to name. */
  const parts = rows[0].split('|').map(field => field.trim());
  const asn = Number(String(parts[0]).split(/\s+/)[0]);
  const routing = {
    asn: Number.isFinite(asn) ? asn : undefined,
    prefix: parts[1] || undefined,
    country: parts[2] || undefined,
    registry: parts[3] ? parts[3].toUpperCase() : undefined,
    allocated: parts[4] || undefined,
  };

  if (routing.asn) {
    try {
      const named = txtOf(await query({
        name: `AS${routing.asn}.asn.cymru.com`, type: 'TXT', server, timeout: 4000,
      }));
      /* "15169 | US | arin | 2000-03-30 | GOOGLE, US" — the description last. */
      const fields = (named[0] || '').split('|').map(field => field.trim());
      if (fields[4]) routing.asName = fields[4];
    } catch { /* the number alone is still worth having */ }
  }

  return routing;
}

/* ------------------------------------------------------------------ *
 * Choosing what to sweep
 * ------------------------------------------------------------------ */

/** A candidate block, as far as it can be trusted to contain the address. */
function candidate(ip, cidr, source) {
  const [address, length] = String(cidr || '').split('/');
  const base = parseIp(address);
  if (!base || base.version !== ip.version || !/^\d{1,3}$/.test(String(length))) return null;
  const block = network(base, Number(length));
  if (!contains(block, ip)) return null;
  return { ...block, source };
}

/**
 * @param {object} ip        the address, parsed
 * @param {number} [wanted]  a prefix length the caller named outright
 */
export async function resolveBlock(ip, { wanted } = {}) {
  const [registry, routing] = await Promise.all([
    fetchRdap(ip.text).catch(() => null),
    fetchRouting(ip).catch(() => null),
  ]);

  const candidates = [];
  for (const cidr of registry?.cidrs || []) {
    const block = candidate(ip, cidr, 'registry');
    if (block) candidates.push({ ...block, holder: registry.holder });
  }
  const routed = candidate(ip, routing?.prefix, 'routing');
  if (routed) candidates.push({ ...routed, asn: routing.asn, asName: routing.asName });

  /* The sweep unit. For v6 it is nominal — nothing walks a v6 block — but it
     still gives the page something to name the neighbourhood by. */
  const sweepPrefix = ip.version === 4 ? 32 - Math.floor(Math.log2(MAX_HOSTS)) : 64;
  const conventional = { ...network(ip, sweepPrefix), source: 'conventional' };
  if (!candidates.some(block => block.cidr === conventional.cidr)) candidates.push(conventional);

  candidates.sort((a, b) => (a.size < b.size ? -1 : a.size > b.size ? 1 : 0));

  let chosen;
  if (wanted !== undefined) {
    chosen = { ...network(ip, wanted), source: 'requested' };
  } else if (ip.version === 6) {
    /* No v6 block is walkable, so the narrowest registry answer is the most
       honest thing to put on the page. */
    chosen = candidates[0] || conventional;
  } else {
    /* The widest candidate a sweep can finish. Anything wider is described in
       the report but not walked. */
    const walkable = candidates.filter(block => block.size <= BigInt(MAX_HOSTS));
    chosen = walkable[walkable.length - 1] || conventional;
  }

  /* The chosen block belongs in the list of blocks the address is in: a caller
     who named a prefix would otherwise get a report highlighting a row that the
     table does not contain. */
  if (!candidates.some(block => block.cidr === chosen.cidr)) {
    candidates.push(chosen);
    candidates.sort((a, b) => (a.size < b.size ? -1 : a.size > b.size ? 1 : 0));
  }

  return { registry, routing, candidates, chosen };
}

/** Which of the candidate blocks an address falls inside, by source. */
export function membership(candidates, address) {
  const ip = parseIp(address);
  if (!ip) return [];
  return candidates.filter(block => contains(block, ip)).map(block => block.source);
}
