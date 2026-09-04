/**
 * Names that can be found without touching the address at all.
 *
 * DNS answers "where does this name point" and has no question for the other
 * direction, so "which sites are on this address" is always answered from
 * somebody's index rather than from the protocol. Three kinds exist and this
 * module keeps them apart, because they are not equally trustworthy:
 *
 *   · reverse-IP services — an index somebody else built by resolving a lot of
 *     names. Coverage is good and freshness is nobody's promise;
 *   · certificate transparency — every certificate ever issued, searchable by
 *     name. It cannot be queried by address, so it is used to widen a name
 *     already found rather than to discover one;
 *   · the caller's own API keys, when a deployment has them. Shodan and
 *     SecurityTrails answer this question properly and neither is free.
 *
 * Nothing here is believed. Every name leaves this module as a candidate and
 * the verification stage decides whether it is currently served by the address.
 */

import { getJson, USER_AGENT } from './upstream.js';
import { pace } from '@sharapov/service-kit';

const CT_LIMIT = Number(process.env.CT_NAME_LIMIT || 200);
const CT_APEX_LIMIT = Number(process.env.CT_APEX_LIMIT || 3);

const enabled = (name, fallback) => (process.env[name] ?? String(fallback)) !== 'false';

/* ------------------------------------------------------------------ *
 * Reverse-IP providers
 * ------------------------------------------------------------------ */

async function getText(url, { timeout = 8000 } = {}) {
  await pace('http');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'text/plain', 'user-agent': USER_AGENT },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const clean = names => [...new Set((names || [])
  .map(name => String(name || '').trim().toLowerCase().replace(/\.$/, ''))
  .filter(name => /^[a-z0-9_*.-]+\.[a-z]{2,63}$/.test(name)))];

/**
 * The providers, in the order they are tried. `key` names the environment
 * variable that switches one on; a provider without one is free to use and can
 * be turned off instead.
 */
export const PROVIDERS = [
  {
    id: 'hackertarget',
    key: null,
    available: () => enabled('HACKERTARGET_ENABLED', true),
    async fetch(address) {
      const body = await getText(`https://api.hackertarget.com/reverseiplookup/?q=${address}`);
      /* The free tier answers with a plain sentence rather than a status code,
         and the two kinds of sentence mean opposite things: a quota refusal is
         a source that did not answer, an empty result is a source that did.
         Reported the same way, the first one would quietly read as "nothing is
         hosted here". */
      if (!body) return null;
      if (/api count exceeded|^\s*error/i.test(body)) return null;
      if (/no dns [a-z]+ records|no records found/i.test(body)) return [];
      return clean(body.split('\n'));
    },
  },
  {
    id: 'shodan',
    key: 'SHODAN_API_KEY',
    available: () => Boolean(process.env.SHODAN_API_KEY),
    async fetch(address) {
      const data = await getJson(
        `https://api.shodan.io/shodan/host/${address}?key=${encodeURIComponent(process.env.SHODAN_API_KEY)}`);
      return clean([...(data?.hostnames || []), ...(data?.domains || [])]);
    },
  },
  {
    id: 'securitytrails',
    key: 'SECURITYTRAILS_API_KEY',
    available: () => Boolean(process.env.SECURITYTRAILS_API_KEY),
    async fetch(address) {
      await pace('http');
      try {
        const response = await fetch('https://api.securitytrails.com/v1/domains/list?include_ips=false', {
          method: 'POST',
          headers: {
            apikey: process.env.SECURITYTRAILS_API_KEY,
            'content-type': 'application/json',
            'user-agent': USER_AGENT,
          },
          body: JSON.stringify({ filter: { ipv4: address } }),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return clean((data?.records || []).map(record => record.hostname));
      } catch {
        return [];
      }
    },
  },
  {
    id: 'viewdns',
    key: 'VIEWDNS_API_KEY',
    available: () => Boolean(process.env.VIEWDNS_API_KEY),
    async fetch(address) {
      const data = await getJson('https://api.viewdns.info/reverseip/' +
        `?host=${address}&t=1&apikey=${encodeURIComponent(process.env.VIEWDNS_API_KEY)}&output=json`);
      return clean((data?.response?.domains || []).map(entry => entry.name || entry));
    },
  },
];

/**
 * Every provider that is switched on, asked in parallel.
 * @returns {Promise<{names: Map<string, string[]>, used: string[], failed: string[]}>}
 */
export async function reverseIp(address) {
  const active = PROVIDERS.filter(provider => provider.available());
  const names = new Map();
  const used = [];
  const failed = [];

  await Promise.all(active.map(async provider => {
    let found;
    try {
      found = await provider.fetch(address);
    } catch {
      failed.push(provider.id);
      return;
    }
    if (!found) { failed.push(provider.id); return; }
    used.push(provider.id);
    for (const name of found) {
      if (!names.has(name)) names.set(name, []);
      names.get(name).push(provider.id);
    }
  }));

  return { names, used, failed };
}

/** Providers a deployment could switch on but has not. */
export function dormantProviders() {
  return PROVIDERS.filter(provider => provider.key && !provider.available()).map(provider => provider.id);
}

/* ------------------------------------------------------------------ *
 * Certificate transparency
 * ------------------------------------------------------------------ */

/** example.co.uk → example.co.uk; a.b.example.com → example.com. Good enough. */
const MULTI = /\.(co|com|net|org|gov|edu|ac|or|ne|in)\.[a-z]{2}$/;

export function apexOf(name) {
  const parts = String(name || '').replace(/^\*\./, '').split('.');
  if (parts.length < 3) return parts.join('.');
  return MULTI.test(name) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
}

/**
 * Sibling names of the domains already found, out of the public CT logs.
 *
 * This widens rather than discovers: a shared host that presented one name is
 * very likely serving the rest of that domain's certificates too, and each
 * candidate still has to survive verification before the report shows it.
 */
export async function expandFromCt(names) {
  if (!enabled('CT_ENABLED', true)) return { names: new Map(), used: false };

  const apexes = [...new Set(names.map(apexOf).filter(Boolean))].slice(0, CT_APEX_LIMIT);
  const found = new Map();
  let used = false;

  for (const apex of apexes) {
    const rows = await getJson(`https://crt.sh/?q=${encodeURIComponent('%.' + apex)}&output=json`,
      { timeout: 12000 });
    if (!Array.isArray(rows)) continue;
    used = true;

    for (const row of rows) {
      for (const candidate of clean(String(row?.name_value || '').split('\n'))) {
        if (candidate.startsWith('*.')) continue;      // a wildcard is not a site
        if (found.size >= CT_LIMIT) break;
        if (!found.has(candidate)) found.set(candidate, ['ct']);
      }
    }
  }

  return { names: found, used };
}
