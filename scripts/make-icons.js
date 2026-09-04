/**
 * Draws myneighbors' icons. The glyph is a block of addresses — a three by
 * three grid — with the middle one carrying the accent: the address you asked
 * about, and the neighbours around it.
 *
 *   node scripts/make-icons.js
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { makeIcons, roundedRect } from '@sharapov/service-kit/make-icons';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

/** Coordinates are the same 1024-unit grid public/icon.svg is drawn on. */
const CELL = 168;
const GAP = 60;
const ORIGIN = (1024 - (CELL * 3 + GAP * 2)) / 2;
const RADIUS = 52;

const CELLS = [];
for (let row = 0; row < 3; row++) {
  for (let column = 0; column < 3; column++) {
    CELLS.push({
      left: ORIGIN + column * (CELL + GAP),
      top: ORIGIN + row * (CELL + GAP),
      kind: row === 1 && column === 1 ? 'accent' : 'paper',
    });
  }
}

function glyph(at, x, y) {
  for (const { left, top, kind } of CELLS) {
    const inside = roundedRect(
      x, y,
      at(left + CELL / 2), at(top + CELL / 2),
      at(CELL / 2), at(CELL / 2), at(RADIUS)) <= 0;
    if (inside) return kind;
  }
  return null;
}

export { glyph, CELLS, CELL, RADIUS };

makeIcons({ publicDir: PUBLIC_DIR, glyph });
