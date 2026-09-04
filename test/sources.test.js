/**
 * The two pieces of source handling that are decisions rather than plumbing:
 * which providers a deployment will actually ask, and how a name is reduced to
 * the domain whose certificate history is worth widening.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { PROVIDERS, dormantProviders, apexOf } from '../server/passive.js';
import { membership } from '../server/block.js';
import { parseCidr } from '../server/cidr.js';

function withEnv(values, body) {
  const previous = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return body();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const byId = id => PROVIDERS.find(provider => provider.id === id);

test('a keyed provider is asked only when its key is set', () => {
  withEnv({ SHODAN_API_KEY: undefined }, () => {
    assert.equal(byId('shodan').available(), false);
    assert.ok(dormantProviders().includes('shodan'));
  });
  withEnv({ SHODAN_API_KEY: 'x' }, () => {
    assert.equal(byId('shodan').available(), true);
    assert.ok(!dormantProviders().includes('shodan'));
  });
});

test('a free provider is on unless a deployment turns it off', () => {
  withEnv({ HACKERTARGET_ENABLED: undefined }, () => {
    assert.equal(byId('hackertarget').available(), true);
  });
  withEnv({ HACKERTARGET_ENABLED: 'false' }, () => {
    assert.equal(byId('hackertarget').available(), false);
    assert.ok(!dormantProviders().includes('hackertarget'),
      'switched off on purpose is not the same as waiting for a key');
  });
});

test('every provider has an identifier the dictionary can label', () => {
  for (const provider of PROVIDERS) {
    assert.match(provider.id, /^[a-z0-9-]+$/);
    assert.equal(typeof provider.fetch, 'function');
  }
  assert.equal(new Set(PROVIDERS.map(p => p.id)).size, PROVIDERS.length, 'identifiers are unique');
});

test('the apex is what certificate history is worth widening from', () => {
  assert.equal(apexOf('example.com'), 'example.com');
  assert.equal(apexOf('www.example.com'), 'example.com');
  assert.equal(apexOf('a.b.c.example.com'), 'example.com');
  assert.equal(apexOf('*.example.com'), 'example.com');
  assert.equal(apexOf('shop.example.co.uk'), 'example.co.uk');
  assert.equal(apexOf('example.co.uk'), 'example.co.uk');
});

test('membership says which of the candidate blocks an address falls in', () => {
  const candidates = [
    { ...parseCidr('8.8.8.0/28'), source: 'registry' },
    { ...parseCidr('8.8.8.0/24'), source: 'conventional' },
    { ...parseCidr('8.8.0.0/16'), source: 'routing' },
  ];
  assert.deepEqual(membership(candidates, '8.8.8.1'), ['registry', 'conventional', 'routing']);
  assert.deepEqual(membership(candidates, '8.8.8.200'), ['conventional', 'routing']);
  assert.deepEqual(membership(candidates, '8.8.9.1'), ['routing']);
  assert.deepEqual(membership(candidates, '9.9.9.9'), []);
  assert.deepEqual(membership(candidates, 'nonsense'), []);
});
