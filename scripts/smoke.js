/**
 * Smoke test: boots the server and exercises its routes.
 *
 * Nothing here starts a real sweep. This service opens a connection per address
 * in a block, and a smoke test that pointed it at a live network would be a
 * few hundred connections at somebody else's machines every time CI runs. So
 * the checks use malformed targets, private space, refused formats and the
 * service routes — all answered without a packet leaving the box — plus one
 * stream aimed at a name that cannot resolve, asserted only on its shape.
 * The reasoning is covered by the unit tests.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3402;
const base = `http://127.0.0.1:${PORT}`;

const server = spawn(process.execPath, ['server/index.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(PORT),
    HOSTNAME: '127.0.0.1',
    TRUST_PROXY: 'false',
    LOG_LEVEL: 'warn',
    /* The active step stays off: a smoke test must not connect to strangers. */
    PROBE_ENABLED: 'false',
    HACKERTARGET_ENABLED: 'false',
    CT_ENABLED: 'false',
    SCAN_TIMEOUT_MS: '10000',
    /* Above what the checks below spend, and below the burst at the end, so
       the limiter is exercised deliberately rather than tripped by accident. */
    RATE_SCAN_MAX: '40',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk; });
server.stderr.on('data', chunk => { serverOutput += chunk; });

const failures = [];
let checks = 0;

function check(name, condition, detail) {
  checks++;
  if (condition) return;
  failures.push(detail ? `${name} — ${detail}` : name);
}

async function waitForServer(attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(`${base}/healthz`);
      if (response.ok) return;
    } catch { /* not up yet */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('server never answered /healthz\n' + serverOutput);
}

