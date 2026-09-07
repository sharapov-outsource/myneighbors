/**
 * The neighbourhood check.
 *
 * Two questions arrive at this service and they are not the same question:
 *
 *   who else is at this exact address — shared hosting, one machine, many sites;
 *   who else is in the block around it — one operator, many machines.
 *
 * The first is answered from indexes and certificates, because DNS has no
 * reverse of itself. The second is answered by walking the block: a PTR query
 * per address, then one TLS connection per address to read the certificate a
 * server shows when nobody asked for a particular site.
 *
 * Everything either half produces is a claim, and every claim is resolved
 * forward before the report will call it a neighbour. That verification stage
 * is not a refinement — without it this is a tool that reports sites which
 * moved away years ago, confidently.
 */

import { flag, sortFlags, incomplete as collectIncomplete, withDeadline, timed, isPrivateAddress, allowPrivate }
  from '@sharapov/service-kit';
import { TYPE, query, defaultResolver } from '@sharapov/dns-wire';

import { parseIp, enumerate } from './cidr.js';
import { MAX_HOSTS, checkPrefix } from './target.js';
import { resolveBlock, membership } from './block.js';
import { sweepPtr } from './reverse.js';
import { probeBlock } from './probe.js';
import { reverseIp, expandFromCt, dormantProviders } from './passive.js';
import { verifyNames } from './verify.js';

export const STAGES = ['resolve', 'block', 'reverse', 'certificates', 'passive', 'verify', 'summary'];

/**
 * Budgets.
 *
 * The stages that walk a block are bounded by arithmetic, not by hope: a /24 at
 * twelve connections a time with a six-second deadline is twenty-two rounds, so
 * a block that silently drops every packet costs a little over two minutes with
 * nothing to show for it. An outer deadline alone turns that into a 504 — the
 * whole report thrown away because one stage was slow.
 *
 * So each expensive stage gets its own budget and the report survives losing
 * one. A stage that runs out of time contributes what the kit's rule asks for:
 * a code in `incomplete`, and no pretence that its silence meant "nothing here".
 * The outer deadline stays as a ceiling above their sum, for the case where
 * something goes wrong that no stage budget describes.
 */
const BUDGET = {
  block: Number(process.env.BLOCK_BUDGET_MS || 15000),
  reverse: Number(process.env.REVERSE_BUDGET_MS || 30000),
  certificates: Number(process.env.PROBE_BUDGET_MS || 45000),
  passive: Number(process.env.PASSIVE_BUDGET_MS || 30000),
  verify: Number(process.env.VERIFY_BUDGET_MS || 30000),
};

const SCAN_TIMEOUT = Number(process.env.SCAN_TIMEOUT_MS ||
  Object.values(BUDGET).reduce((sum, ms) => sum + ms, 0) + 15000);

const PROBING = process.env.PROBE_ENABLED !== 'false';

/**
 * Networks where "who else is here" has no useful answer: a CDN edge fronts
 * millions of unrelated sites, and listing whichever handful an index happens
 * to know would read as a finding rather than as an artefact of the topology.
 */
const CDN_ASNS = new Set([13335, 209242, 54113, 20940, 16625, 32787, 22822, 15133, 60068, 197695]);
const CDN_NAMES = /cloudflare|fastly|akamai|cloudfront|incapsula|imperva|sucuri|stackpath|edgecast|limelight|bunny|cdn77|keycdn|qrator|ddos-guard|myracloud|gcore/i;

export async function scan(target, options = {}) {
  return withDeadline(run(target, options), SCAN_TIMEOUT);
}

