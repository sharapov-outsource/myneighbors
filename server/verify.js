/**
 * Asking DNS whether a candidate name is actually served here.
 *
 * This stage is the difference between a reverse-IP answer and a reverse-IP
 * answer worth reading. Every source feeding this service is a claim about the
 * past: a PTR record is whatever the block's owner last typed, a certificate
 * lists the names it was issued for rather than the ones still hosted, a
 * reverse-IP index is a crawl from some point in time, and a CT log never
 * forgets anything. Reported unchecked, all four go stale silently and the
 * report starts confidently naming sites that moved away years ago.
 *
 * So each candidate is resolved forward and labelled by what came back:
 *
 *   confirmed   an A/AAAA record points at exactly this address
 *   in-block    it points somewhere else inside the block being examined
 *   moved       it resolves, but to an address outside the block
 *   unresolved  nothing answers for it any more
 *
 * A name is only ever called a neighbour on the strength of the first two.
 */

import { TYPE, query, defaultResolver } from '@sharapov/dns-wire';

import { parseIp, contains } from './cidr.js';
import { mapPool } from './pool.js';

const CONCURRENCY = Number(process.env.VERIFY_CONCURRENCY || 16);

/** How many candidates are checked. Past this the report says it stopped. */
export const VERIFY_LIMIT = Number(process.env.VERIFY_LIMIT || 400);

async function addressesOf(name, server) {
  const wanted = [['A', TYPE.A], ['AAAA', TYPE.AAAA]];
  const found = [];

  for (const [type, code] of wanted) {
    const answer = await query({ name, type, server, timeout: 3000, retries: 1 }).catch(() => null);
    for (const record of answer?.message?.answers || []) {
      if (record.type !== code) continue;
      const value = record.data?.address;
      if (value) found.push(String(value).toLowerCase());
    }
  }
  return [...new Set(found)];
}

/**
 * @param {Iterable<string>} candidates
 * @param {object} options
 * @param {string} options.address  the address the question was asked about
 * @param {object} options.block    the block being examined
 */
export async function verifyNames(candidates, { address, block }) {
  const server = defaultResolver();
  const list = [...new Set(candidates)];
  const checked = list.slice(0, VERIFY_LIMIT);

  const results = await mapPool(checked, CONCURRENCY, async name => {
    /* A wildcard covers names rather than being one, so there is nothing to
       resolve and nothing that could confirm it. */
    if (name.startsWith('*.')) return { name, status: 'wildcard', addresses: [] };

    const addresses = await addressesOf(name, server);
    if (!addresses.length) return { name, status: 'unresolved', addresses };

    if (addresses.includes(address)) return { name, status: 'confirmed', addresses };

    const inBlock = block && addresses.some(value => {
      const ip = parseIp(value);
      return ip && contains(block, ip);
    });
    return { name, status: inBlock ? 'in-block' : 'moved', addresses };
  });

  return {
    results: results.filter(Boolean),
    truncated: list.length > checked.length ? list.length - checked.length : 0,
  };
}