async function run() {
  await waitForServer();

  /* ---------------- service routes ---------------- */
  const health = await (await fetch(`${base}/healthz`)).json();
  check('healthz: status', health.status === 'ok');
  check('healthz: names itself', health.service === 'myneighbors');
  check('healthz: cache stats', typeof health.cache?.entries === 'number');
  check('healthz: twelve languages', health.languages?.length === 12,
    `got ${health.languages?.length}`);
  check('healthz: reports whether probing is on', typeof health.probing === 'boolean');
  check('healthz: lists reverse-ip providers', Array.isArray(health.reverseIpProviders));

  const robots = await fetch(`${base}/robots.txt`);
  check('robots.txt', robots.ok);
  check('robots.txt: points at the sitemap', (await robots.text()).includes('Sitemap:'));

  const sitemap = await fetch(`${base}/sitemap.xml`);
  check('sitemap.xml', sitemap.ok);
  check('sitemap.xml: lists the home page', (await sitemap.text()).includes('<loc>'));

  const favicon = await fetch(`${base}/favicon.ico`);
  check('favicon.ico', favicon.ok);
  check('favicon.ico: is an icon', (favicon.headers.get('content-type') || '').includes('icon'));

  /* ---------------- the page ---------------- */
  const page = await fetch(`${base}/8.8.8.8`, {
    headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0' },
  });
  const html = await page.text();
  check('html: status', page.status === 200);
  check('html: content-type', (page.headers.get('content-type') || '').includes('text/html'));
  check('html: links app.js', html.includes('/static/app.js'));
  check('html: links its own dictionary', html.includes('/static/i18n.js'));
  check('html: links the shared dictionary', html.includes('/static/kit/i18n-common.js'));
  check('html: links the shared stylesheet', html.includes('/static/kit/base.css'));

  check('html: no placeholders left',
    !/%(ORIGIN|URL|ROBOTS|LANG|DIR|TITLE|DESCRIPTION|LOCALE|SERVICES|ANALYTICS)%/.test(html),
    (html.match(/%[A-Z]+%/) || [])[0]);
  check('html: absolute canonical', html.includes(`<link rel="canonical" href="${base}/8.8.8.8"`));
  check('html: report pages are not indexed', html.includes('content="noindex, follow"'));
  check('html: social image', html.includes(`content="${base}/static/og-image.png"`));
  check('html: manifest', html.includes('/static/site.webmanifest'));

  /* The family strip is rendered on the server, with this service marked. */
  check('html: family footer', html.includes('class="services"'));
  check('html: siblings are linked', html.includes('https://myip.sharapov.biz/'));

  /* The head is translated by the same dictionary the page uses. */
  const russian = await (await fetch(`${base}/`, {
    headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0', 'accept-language': 'ru-RU,ru;q=0.9' },
  })).text();
  check('html: honours accept-language', russian.includes('<html lang="ru"'));
  check('html: translated title', /<title>Соседи по IP/.test(russian),
    russian.match(/<title>[^<]*/)?.[0]);

  const arabic = await (await fetch(`${base}/`, {
    headers: { accept: 'text/html', 'user-agent': 'Mozilla/5.0', 'accept-language': 'ar' },
  })).text();
  check('html: right-to-left for arabic', arabic.includes('<html lang="ar" dir="rtl"'));
  check('html: home page is indexed', arabic.includes('content="index, follow"'));

  /* ---------------- console clients ---------------- */
  const usage = await fetch(`${base}/`, { headers: { 'user-agent': 'curl/8.7.1' } });
  check('curl -> json', (usage.headers.get('content-type') || '').includes('json'));
  const usageBody = await usage.json();
  check('usage: describes the api', typeof usageBody.usage?.scan === 'string');
  check('usage: documents the block form', typeof usageBody.usage?.block === 'string');
  check('usage: lists the stages',
    Array.isArray(usageBody.stages) && usageBody.stages.includes('verify'));
  check('usage: lists the family', usageBody.family?.some(entry => entry.slug === 'mydns'));
  check('usage: states the sweep limit', Number(usageBody.limits?.addressesPerScan) > 0);

  /* ---------------- input validation ---------------- */
  const badHost = await fetch(`${base}/api/not%20an%20address`);
  check('invalid target -> 400', badHost.status === 400, `status ${badHost.status}`);
  check('invalid target: error code', (await badHost.json()).error === 'invalid-host');

  const traversal = await fetch(`${base}/api/%2Fetc%2Fpasswd`);
  check('path traversal in the target -> 400', traversal.status === 400, `status ${traversal.status}`);

  /* Private space is the one input this service must never walk. */
  for (const target of ['127.0.0.1', '10.0.0.1', '192.168.1.1', '169.254.169.254', '::1']) {
    const response = await fetch(`${base}/api/${encodeURIComponent(target)}`);
    const body = await response.json();
    check(`private target ${target} refused`, response.status === 400, `status ${response.status}`);
    check(`private target ${target}: error code`, body.error === 'private-address', body.error);
  }

  /* ---------------- the block forms ---------------- */
  const dashed = await fetch(`${base}/api/10.0.0.0-24`);
  check('a block in dash form parses', (await dashed.json()).error === 'private-address');

  const slashed = await fetch(`${base}/api/8.8.8.0/24`, { redirect: 'manual' });
  check('a block with a slash redirects', slashed.status === 301, `status ${slashed.status}`);
  check('a block with a slash redirects to the dash form',
    (slashed.headers.get('location') || '').endsWith('/api/8.8.8.0-24'),
    slashed.headers.get('location'));

  const pageSlashed = await fetch(`${base}/8.8.8.0/24`, { redirect: 'manual' });
  check('the page route redirects too', pageSlashed.status === 301, `status ${pageSlashed.status}`);

  const badPrefix = await fetch(`${base}/api/10.0.0.1?prefix=xx`);
  check('a non-numeric prefix -> 400', badPrefix.status === 400);
  check('a non-numeric prefix: error code', (await badPrefix.json()).error === 'invalid-prefix');

  const wide = await fetch(`${base}/api/8.8.8.8?prefix=8`);
  check('a prefix wider than the sweep limit -> 400', wide.status === 400);
  check('a prefix wider than the sweep limit: error code',
    (await wide.json()).error === 'block-too-large');

  /* ---------------- output formats ---------------- */
  check('output=xml -> 400', (await fetch(`${base}/api/8.8.8.8?output=xml`)).status === 400);
  const yaml = await fetch(`${base}/api/10.0.0.1?output=yaml`);
  check('yaml: content-type', (yaml.headers.get('content-type') || '').includes('yaml'));
  check('yaml: body', (await yaml.text()).includes('error: private-address'));

  /* Localised error messages, in the language that was asked for. */
  const localisedError = await (await fetch(`${base}/api/10.0.0.1?lang=ru`)).json();
  check('errors are translated', /адрес/i.test(localisedError.message || ''), localisedError.message);

  /* ---------------- streaming ---------------- */
  const rejected = await fetch(`${base}/api/stream/not%20an%20address`);
  check('stream: rejects a bad target before starting', rejected.status === 400);

  const stream = await fetch(`${base}/api/stream/nothing.invalid`);
  check('stream: content-type', (stream.headers.get('content-type') || '').includes('text/event-stream'));
  const streamBody = await stream.text();
  check('stream: sends a start event', streamBody.includes('event: start'));
  check('stream: announces the stages', streamBody.includes('"stages"'));
  check('stream: ends with a report or a failure',
    streamBody.includes('event: report') || streamBody.includes('event: failed'),
    streamBody.slice(0, 200));
  /* `.invalid` is reserved and can never be delegated, so this is the
     name-does-not-resolve path. It must be reported as such rather than as an
     exception escaping the scanner. */
  check('stream: a name that cannot resolve does not crash the scanner',
    !streamBody.includes('"error":"scan-failed"'),
    streamBody.slice(-300));

  /* ---------------- security headers ---------------- */
  const csp = page.headers.get('content-security-policy') || '';
  check('csp: script-src self', csp.includes("script-src 'self'"));
  check('csp: frame-ancestors none', csp.includes("frame-ancestors 'none'"));
  check('csp: no unsafe-inline', !csp.includes('unsafe-inline'), csp);
  check('header nosniff', page.headers.get('x-content-type-options') === 'nosniff');
  check('header X-Frame-Options', page.headers.get('x-frame-options') === 'DENY');
  check('header referrer-policy', Boolean(page.headers.get('referrer-policy')));

  /* ---------------- static assets ---------------- */
  for (const file of ['styles.css', 'app.js', 'i18n.js', 'icon.svg',
    'apple-touch-icon.png', 'og-image.png', 'site.webmanifest']) {
    const response = await fetch(`${base}/static/${file}`);
    check(`static ${file}`, response.ok, `status ${response.status}`);
  }
  for (const file of ['base.css', 'i18n-common.js', 'sharapov.svg']) {
    const response = await fetch(`${base}/static/kit/${file}`);
    check(`static kit/${file}`, response.ok, `status ${response.status}`);
  }
  check('directory traversal blocked',
    [400, 403, 404].includes((await fetch(`${base}/static/..%2Fpackage.json`)).status));

  check('404 on unknown path',
    (await fetch(`${base}/foo/bar/baz`, { headers: { accept: 'application/json' } })).status === 404);
  check('404 on a two-segment path that is not a block',
    (await fetch(`${base}/foo/bar`, { headers: { accept: 'application/json' } })).status === 404);

  /* ---------------- rate limiting ---------------- */
  const codes = [];
  for (let i = 0; i < 60; i++) {
    codes.push((await fetch(`${base}/api/10.0.0.1`)).status);
  }
  check('rate limit kicks in', codes.includes(429), `codes: ${[...new Set(codes)].join(',')}`);
}

try {
  await run();
} catch (err) {
  failures.push('exception: ' + err.message);
} finally {
  server.kill('SIGTERM');
}

if (failures.length) {
  console.error(`Smoke test failed (${failures.length} of ${checks}):`);
  failures.forEach(failure => console.error('  x ' + failure));
  process.exit(1);
}

console.log(`Smoke test passed: ${checks} checks.`);
