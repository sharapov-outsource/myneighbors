/**
 * myneighbors client.
 *
 * A check walks a whole block — a PTR query and a TLS connection per address —
 * so the page opens an event stream and fills the progress bar as the stages go
 * by rather than staring at a spinner for half a minute. Switching language
 * repaints from the report already in memory: no second sweep, and no second
 * few hundred connections at somebody else's network.
 */
'use strict';

const byId = id => document.getElementById(id);
const DASH = '—';

/* ================================================================== *
 * Language
 * ================================================================== */

const I18N = window.I18N;
const RTL = new Set(window.RTL_LANGS || []);
const STORAGE_KEY = 'myneighbors-lang';

function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && I18N[saved]) return saved;
  } catch { /* localStorage may be unavailable */ }

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  for (const raw of candidates) {
    const tag = String(raw).toLowerCase();
    if (I18N[tag]) return tag;
    const base = tag.split('-')[0];
    if (I18N[base]) return base;
  }
  return 'en';
}

let LANG = detectLang();

function t(key, vars) {
  const dict = I18N[LANG] || I18N.en;
  let value = dict[key] ?? I18N.en[key] ?? key;
  if (vars) for (const [name, replacement] of Object.entries(vars)) {
    value = value.split('{' + name + '}').join(replacement);
  }
  return value;
}

/** Translation for a dashed code such as "in-block", or the code itself. */
function tCode(prefix, code) {
  if (!code && code !== 0) return undefined;
  const key = prefix + '_' + String(code).replace(/[-.]/g, '_');
  const dict = I18N[LANG] || I18N.en;
  return dict[key] ?? I18N.en[key] ?? String(code).replace(/-/g, ' ');
}

/* ================================================================== *
 * Rendering helpers
 * ================================================================== */

function set(id, value, state) {
  const node = byId(id);
  if (!node) return;
  const empty = value === undefined || value === null || value === '' ||
    (Array.isArray(value) && !value.length) ||
    (typeof value === 'number' && Number.isNaN(value));
  node.className = 'v' + (empty ? ' muted' : state ? ' ' + state : '');
  node.textContent = empty ? DASH : (Array.isArray(value) ? value.join(', ') : String(value));
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function flagRow(id, value, { goodIfTrue = true } = {}) {
  if (value === undefined || value === null) { set(id, t('v_unknown'), 'muted'); return; }
  set(id, value ? t('v_yes') : t('v_no'), value === goodIfTrue ? 'ok' : 'warn');
}

function tag(text, kind) {
  const element = document.createElement('span');
  element.className = 'tag' + (kind ? ' ' + kind : '');
  element.textContent = text;
  return element;
}

function skeletons() {
  document.querySelectorAll('#report .v').forEach(node => {
    node.className = 'v skeleton';
    node.textContent = '';
  });
  ['here-body', 'neighbor-body', 'candidate-body', 'unconfirmed-body', 'flag-list']
    .forEach(id => { const node = byId(id); if (node) node.innerHTML = ''; });
}

function toast(message) {
  const element = byId('toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => element.classList.remove('show'), 1900);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(t('toast_copied'));
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); toast(t('toast_copied')); }
    catch { toast(t('toast_copy_fail')); }
    area.remove();
  }
}

/* ================================================================== *
 * State
 * ================================================================== */

let REPORT = null;
let LAST_ERROR = null;
let TARGET = null;
let STREAM = null;

const STAGES = ['resolve', 'block', 'reverse', 'certificates', 'passive', 'verify', 'summary'];

/* ================================================================== *
 * Running a check
 * ================================================================== */

function setProgress(stage) {
  const box = byId('progress');
  box.hidden = false;
  const index = Math.max(0, STAGES.indexOf(stage));
  byId('progress-fill').style.width = Math.round(((index + 1) / STAGES.length) * 100) + '%';
  byId('progress-label').textContent = tCode('stage', stage);
}

function checking(on) {
  byId('btn-scan').disabled = on;
  byId('btn-rescan').disabled = on;
  if (!on) byId('progress').hidden = true;
}

