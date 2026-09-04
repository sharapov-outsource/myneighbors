/**
 * Talking to somebody else's API.
 *
 * Every outbound request carries a User-Agent that names the service and links
 * to the page explaining what it does. That is not politeness for its own sake:
 * this service reads registries and certificate logs on behalf of whoever typed
 * an address, and an operator who wants it to stop needs something to grep for
 * and somebody to write to.
 */

import { pace } from '@sharapov/service-kit';

const VERSION = process.env.SERVICE_VERSION || '1.0';
const SITE = process.env.SERVICE_URL || 'https://myneighbors.sharapov.biz';

export const USER_AGENT = `myneighbors/${VERSION} (+${SITE})`;

/**
 * A JSON GET with a deadline. Returns null on anything that is not a usable
 * answer, because every caller here treats "no data" and "the upstream is
 * having a bad day" the same way: the source is skipped and said to be missing.
 */
export async function getJson(url, { timeout = 8000, accept = 'application/json', lane = 'http' } = {}) {
  await pace(lane);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept, 'user-agent': USER_AGENT },
      redirect: 'follow',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
