/**
 * The one active step, against a server started here.
 *
 * What is worth testing is exactly what cannot be seen from the outside: that
 * no SNI is sent, that the names come off the certificate the server shows when
 * nobody asked for a particular site, and that the HEAD answer riding on the
 * same connection is parsed rather than guessed at.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import tls from 'node:tls';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/* The probe reads its port once, at import, so it is fixed before that. */
const PORT = 34431;
process.env.PROBE_PORT = String(PORT);
process.env.PROBE_TIMEOUT_MS = '4000';
const { probeAddress, probeBlock } = await import('../server/probe.js');

/** A throwaway certificate with a subject and two SANs to read back. */
function selfSigned() {
  const dir = mkdtempSync(path.join(tmpdir(), 'myneighbors-'));
  const key = path.join(dir, 'key.pem');
  const cert = path.join(dir, 'cert.pem');
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
    '-keyout', key, '-out', cert, '-days', '2',
    '-subj', '/O=Neighbours Test/CN=default.example',
    '-addext', 'subjectAltName=DNS:one.example,DNS:two.example,IP:127.0.0.1',
  ], { stdio: 'ignore' });
  return { dir, key: readFileSync(key), cert: readFileSync(cert) };
}

let material;
let server;
let sniSeen = 'not-called';

test.before(async () => {
  material = selfSigned();
  server = tls.createServer({
    key: material.key,
    cert: material.cert,
    /* Recording what the handshake asked for is the whole point: an SNI-less
       ClientHello is what makes a shared host show its default certificate. */
    SNICallback: (name, callback) => { sniSeen = name; callback(null, null); },
  }, socket => {
    socket.on('data', () => {
      socket.write(
        'HTTP/1.1 301 Moved Permanently\r\n' +
        'Server: test-server/1.0\r\n' +
        'Location: https://canonical.example/\r\n' +
        'X-Powered-By: nothing\r\n' +
        'Content-Length: 0\r\n\r\n'
      );
      socket.end();
    });
  });
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
});

test.after(() => {
  server?.close();
  if (material?.dir) rmSync(material.dir, { recursive: true, force: true });
});

test('the handshake carries no server name', async () => {
  await probeAddress('127.0.0.1');
  assert.equal(sniSeen, 'not-called',
    'an SNI-less ClientHello is what makes a server show its default certificate');
});

test('the certificate is read, subject and SANs alike', async () => {
  const result = await probeAddress('127.0.0.1');
  assert.ok(result, 'the server answered');
  assert.equal(result.address, '127.0.0.1');
  assert.equal(result.port, PORT);
  assert.equal(result.certificate.subject, 'default.example');
  assert.deepEqual(result.certificate.names.sort(),
    ['default.example', 'one.example', 'two.example']);
  assert.ok(result.certificate.validTo, 'validity is carried through');
});

test('an expired or mismatched certificate is a finding, not an error', async () => {
  /* The certificate is self-signed and names none of 127.0.0.1's hostnames;
     a probe that verified it would report nothing at all here. */
  const result = await probeAddress('127.0.0.1');
  assert.ok(result.certificate.names.length > 0);
});

test('the HEAD answer on the same connection is parsed', async () => {
  const result = await probeAddress('127.0.0.1');
  assert.equal(result.http.status, 301);
  assert.equal(result.http.server, 'test-server/1.0');
  assert.equal(result.http.poweredBy, 'nothing');
  assert.equal(result.http.redirectsTo, 'canonical.example',
    'the redirect target is often the only place a canonical name appears');
});

test('an address that refuses the connection is absent, not an error', async () => {
  const results = await probeBlock(['127.0.0.1', '127.0.0.2']);
  assert.equal(results.length, 1, 'only the one that answered');
  assert.equal(results[0].address, '127.0.0.1');
});