function startCheck(input, { refresh = false } = {}) {
  if (!input) return;
  TARGET = input;
  REPORT = null;
  LAST_ERROR = null;

  if (STREAM) { STREAM.close(); STREAM = null; }

  byId('empty').hidden = true;
  byId('report').hidden = false;
  byId('alerts').innerHTML = '';
  byId('search-host').value = input;
  byId('hero-host').textContent = input;
  byId('hero-meta').innerHTML = '';
  byId('count-badge').className = 'grade-badge pending';
  byId('count-badge').textContent = '·';
  skeletons();
  checking(true);
  setProgress('resolve');
  updateSeoMeta();

  const url = `/api/stream/${encodeURIComponent(input)}?lang=${encodeURIComponent(LANG)}${
    refresh ? '&refresh=1' : ''}`;
  const stream = new EventSource(url);
  STREAM = stream;

  stream.addEventListener('progress', event => {
    try { setProgress(JSON.parse(event.data).stage); }
    catch { /* a malformed frame is not worth breaking the check over */ }
  });

  stream.addEventListener('report', event => {
    try { REPORT = JSON.parse(event.data); }
    catch { LAST_ERROR = { error: 'bad-response' }; }
    stream.close();
    STREAM = null;
    checking(false);
    render();
  });

  stream.addEventListener('failed', event => {
    try { LAST_ERROR = JSON.parse(event.data); }
    catch { LAST_ERROR = { error: 'scan-failed' }; }
    stream.close();
    STREAM = null;
    checking(false);
    render();
  });

  stream.onerror = () => {
    if (REPORT || LAST_ERROR) return;
    stream.close();
    STREAM = null;
    LAST_ERROR = { error: 'network' };
    checking(false);
    render();
  };
}

/* ================================================================== *
 * Rendering the report
 * ================================================================== */

/** The badge counts sites confirmed at the address — the headline answer. */
function renderHero(report) {
  const badge = byId('count-badge');
  const count = report.sameAddress?.count ?? 0;
  badge.className = 'grade-badge ' + (report.sameAddress?.cdn ? 'g-unknown'
    : count > 1 ? 'g-b' : count === 1 ? 'g-a' : 'g-unknown');
  badge.textContent = report.sameAddress?.cdn ? '∞' : String(count);

  byId('hero-host').textContent = report.address || report.input;

  const meta = byId('hero-meta');
  meta.innerHTML = '';
  if (report.host) meta.appendChild(tag(report.host));
  if (report.block?.cidr) meta.appendChild(tag(report.block.cidr));
  if (report.routing?.asn) {
    meta.appendChild(tag(`AS${report.routing.asn}${
      report.routing.asName ? ' · ' + report.routing.asName : ''}`));
  }
  if (report.registry?.country) meta.appendChild(tag(report.registry.country));
  if (report.sameAddress?.cdn) meta.appendChild(tag(t('badge_cdn'), 'warn'));
}

function renderAddress(report) {
  const same = report.sameAddress || {};
  set('a-count', same.cdn ? t('v_uncountable') : same.count, same.count ? 'ok' : 'muted');
  flagRow('a-shared', same.cdn ? null : Boolean(same.shared), { goodIfTrue: false });

  const self = (report.neighbors || []).find(entry => entry.self) || {};
  set('a-ptr', self.ptr);
  set('a-subject', self.tls?.subject);
  set('a-issuer', self.tls?.issuer);
  set('a-server', self.http?.server);
}

function renderBlock(report) {
  const block = report.block || {};
  set('b-cidr', block.cidr);
  set('b-source', block.sourceLabel || tCode('bsrc', block.source));
  set('b-range', block.first && block.last ? `${block.first} – ${block.last}` : undefined);
  set('b-swept', report.sweep?.enumerated || undefined);
  set('b-ptr', report.sweep?.withReverseDns);
  set('b-responded', report.sweep?.probed ? report.sweep?.responded : t('v_not_checked'),
    report.sweep?.probed ? undefined : 'muted');
}

function renderRegistry(report) {
  const registry = report.registry || {};
  set('r-name', registry.name);
  set('r-holder', registry.holder);
  set('r-range', registry.cidr || registry.range);
  set('r-country', registry.country);
  set('r-rir', registry.rir);
  set('r-registered', registry.registered ? registry.registered.slice(0, 10) : undefined);
  set('r-abuse', registry.abuse);
}

function renderRouting(report) {
  const routing = report.routing || {};
  set('g-asn', routing.asn ? 'AS' + routing.asn : undefined);
  set('g-name', routing.asName);
  set('g-prefix', routing.prefix);
  set('g-country', routing.country);
  set('g-allocated', routing.allocated);
}

const STATUS_CLASS = {
  confirmed: 'good', 'in-block': 'good', moved: 'legacy',
  unresolved: 'weak', wildcard: 'weak', unchecked: 'weak',
};

function sourceTags(sources) {
  return (sources || []).map(source => `<span class="chip">${esc(tCode('src', source))}</span>`).join(' ');
}

