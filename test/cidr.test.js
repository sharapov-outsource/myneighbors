/**
 * The address arithmetic. Everything else in this service is built on it being
 * right, and the enumeration guard is the part that keeps a mistake here from
 * turning into a very large number of outbound connections.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { isPrivateAddress } from '@sharapov/service-kit';

import { parseIp, formatIp, parseCidr, network, contains, enumerate, arpaName }
  from '../server/cidr.js';

test('parses dotted quads and rejects what is not one', () => {
  assert.equal(parseIp('8.8.8.8').text, '8.8.8.8');
  assert.equal(parseIp('0.0.0.0').version, 4);
  assert.equal(parseIp('255.255.255.255').text, '255.255.255.255');
  for (const bad of ['256.1.1.1', '1.2.3', '1.2.3.4.5', 'example.com', '', null]) {
    assert.equal(parseIp(bad), null, String(bad));
  }
});

test('parses IPv6 in every spelling it actually turns up in', () => {
  assert.equal(parseIp('2001:db8::1').text, '2001:db8::1');
  assert.equal(parseIp('::1').text, '::1');
  assert.equal(parseIp('::').text, '::');
  assert.equal(parseIp('2001:0db8:0000:0000:0000:0000:0000:0001').text, '2001:db8::1');
  assert.equal(parseIp('2a00:1450:4010:c07::8a').version, 6);
  for (const bad of ['2001:db8:::1', 'gggg::1', '2001:db8:1:2:3:4:5:6:7']) {
    assert.equal(parseIp(bad), null, String(bad));
  }
});

test('an IPv4-mapped address keeps its dotted tail', () => {
  const mapped = parseIp('::ffff:1.2.3.4');
  assert.equal(mapped.version, 6);
  assert.equal(mapped.text, '::ffff:1.2.3.4');
  assert.equal(formatIp(mapped.bits, 6), mapped.text);

  /* Not cosmetic: the shared private-address guard recognises these by the
     dotted tail, and printing ::ffff:102:304 instead sent every IPv4-mapped
     address down its "unknown, therefore private" branch. */
  assert.equal(isPrivateAddress(parseIp('::ffff:8.8.8.8').text), false);
  assert.equal(isPrivateAddress(parseIp('::ffff:10.0.0.1').text), true);
});

test('RFC 5952 compression: the longest run of zeroes, leftmost on a tie', () => {
  assert.equal(parseIp('2001:0:0:1:0:0:0:1').text, '2001:0:0:1::1');
  assert.equal(parseIp('1:0:0:1:0:0:1:1').text, '1::1:0:0:1:1');
});

test('a network is the address masked down, and its size follows the prefix', () => {
  const block = parseCidr('8.8.8.7/24');
  assert.equal(block.cidr, '8.8.8.0/24');
  assert.equal(block.network, '8.8.8.0');
  assert.equal(block.broadcast, '8.8.8.255');
  assert.equal(block.size, 256n);

  assert.equal(parseCidr('10.0.0.1/32').size, 1n);
  assert.equal(parseCidr('10.0.0.1/0').cidr, '0.0.0.0/0');
  assert.equal(parseCidr('2001:db8::/64').size, 18446744073709551616n);
});

test('a bare address is a host prefix', () => {
  assert.equal(parseCidr('8.8.8.8').cidr, '8.8.8.8/32');
  assert.equal(parseCidr('2001:db8::1').cidr, '2001:db8::1/128');
});

test('a prefix longer than the address family is refused', () => {
  assert.equal(parseCidr('8.8.8.8/33'), null);
  assert.equal(parseCidr('2001:db8::/129'), null);
});

test('a prefix that is not a number is refused rather than thrown on', () => {
  for (const bad of ['1.2.3.4/2a', '1.2.3.4/x', '1.2.3.4/', '1.2.3.4/-1', '1.2.3.4/ 24']) {
    assert.equal(parseCidr(bad), null, bad);
  }
});

test('containment is exclusive to the family', () => {
  const block = parseCidr('8.8.8.0/24');
  assert.equal(contains(block, parseIp('8.8.8.0')), true);
  assert.equal(contains(block, parseIp('8.8.8.255')), true);
  assert.equal(contains(block, parseIp('8.8.9.0')), false);
  assert.equal(contains(block, parseIp('2001:db8::1')), false);
});

test('enumeration stops rather than trying to walk what cannot be walked', () => {
  const small = enumerate(parseCidr('8.8.8.0/28'));
  assert.equal(small.length, 16);
  assert.equal(small[0], '8.8.8.0');
  assert.equal(small[15], '8.8.8.15');

  assert.equal(enumerate(parseCidr('8.8.0.0/16')), null, 'a /16 is past the default cap');
  assert.equal(enumerate(parseCidr('2001:db8::/64')), null, 'a /64 can never be walked');
  assert.equal(enumerate(parseCidr('8.8.8.0/24')).length, 256);
});

test('the enumeration cap is the caller’s to set', () => {
  assert.equal(enumerate(parseCidr('8.8.8.0/24'), 16), null);
  assert.equal(enumerate(parseCidr('8.8.8.0/28'), 16).length, 16);
});

test('reverse names are built in the order the zone wants them', () => {
  assert.equal(arpaName(parseIp('8.8.4.4')), '4.4.8.8.in-addr.arpa');
  assert.equal(arpaName(parseIp('1.2.3.4')), '4.3.2.1.in-addr.arpa');
  const v6 = arpaName(parseIp('2001:db8::1'));
  assert.ok(v6.endsWith('.ip6.arpa'));
  assert.equal(v6.split('.').length, 34, 'thirty-two nibbles plus ip6.arpa');
  assert.ok(v6.startsWith('1.0.0.0.'));
});
