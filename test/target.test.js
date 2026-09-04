/**
 * Turning a path segment into a target.
 *
 * The private-address guard is the reason this file is longer than the parser
 * deserves. Every other service in the family connects to one host; this one
 * walks a block, and one accepted `10.0.0.0-24` turns it into a port scanner
 * for whatever network it is deployed in.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { parseNeighborTarget, MAX_HOSTS } from '../server/target.js';

const parse = (raw, query) => parseNeighborTarget(raw, query ? { query } : undefined);

test('an address is a target, and keeps its normalised form', () => {
  const target = parse('8.8.8.8');
  assert.equal(target.kind, 'ip');
  assert.equal(target.address, '8.8.8.8');
  assert.equal(target.version, 4);
  assert.equal(target.key, '8.8.8.8');
  assert.equal(target.label, '8.8.8.8');
  assert.equal(target.block, null, 'no prefix named means the block is not decided yet');
});

test('a name is a target too, resolved later rather than here', () => {
  const target = parse('Example.COM');
  assert.equal(target.kind, 'host');
  assert.equal(target.host, 'example.com');
  assert.equal(target.key, 'example.com');
});

test('a pasted URL is stripped down to what it names', () => {
  assert.equal(parse('https://example.com/some/path?x=1').host, 'example.com');
  assert.equal(parse('http://8.8.8.8/').address, '8.8.8.8');
});

test('the dash form names a block and normalises to its network address', () => {
  const target = parse('8.8.8.7-24');
  assert.equal(target.kind, 'ip');
  assert.equal(target.address, '8.8.8.7');
  assert.equal(target.prefix, 24);
  assert.equal(target.block.cidr, '8.8.8.0/24');
  assert.equal(target.label, '8.8.8.0-24', 'one page per block, not one per address in it');
  assert.equal(target.key, '8.8.8.7-24');
});

test('a dash in a host name is not a prefix', () => {
  const target = parse('my-site.example.com');
  assert.equal(target.kind, 'host');
  assert.equal(target.host, 'my-site.example.com');
});

test('an IPv6 block can be named the same way', () => {
  const target = parse('2001:db8::1-48');
  assert.equal(target.version, 6);
  assert.equal(target.prefix, 48);
  assert.equal(target.block.cidr, '2001:db8::/48');
});

test('the prefix can also arrive as a query parameter', () => {
  assert.equal(parse('8.8.8.8', { prefix: '28' }).prefix, 28);
  assert.equal(parse('8.8.8.8', { prefix: 'xx' }).error, 'invalid-prefix');
  assert.equal(parse('8.8.8.8', { prefix: '33' }).error, 'invalid-prefix');
  assert.equal(parse('8.8.8.8', { prefix: '' }).prefix, undefined);
});

test('a prefix wider than one sweep is refused rather than quietly narrowed', () => {
  const widest = 32 - Math.floor(Math.log2(MAX_HOSTS));
  assert.equal(parse('8.8.8.8', { prefix: String(widest) }).prefix, widest);
  assert.equal(parse('8.8.8.8', { prefix: String(widest - 1) }).error, 'block-too-large');
});

test('private and reserved space is refused, in both families', () => {
  for (const address of [
    '127.0.0.1', '10.1.2.3', '192.168.0.1', '172.16.0.1', '169.254.169.254',
    '0.0.0.0', '224.0.0.1', '100.64.0.1', '::1', 'fe80::1', 'fd00::1', '::ffff:10.0.0.1',
  ]) {
    assert.equal(parse(address).error, 'private-address', address);
  }
});

test('a private block is refused before its prefix is even considered', () => {
  assert.equal(parse('10.0.0.0-24').error, 'private-address');
  assert.equal(parse('127.0.0.1', { prefix: '8' }).error, 'private-address');
});

test('the guard can be lifted for tests, and only by the environment', () => {
  const previous = process.env.ALLOW_PRIVATE_TARGETS;
  process.env.ALLOW_PRIVATE_TARGETS = 'true';
  try {
    assert.equal(parse('127.0.0.1').address, '127.0.0.1');
  } finally {
    if (previous === undefined) delete process.env.ALLOW_PRIVATE_TARGETS;
    else process.env.ALLOW_PRIVATE_TARGETS = previous;
  }
  assert.equal(parse('127.0.0.1').error, 'private-address', 'and it comes back');
});

test('junk is refused', () => {
  for (const raw of ['', '   ', 'not an address', '..', '/etc/passwd', 'a'.repeat(300), null, 42]) {
    assert.equal(parse(raw).error, 'invalid-host', String(raw));
  }
});