function renderHere(report) {
  const body = byId('here-body');
  body.innerHTML = '';
  const rows = report.sameAddress?.confirmed || [];

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="3" class="muted">${esc(
      report.sameAddress?.cdn ? t('empty_cdn') : t('empty_here'))}</td></tr>`;
    return;
  }

  for (const entry of rows) {
    const row = document.createElement('tr');
    row.innerHTML =
      `<td class="mono name-cell">${esc(entry.name)}</td>` +
      `<td>${sourceTags(entry.sources)}</td>` +
      `<td class="${STATUS_CLASS[entry.status] || ''}">${esc(
        entry.statusLabel || tCode('nst', entry.status))}</td>`;
    body.appendChild(row);
  }
}

function renderNeighbors(report) {
  const body = byId('neighbor-body');
  body.innerHTML = '';
  const rows = report.neighbors || [];

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="4" class="muted">${esc(t('empty_neighbors'))}</td></tr>`;
    return;
  }

  for (const entry of rows) {
    const names = (entry.names || []).map(item => item.name);
    const certNames = (entry.tls?.names || []).filter(name => !names.includes(name));
    const row = document.createElement('tr');
    row.className = entry.self ? 'self' : '';
    row.innerHTML =
      `<td class="mono">${esc(entry.address)}${entry.self
        ? ` <span class="chip">${esc(t('v_this_one'))}</span>` : ''}</td>` +
      `<td class="mono muted">${esc((entry.ptr || []).join(', ')) || DASH}</td>` +
      `<td class="name-cell">${names.map(name => `<span class="good">${esc(name)}</span>`).join('<br>') ||
        certNames.map(name => `<span class="muted">${esc(name)}</span>`).join('<br>') || DASH}</td>` +
      `<td class="muted">${esc(entry.http?.server || entry.tls?.protocol || '') || DASH}</td>`;
    body.appendChild(row);
  }
}

function renderCandidates(report) {
  const body = byId('candidate-body');
  body.innerHTML = '';
  for (const candidate of report.block?.candidates || []) {
    const row = document.createElement('tr');
    row.className = candidate.cidr === report.block?.cidr ? 'self' : '';
    row.innerHTML =
      `<td class="mono">${esc(candidate.cidr)}</td>` +
      `<td>${esc(candidate.sourceLabel || tCode('bsrc', candidate.source))}</td>` +
      `<td class="num">${candidate.size >= 0 ? candidate.size.toLocaleString(
        window.LANG_LOCALES?.[LANG] || LANG) : t('v_uncountable')}</td>` +
      `<td class="muted">${esc(candidate.holder || (candidate.asName
        ? `AS${candidate.asn} · ${candidate.asName}` : '')) || DASH}</td>`;
    body.appendChild(row);
  }
}

