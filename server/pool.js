/**
 * Doing the same thing to a few hundred addresses without doing all of it at
 * once. The outbound scheduler in the kit already spaces individual sockets;
 * this caps how many are open together, which is what keeps a sweep from
 * looking like a flood at the far end and from exhausting file descriptors at
 * this one.
 */

/**
 * @param {Array} items
 * @param {number} limit    how many may be in flight at once
 * @param {(item: any, index: number) => Promise} worker
 */
export async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = next++;
      if (index >= items.length) return;
      try {
        results[index] = await worker(items[index], index);
      } catch {
        /* One address failing is the normal case in a sweep, not an event. */
        results[index] = null;
      }
    }
  });

  await Promise.all(runners);
  return results;
}
