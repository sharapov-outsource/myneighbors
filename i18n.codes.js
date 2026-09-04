/**
 * Every code this service can put in a report.
 *
 * Flag identifiers are read out of the source so the list cannot go stale —
 * except for the pair scan.js picks between with a ternary, which no regular
 * expression can see. Those are listed by hand, next to the reason.
 */

import path from 'node:path';
import { codesFrom } from '@sharapov/service-kit/check-i18n';

import { STAGES } from './server/scan.js';

/** Chosen as `flag(version === 6 ? … : …)`, so they cannot be extracted. */
const EITHER_OR = ['block-not-enumerable', 'block-too-large'];

export default function codes(root) {
  const server = file => path.join(root, 'server', file);

  const flags = [
    ...codesFrom(server('scan.js'), /flag\('([a-z0-9-]+)'/g),
    ...EITHER_OR,
  ];

  /* Provider identifiers double as the name of the source a name came from,
     so the labels are checked against the registry rather than a copy of it. */
  const providers = codesFrom(server('passive.js'), /^\s{4}id: '([a-z0-9-]+)'/gm);

  return {
    flag: flags,
    fd: flags,
    stage: STAGES,
    nst: ['confirmed', 'in-block', 'moved', 'unresolved', 'wildcard', 'unchecked'],
    bsrc: ['registry', 'routing', 'conventional', 'requested'],
    src: ['ptr', 'certificate', 'redirect', 'ct', ...providers],
    inc: ['registry', 'routing', 'sweep', 'certificates', 'reverse-ip', 'verification-truncated'],
    err: [
      'invalid-host', 'domain-expected', 'invalid-port', 'port-not-allowed', 'dns-failed',
      'private-address', 'unreachable', 'scan-timeout', 'stage-timeout', 'scan-failed',
      'busy', 'bad-output', 'network', 'bad-response', 'timeout',
      'invalid-prefix', 'block-too-large',
    ],
    sev: ['critical', 'high', 'medium', 'low', 'info'],
    st: ['ok', 'safe', 'warning', 'weak', 'missing', 'unknown', 'partial', 'failed', 'info', 'vulnerable'],
  };
}