function renderUnconfirmed(report) {
  const body = byId('unconfirmed-body');
  body.innerHTML = '';
  const rows = report.sameAddress?.unconfirmed || [];

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="4" class="muted">${esc(t('empty_unconfirmed'))}</td></tr>`;
    return;
  }

  for (const entry of rows) {
    const row = document.createElement('tr');
    row.innerHTML =
      `<td class="mono name-cell">${esc(entry.name)}</td>` +
      `<td>${sourceTags(entry.sources)}</td>` +
      `<td class="${STATUS_CLASS[entry.status] || ''}">${esc(
        entry.statusLabel || tCode('nst', entry.status))}</td>` +
      `<td class="mono muted">${esc((entry.addresses || []).slice(0, 3).join(', ')) || DASH}</td>`;
    body.appendChild(row);
  }
}

function renderFlags(report) {
  const list = byId('flag-list');
  list.innerHTML = '';
  for (const item of report.flags || []) {
    const element = document.createElement('div');
    element.className = 'finding sev-' + (item.severity || 'info');
    element.innerHTML =
      `<div class="finding-head"><span class="finding-name">${esc(
        item.name || tCode('flag', item.id))}</span>` +
      `<span class="tag">${esc(item.severityLabel || tCode('sev', item.severity))}</span></div>` +
      `<div class="finding-body">${esc(item.description || tCode('fd', item.id) || '')}</div>`;
    list.appendChild(element);
  }
  if (!(report.flags || []).length) {
    list.innerHTML = `<p class="muted">${esc(t('empty_flags'))}</p>`;
  }
}

function renderAlerts(report) {
  const box = byId('alerts');
  box.innerHTML = '';
  if (!report.incomplete?.length) return;

  const alert = document.createElement('div');
  alert.className = 'alert warn';
  const labels = report.incompleteLabels || report.incomplete.map(code => tCode('inc', code));
  alert.innerHTML = `<strong>${esc(t('incomplete_title'))}</strong> ` +
    `${esc(t('incomplete_body'))} <em>${esc(labels.join(', '))}</em>`;
  box.appendChild(alert);
}

function renderError() {
  byId('report').hidden = true;
  byId('empty').hidden = true;
  const box = byId('alerts');
  box.innerHTML = '';
  const alert = document.createElement('div');
  alert.className = 'alert bad';
  const code = LAST_ERROR.error || 'scan-failed';
  alert.innerHTML = `<strong>${esc(tCode('err', code))}</strong>` +
    (LAST_ERROR.message ? ` ${esc(LAST_ERROR.message)}` : '');
  box.appendChild(alert);
  byId('count-badge').className = 'grade-badge g-unknown';
  byId('count-badge').textContent = '!';
}

function render() {
  applyStaticText();

  if (LAST_ERROR) { renderError(); return; }
  if (!REPORT) return;

  byId('report').hidden = false;
  renderHero(REPORT);
  renderAddress(REPORT);
  renderBlock(REPORT);
  renderRegistry(REPORT);
  renderRouting(REPORT);
  renderHere(REPORT);
  renderNeighbors(REPORT);
  renderCandidates(REPORT);
  renderUnconfirmed(REPORT);
  renderFlags(REPORT);
  renderAlerts(REPORT);
  byId('raw-json').textContent = JSON.stringify(REPORT, null, 2);
}

/* ================================================================== *
 * Static text, language switching, SEO
 * ================================================================== */

function applyStaticText() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = RTL.has(LANG) ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(node => {
    node.textContent = t(node.dataset.i18n);
  });
  byId('search-host').placeholder = t('ph_host');
  byId('search-host').setAttribute('aria-label', t('hero_label'));
  byId('lang').setAttribute('aria-label', t('lang_aria'));
  byId('api-hint').innerHTML = t('api_hint', {
    origin: location.origin, example: '8.8.8.8',
  });
  if (!TARGET) byId('hero-host').textContent = t('no_target');
  if (!REPORT && !LAST_ERROR) byId('count-badge').textContent = '·';
}

function updateSeoMeta() {
  const title = TARGET ? `${TARGET} — ${t('title_short')}` : t('title');
  document.title = title;
  for (const [id, value] of [
    ['meta-description', t('subtitle')], ['og-title', title], ['twitter-title', title],
    ['og-description', t('subtitle')], ['twitter-description', t('subtitle')],
  ]) {
    const node = byId(id);
    if (node) node.setAttribute('content', value);
  }
  const canonical = byId('link-canonical');
  if (canonical) canonical.href = location.origin + (TARGET ? '/' + encodeURIComponent(TARGET) : '/');
}

function buildLanguageSelect() {
  const select = byId('lang');
  select.innerHTML = '';
  for (const code of Object.keys(I18N)) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = window.LANG_NAMES?.[code] || code;
    if (code === LANG) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener('change', () => {
    LANG = select.value;
    try { localStorage.setItem(STORAGE_KEY, LANG); } catch { /* private mode */ }
    render();
    updateSeoMeta();
  });
}

function buildExamples() {
  const box = byId('examples');
  box.innerHTML = '';
  for (const example of ['8.8.8.8', '1.1.1.1', 'sharapov.biz']) {
    const button = document.createElement('button');
    button.textContent = example;
    button.addEventListener('click', () => go(example));
    box.appendChild(button);
  }
}

/* ================================================================== *
 * Wiring
 * ================================================================== */

function go(input) {
  const clean = String(input || '').trim().toLowerCase().replace(/\//g, '-');
  if (!clean) return;
  history.pushState({ input: clean }, '', '/' + encodeURIComponent(clean));
  startCheck(clean);
}

byId('search-form').addEventListener('submit', event => {
  event.preventDefault();
  go(byId('search-host').value);
});

byId('btn-rescan').addEventListener('click', () => {
  if (TARGET) startCheck(TARGET, { refresh: true });
});

byId('btn-copy-json').addEventListener('click', () => {
  if (REPORT) copyText(JSON.stringify(REPORT, null, 2));
});

byId('btn-save-json').addEventListener('click', () => {
  if (!REPORT) return;
  const blob = new Blob([JSON.stringify(REPORT, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `myneighbors-${REPORT.input}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

window.addEventListener('popstate', () => {
  const path = decodeURIComponent(location.pathname.replace(/^\//, ''));
  if (path) startCheck(path);
});

buildLanguageSelect();
buildExamples();
applyStaticText();
updateSeoMeta();

const initial = decodeURIComponent(location.pathname.replace(/^\//, ''));
if (initial) startCheck(initial);
