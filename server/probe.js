/**
 * The one active step: a single TLS connection per address.
 *
 * It is worth being precise about what this does and does not do, because the
 * difference between a scanner and a nuisance is mostly a matter of restraint:
 *
 *   · one TCP connection per address, to 443, closed as soon as it has answered;
 *   · no SNI — the point is to see the certificate the server shows when nobody
 *     asked for a particular site, because that default certificate is where a
 *     shared host lists the domains it serves;
 *   · one HEAD request over that same connection, so the banner and any
 *     redirect cost nothing extra;
 *   · no payload beyond a ClientHello and a HEAD, no second port, no retry.
 *
 * The certificate is read, not trusted: `rejectUnauthorized` is off because a
 * mismatched or expired certificate is a finding here rather than an error.
 * Nothing from this connection is ever treated as proof on its own — every name
 * it yields goes through the verification stage before the report calls it real.
 */

import tls from 'node:tls';

import { pace } from '@sharapov/service-kit';

import { mapPool } from './pool.js';

const CONCURRENCY = Number(process.env.PROBE_CONCURRENCY || 12);
const TIMEOUT = Number(process.env.PROBE_TIMEOUT_MS || 6000);
const PORT = Number(process.env.PROBE_PORT || 443);

/** Names a certificate claims: the CN, plus every DNS entry in the SAN list. */
function namesOf(certificate) {
  const names = new Set();
  const cn = certificate?.subject?.CN;
  if (cn) names.add(String(cn).toLowerCase());

  for (const entry of String(certificate?.subjectaltname || '').split(',')) {
    const [kind, ...rest] = entry.trim().split(':');
    if (kind === 'DNS' && rest.length) names.add(rest.join(':').toLowerCase());
  }

  /* A wildcard cannot be verified against an address, and listing it as a site
     would be a guess. It is kept as the fact it is — the certificate covers a
     domain — and the verification stage never promotes it. */
  return [...names].filter(name => name && !name.includes(' '));
}

function parseHead(raw) {
  const text = raw.toString('latin1');
  const [head] = text.split('\r\n\r\n');
  const lines = head.split('\r\n');
  const status = /^HTTP\/[\d.]+ (\d{3})/.exec(lines[0] || '');

  const headers = {};
  for (const line of lines.slice(1)) {
    const at = line.indexOf(':');
    if (at < 1) continue;
    headers[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim();
  }

  return {
    status: status ? Number(status[1]) : undefined,
    server: headers.server,
    poweredBy: headers['x-powered-by'],
    location: headers.location,
  };
}

/** The host a redirect points at — often the only place a canonical name shows. */
function redirectHost(location) {
  if (!location) return undefined;
  try {
    return new URL(location, 'https://placeholder.invalid').hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

/**
 * One address. Resolves to null when nothing answered — a refused connection is
 * the normal state of most addresses in a block, not a failure worth reporting.
 */
export function probeAddress(address) {
  return new Promise(resolve => {
    const socket = tls.connect({
      host: address,
      port: PORT,
      /* An IP host means Node sends no SNI, which is exactly what is wanted. */
      rejectUnauthorized: false,
      ALPNProtocols: ['h2', 'http/1.1'],
      timeout: TIMEOUT,
    });

    let settled = false;
    let buffer = Buffer.alloc(0);
    let result = null;

    const finish = () => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };

    const timer = setTimeout(finish, TIMEOUT);
    timer.unref?.();

    socket.on('secureConnect', () => {
      const certificate = socket.getPeerCertificate(false) || {};
      result = {
        address,
        port: PORT,
        alpn: socket.alpnProtocol || undefined,
        protocol: socket.getProtocol() || undefined,
        certificate: certificate.subject ? {
          subject: certificate.subject?.CN || undefined,
          issuer: certificate.issuer?.O || certificate.issuer?.CN || undefined,
          validFrom: certificate.valid_from || undefined,
          validTo: certificate.valid_to || undefined,
          serial: certificate.serialNumber || undefined,
          names: namesOf(certificate),
        } : undefined,
      };

      socket.write(
        `HEAD / HTTP/1.1\r\nHost: ${address}\r\nUser-Agent: myneighbors\r\n` +
        'Accept: */*\r\nConnection: close\r\n\r\n'
      );
    });

    socket.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      /* HEAD has no body, so the headers are the whole answer. */
      if (buffer.includes('\r\n\r\n') || buffer.length > 16384) {
        if (result) {
          result.http = parseHead(buffer);
          result.http.redirectsTo = redirectHost(result.http.location);
        }
        clearTimeout(timer);
        finish();
      }
    });

    socket.on('error', () => { clearTimeout(timer); finish(); });
    socket.on('timeout', () => { clearTimeout(timer); finish(); });
    socket.on('close', () => { clearTimeout(timer); finish(); });
  });
}

/** The same probe across a block, a few connections at a time. */
export async function probeBlock(addresses) {
  const results = await mapPool(addresses, CONCURRENCY, async address => {
    await pace('tls');
    return probeAddress(address);
  });
  return results.filter(Boolean);
}