async function run(target, { onProgress = () => {}, query: params = {} } = {}) {
  const started = Date.now();
  const progress = (stage, extra = {}) =>
    onProgress({ stage, elapsedMs: Date.now() - started, ...extra });

  const missing = [];
  const flags = [];

  /* ---------------- the address ---------------- */
  progress('resolve');
  const address = target.kind === 'ip' ? target.address : await resolveHost(target.host);
  const ip = parseIp(address);
  if (!ip) throw Object.assign(new Error('dns-failed'), { code: 'dns-failed', status: 400 });
  if (!allowPrivate() && isPrivateAddress(ip.text)) {
    throw Object.assign(new Error('private-address'), { code: 'private-address', status: 403 });
  }
  /* A prefix that arrived with a name could not be checked against an address
     family before now, because there was no address. */
  const badPrefix = checkPrefix(ip.version, target.prefix);
  if (badPrefix) throw Object.assign(new Error(badPrefix), { code: badPrefix, status: 400 });

  progress('resolve', { done: true, address: ip.text });

  /* ---------------- which block ---------------- */
  progress('block');
  const blockStage = await timed('block', () => resolveBlock(ip, { wanted: target.prefix }),
    { timeoutMs: BUDGET.block });
  /* Losing this one loses the whole report: without a block there is nothing to
     walk and nothing to describe. */
  if (!blockStage.ok) {
    throw Object.assign(new Error('stage-timeout'), { code: 'stage-timeout', status: 504 });
  }
  const block = blockStage.value;
  if (!block.registry) missing.push('registry');
  if (!block.routing) missing.push('routing');
  progress('block', { done: true, cidr: block.chosen.cidr });

  const cdn = isCdn(block);
  if (cdn) flags.push(flag('cdn-edge', 'info', 'info'));

  const addresses = ip.version === 4 ? enumerate(block.chosen, MAX_HOSTS) : null;
  if (!addresses) {
    flags.push(flag(ip.version === 6 ? 'block-not-enumerable' : 'block-too-large', 'info', 'info'));
    missing.push('sweep');
  }

  /* ---------------- reverse DNS across the block ---------------- */
  progress('reverse', { addresses: addresses?.length || 0 });
  const reverseStage = await timed('reverse', () => (addresses ? sweepPtr(addresses) : new Map()),
    { timeoutMs: BUDGET.reverse });
  const ptr = reverseStage.ok ? reverseStage.value : new Map();
  if (!reverseStage.ok) missing.push('sweep');
  progress('reverse', { done: true, found: ptr.size });

  /* ---------------- one connection per address ---------------- */
  const probing = PROBING && params.probe !== 'false' && Boolean(addresses);
  if (!probing && addresses) {
    flags.push(flag('probing-disabled', 'info', 'info'));
    missing.push('certificates');
  }

  progress('certificates', { addresses: probing ? addresses.length : 0 });
  const probeStage = await timed('certificates', () => (probing ? probeBlock(addresses) : []),
    { timeoutMs: BUDGET.certificates });
  const probes = probeStage.ok ? probeStage.value : [];
  if (!probeStage.ok) missing.push('certificates');
  progress('certificates', { done: true, responded: probes.length });

  /* ---------------- what somebody else's index knows ---------------- */
  progress('passive');
  const seeds = new Map();
  const add = (name, source) => {
    const key = String(name).toLowerCase();
    if (!seeds.has(key)) seeds.set(key, new Set());
    seeds.get(key).add(source);
  };

  for (const names of ptr.values()) names.forEach(name => add(name, 'ptr'));
  for (const probe of probes) {
    (probe.certificate?.names || []).forEach(name => add(name, 'certificate'));
    if (probe.http?.redirectsTo) add(probe.http.redirectsTo, 'redirect');
  }

  /* A CDN edge is exempt: the indexes would answer, and the answer would be
     a meaningless slice of a very long list. */
  const NOTHING = { passive: { names: new Map(), used: [], failed: [] }, ct: { names: new Map(), used: false } };
  const passiveStage = cdn ? { ok: true, value: NOTHING } : await timed('passive', async () => {
    const reverse = await reverseIp(ip.text);
    for (const [name, sources] of reverse.names) sources.forEach(source => add(name, source));

    /* Certificate transparency widens the names already found rather than
       discovering one, so it only runs when there is something to widen. */
    const ownNames = [...seeds.keys()].filter(name => !name.startsWith('*.'));
    const widened = ownNames.length ? await expandFromCt(ownNames) : { names: new Map(), used: false };
    return { passive: reverse, ct: widened };
  }, { timeoutMs: BUDGET.passive });

  const { passive, ct } = passiveStage.ok ? passiveStage.value : NOTHING;
  for (const name of ct.names.keys()) add(name, 'ct');
  if (!passive.used.length && !cdn) missing.push('reverse-ip');
  progress('passive', { done: true, candidates: seeds.size });

  /* ---------------- forward confirmation ---------------- */
  progress('verify', { candidates: seeds.size });
  const verifyStage = await timed('verify',
    () => verifyNames(seeds.keys(), { address: ip.text, block: block.chosen }),
    { timeoutMs: BUDGET.verify });
  const verified = verifyStage.ok ? verifyStage.value : { results: [], truncated: 0 };
  if (!verifyStage.ok) missing.push('verification');
  if (verified.truncated) missing.push('verification-truncated');
  progress('verify', { done: true, checked: verified.results.length });

  /* ---------------- putting it together ---------------- */
  progress('summary');
  const report = assemble({
    target, ip, block, ptr, probes, verified, seeds, started,
    cdn, probing, addresses, passive, ct, missing, flags,
  });
  progress('summary', { done: true });
  return report;
}

