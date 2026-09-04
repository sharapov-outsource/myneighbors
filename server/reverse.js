/**
 * Reverse DNS for a whole block.
 *
 * This is the only stage that finds neighbours without touching them: a PTR
 * query goes to a resolver, never to the address it is about. For a block of
 * dedicated servers it is also the most productive one — hosting companies set
 * PTR records because mail requires it — though what comes back is usually the
 * provider's own naming (`srv-42.hoster.net`) rather than the sites on it.
 *
 * A PTR record is a claim by whoever controls the reverse zone, and nothing
 * forces it to agree with the forward one. It is reported as found here and
 * checked in the verification stage, never before.
 */

import { TYPE, query, defaultResolver } from '@sharapov/dns-wire';

import { arpaName, parseIp } from './cidr.js';
import { mapPool } from './pool.js';

const CONCURRENCY = Number(process.env.PTR_CONCURRENCY || 16);

/**
 * @param {string[]} addresses
 * @returns {Promise<Map<string, string[]>>} address → names, only where set
 */
export async function sweepPtr(addresses) {
  const server = defaultResolver();
  const found = new Map();

  await mapPool(addresses, CONCURRENCY, async address => {
    const ip = parseIp(address);
    if (!ip) return;

    const answer = await query({
      name: arpaName(ip), type: 'PTR', server, timeout: 3000, retries: 1,
    });
    const names = (answer?.message?.answers || [])
      .filter(record => record.type === TYPE.PTR)
      .map(record => String(record.data?.ptr || '').replace(/\.$/, '').toLowerCase())
      .filter(Boolean);

    if (names.length) found.set(address, [...new Set(names)]);
  });

  return found;
}
