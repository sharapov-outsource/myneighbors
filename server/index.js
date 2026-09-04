/**
 * myneighbors — the HTTP layer.
 *
 *   GET /                          the page
 *   GET /<ip>                      page for an address (JSON for console clients)
 *   GET /<ip>-<prefix>             a block, named outright
 *   GET /<ip>/<prefix>             the same, redirected to the dash form
 *   GET /api/<target>              always data
 *   GET /api/stream/<target>       the same check as server-sent events
 *   GET /healthz                   liveness probe
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createService, localizeReport } from '@sharapov/service-kit';

import { scan, STAGES } from './scan.js';
import { parseNeighborTarget, MAX_HOSTS } from './target.js';
import { PROVIDERS, dormantProviders } from './passive.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const service = await createService({
  slug: 'myneighbors',
  name: 'Neighbors Check',
  domain: 'myneighbors.sharapov.biz',
  port: 3029,
  root: ROOT,
  stages: STAGES,

  parse: (raw, req) => parseNeighborTarget(raw, req),
  pathFor: target => target.label,
  cacheKey: target => target.key,
  /* Turning the probe off produces a different report from the same target, so
     it cannot share a cache entry with one that ran it. */
  cacheSuffix: query => (query?.probe === 'false' ? 'no-probe' : ''),
  run: (target, options) => scan(target, options),

  errors: ['invalid-prefix', 'block-too-large'],

  examples: ['8.8.8.8', '1.1.1.1', 'sharapov.biz'],

  usage: {
    usage: {
      block: 'GET /<ip>-<prefix>         — a block, e.g. /45.10.244.0-24',
      probe: 'add ?probe=false to skip the certificate sweep (passive sources only)',
      prefix: 'add ?prefix=28 to name the block width without changing the address',
    },
    checks: [
      'the registry allocation, the routed prefix and the /24 — all three, because they disagree',
      'reverse DNS for every address in the block',
      'the certificate each address presents when no SNI is sent, and the names on it',
      'reverse-IP indexes and certificate transparency for the address itself',
      'every name resolved forward again, so a stale claim is labelled rather than reported',
    ],
    limits: {
      addressesPerScan: MAX_HOSTS,
      ipv6: 'blocks are described but never walked — a /64 holds 1.8e19 addresses',
    },
  },

  health: () => ({
    reverseIpProviders: PROVIDERS.filter(provider => provider.available()).map(provider => provider.id),
    dormantProviders: dormantProviders(),
    probing: process.env.PROBE_ENABLED !== 'false',
  }),

  localize: (report, lang) => localizeReport(report, service.i18n, lang, (out, language) => {
    const { tCode } = service.i18n;

    const label = entry => ({ ...entry, statusLabel: tCode(language, 'nst', entry.status) });
    if (out.sameAddress) {
      out.sameAddress.confirmed = (out.sameAddress.confirmed || []).map(label);
      out.sameAddress.unconfirmed = (out.sameAddress.unconfirmed || []).map(label);
    }
    out.neighbors = (out.neighbors || []).map(entry => ({
      ...entry, names: (entry.names || []).map(label),
    }));

    if (out.block) {
      out.block.sourceLabel = tCode(language, 'bsrc', out.block.source);
      out.block.candidates = (out.block.candidates || []).map(candidate => ({
        ...candidate, sourceLabel: tCode(language, 'bsrc', candidate.source),
      }));
    }
    if (Array.isArray(out.incomplete)) {
      out.incompleteLabels = out.incomplete.map(code => tCode(language, 'inc', code));
    }
  }),
});

/**
 * The natural way to write a block has a slash in it, and a route takes one
 * path segment. Rather than teach the shell about two-segment targets, the
 * slash spelling is accepted here and redirected to the dash one — so
 * `curl -L .../8.8.8.0/24` works and every link still points at one canonical
 * URL.
 */
for (const prefix of ['', '/api']) {
  service.app.get(`${prefix}/:net/:len`, { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const { net, len } = req.params;
      if (!/^\d{1,3}$/.test(len) || Number(len) > 128) {
        return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Route not found.' });
      }
      const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      return reply.redirect(`${prefix}/${encodeURIComponent(`${net}-${len}`)}${search}`, 301);
    });
}

await service.start();

export { service };