async function resolveHost(host) {
  const server = defaultResolver();
  for (const [type, code] of [['A', TYPE.A], ['AAAA', TYPE.AAAA]]) {
    const answer = await query({ name: host, type, server, timeout: 4000 }).catch(() => null);
    const record = (answer?.message?.answers || []).find(item => item.type === code);
    if (record?.data?.address) return String(record.data.address).toLowerCase();
  }
  throw Object.assign(new Error('dns-failed'), { code: 'dns-failed', status: 400 });
}

function isCdn({ routing }) {
  if (!routing) return false;
  return CDN_ASNS.has(routing.asn) || CDN_NAMES.test(routing.asName || '');
}

/* ------------------------------------------------------------------ *
 * The report
 * ------------------------------------------------------------------ */

function assemble(state) {
  const {
    target, ip, block, ptr, probes, verified, seeds, started,
    cdn, probing, addresses, passive, ct, missing, flags,
  } = state;

  const status = new Map(verified.results.map(result => [result.name, result]));
  const sourcesOf = name => [...(seeds.get(name) || [])].sort();

  const describe = name => ({
    name,
    sources: sourcesOf(name),
    status: status.get(name)?.status || 'unchecked',
    addresses: status.get(name)?.addresses,
  });

  /* --- the same address: shared hosting --- */
  const here = [...seeds.keys()]
    .filter(name => status.get(name)?.status === 'confirmed')
    .sort();
  const elsewhere = [...seeds.keys()]
    .filter(name => ['moved', 'unresolved', 'wildcard'].includes(status.get(name)?.status))
    .sort();

  /* --- the block: one entry per address that showed any sign of life --- */
  const byAddress = new Map();
  const touch = address => {
    if (!byAddress.has(address)) {
      byAddress.set(address, {
        address,
        self: address === ip.text,
        ptr: undefined,
        names: [],
        in: membership(block.candidates, address),
      });
    }
    return byAddress.get(address);
  };

  for (const [address, names] of ptr) touch(address).ptr = names;
  for (const probe of probes) {
    const entry = touch(probe.address);
    entry.tls = {
      alpn: probe.alpn,
      protocol: probe.protocol,
      subject: probe.certificate?.subject,
      issuer: probe.certificate?.issuer,
      validTo: probe.certificate?.validTo,
      names: probe.certificate?.names,
    };
    if (probe.http) {
      entry.http = {
        status: probe.http.status,
        server: probe.http.server,
        redirectsTo: probe.http.redirectsTo,
      };
    }
  }

  /* A name belongs to the address DNS says it belongs to, which is not always
     the address whose certificate mentioned it. */
  for (const result of verified.results) {
    if (result.status !== 'confirmed' && result.status !== 'in-block') continue;
    for (const address of result.addresses || []) {
      if (!byAddress.has(address) && address !== ip.text) continue;
      touch(address).names.push(describe(result.name));
    }
  }

  const neighbors = [...byAddress.values()]
    .sort((a, b) => compareAddresses(a.address, b.address))
    .map(entry => ({ ...entry, names: entry.names.sort((a, b) => a.name.localeCompare(b.name)) }));

  /* --- findings --- */
  const responded = probes.length;
  const suffixes = new Set([...ptr.values()].flat().map(name => name.split('.').slice(-2).join('.')));

  if (here.length > 3) flags.push(flag('shared-address', 'info', 'info'));
  if (here.length === 0 && !cdn) flags.push(flag('no-names-confirmed', 'info', 'unknown'));
  if (elsewhere.length > here.length && elsewhere.length > 3) {
    flags.push(flag('stale-claims', 'low', 'warning'));
  }
  if (addresses && ptr.size === 0) flags.push(flag('no-reverse-dns', 'low', 'warning'));
  if (suffixes.size === 1 && ptr.size > 2) flags.push(flag('single-operator', 'info', 'info'));
  if (block.candidates.some(candidate => candidate.size > BigInt(MAX_HOSTS))) {
    flags.push(flag('block-wider-than-sweep', 'info', 'info'));
  }
  if (!passive.used.length && !cdn) flags.push(flag('no-reverse-ip-source', 'low', 'unknown'));

  const dormant = dormantProviders();
  if (dormant.length) flags.push(flag('providers-available', 'info', 'info'));

  return {
    input: target.label,
    address: ip.text,
    version: ip.version,
    host: target.kind === 'host' ? target.host : undefined,

    block: {
      cidr: block.chosen.cidr,
      source: block.chosen.source,
      prefix: block.chosen.prefix,
      size: Number(block.chosen.size <= 1048576n ? block.chosen.size : -1),
      first: block.chosen.network,
      last: block.chosen.broadcast,
      candidates: block.candidates.map(candidate => ({
        cidr: candidate.cidr,
        source: candidate.source,
        size: Number(candidate.size <= 1048576n ? candidate.size : -1),
        holder: candidate.holder,
        asn: candidate.asn,
        asName: candidate.asName,
      })),
    },
    registry: block.registry || undefined,
    routing: block.routing || undefined,

    sameAddress: {
      confirmed: here.map(describe),
      count: here.length,
      unconfirmed: elsewhere.map(describe),
      shared: here.length > 1,
      cdn,
    },

    neighbors,

    sweep: {
      enumerated: addresses?.length || 0,
      withReverseDns: ptr.size,
      responded,
      probed: probing,
      truncatedCandidates: verified.truncated || undefined,
    },

    flags: sortFlags(flags),
    incomplete: collectIncomplete(missing),

    sources: [
      ...(block.registry ? ['rdap'] : []),
      ...(block.routing ? ['cymru'] : []),
      ...(ptr.size ? ['ptr'] : []),
      ...(responded ? ['tls'] : []),
      ...passive.used,
      ...(ct.used ? ['crt.sh'] : []),
    ],

    meta: {
      checkedAt: new Date().toISOString(),
      elapsedMs: Date.now() - started,
      candidates: seeds.size,
      verified: verified.results.length,
    },
  };
}

/** Sorts addresses the way a block reads: numerically, not as text. */
function compareAddresses(a, b) {
  const left = parseIp(a);
  const right = parseIp(b);
  if (!left || !right) return String(a).localeCompare(String(b));
  return left.bits < right.bits ? -1 : left.bits > right.bits ? 1 : 0;
}
