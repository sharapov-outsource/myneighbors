/**
 * What arrived in the path, turned into something we are willing to look at.
 *
 * Three spellings reach this service and they mean different things:
 *
 *   8.8.8.8        an address — find its block, then its neighbours
 *   8.8.8.0-24     a block, named outright
 *   example.com    a name — resolve it first, then treat it as the address
 *
 * The dash in the block form is not a stylistic choice. A CIDR contains a
 * slash, the routes take one path segment, and `/8.8.8.0/24` is two. The dash
 * spelling is what the service links to and caches under; the slash spelling is
 * accepted at the edge and redirected here, so both work in a terminal.
 *
 * The private-address guard matters more here than anywhere else in the family.
 * Every other service connects to one host; this one walks a whole block, and
 * pointed at 10.0.0.0/8 it would be a port scanner for whatever network it
 * happens to run in.
 */

import net from 'node:net';

import { isPrivateAddress, allowPrivate } from '@sharapov/service-kit';

import { parseIp, network, formatIp } from './cidr.js';

/** Addresses walked in one scan. 256 is a /24 — the largest useful sweep. */
export const MAX_HOSTS = Number(process.env.MAX_SCAN_HOSTS || 256);

/** Shortest v4 prefix a caller may ask to be walked, derived from the cap. */
const MIN_V4_PREFIX = 32 - Math.floor(Math.log2(MAX_HOSTS));

const HOSTNAME = /^(?=.{1,253}$)([a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.)+[a-z]{2,63}$/;

/**
 * @param {string} raw    the path segment
 * @param {object} [req]  the request, read for `?prefix=`
 * @returns {{kind: string, key: string, label: string}|{error: string}}
 */
export function parseNeighborTarget(raw, req) {
  if (typeof raw !== 'string') return { error: 'invalid-host' };

  let value = raw.trim().toLowerCase();
  if (!value) return { error: 'invalid-host' };

  /* Pasting a URL in is a reasonable thing to do, and so is pasting an address
     with a port on it. */
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(value)) {
    try { value = new URL(value).hostname; } catch { return { error: 'invalid-host' }; }
  }
  value = value.replace(/\/.*$/, '').replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!value) return { error: 'invalid-host' };

  /* A dash before the prefix length, but only where it cannot be part of an
     address: `8.8.8.0-24`, `2001:db8::-48`. A hostname keeps its dashes. */
  let wanted = prefixFrom(req?.query?.prefix);
  if (wanted?.error) return wanted;

  const dashed = /^(.+)-(\d{1,3})$/.exec(value);
  if (dashed && (net.isIP(dashed[1]) || dashed[1].includes(':'))) {
    value = dashed[1];
    wanted = { prefix: Number(dashed[2]) };
  }

  if (net.isIP(value)) return addressTarget(value, wanted?.prefix);

  if (value.length > 253 || !HOSTNAME.test(value)) return { error: 'invalid-host' };

  /* A name has no address family until it resolves, so only the family-agnostic
     half of the rule can be applied here. The rest runs in the scan, once there
     is an address to apply it to — without this the name path accepted prefixes
     the address path refuses, and /example.com?prefix=200 produced a block with
     a negative size that the sweep then reported as complete. */
  if (wanted?.prefix !== undefined && wanted.prefix > 128) return { error: 'invalid-prefix' };

  return {
    kind: 'host',
    host: value,
    prefix: wanted?.prefix,
    key: keyFor(value, wanted?.prefix),
    label: labelFor(value, wanted?.prefix),
  };
}

/**
 * The prefix rule, for an address whose family is known.
 * @returns {string|null} an error code, or null when the prefix is usable
 */
export function checkPrefix(version, prefix) {
  if (prefix === undefined) return null;
  if (prefix > (version === 4 ? 32 : 128)) return 'invalid-prefix';
  /* A prefix wider than the cap cannot be walked, and quietly narrowing it
     would answer a different question from the one that was asked. */
  if (version === 4 && prefix < MIN_V4_PREFIX) return 'block-too-large';
  return null;
}

function prefixFrom(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  if (!/^\d{1,3}$/.test(String(raw))) return { error: 'invalid-prefix' };
  return { prefix: Number(raw) };
}

function addressTarget(address, prefix) {
  const ip = parseIp(address);
  if (!ip) return { error: 'invalid-host' };
  if (!allowPrivate() && isPrivateAddress(ip.text)) return { error: 'private-address' };

  const bad = checkPrefix(ip.version, prefix);
  if (bad) return { error: bad };

  return {
    kind: 'ip',
    host: ip.text,
    address: ip.text,
    version: ip.version,
    prefix,
    /* Present only when a prefix was named: without one the block is chosen
       from the registry, which takes a lookup this parser must not make. */
    block: prefix === undefined ? null : network(ip, prefix),
    key: keyFor(ip.text, prefix),
    label: labelFor(ip.text, prefix),
  };
}

/** The cache key, and the name a downloaded report is saved under. */
function keyFor(host, prefix) {
  return prefix === undefined ? host : `${host}-${prefix}`;
}

/**
 * What the address bar shows. A named block is normalised to its network
 * address, so `8.8.8.7-24` and `8.8.8.0-24` are one page rather than two.
 */
function labelFor(host, prefix) {
  if (prefix === undefined) return host;
  const ip = parseIp(host);
  if (!ip) return `${host}-${prefix}`;
  return `${formatIp(network(ip, prefix).first, ip.version)}-${prefix}`;
}
