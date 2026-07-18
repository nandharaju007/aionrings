#!/usr/bin/env node
/**
 * OG image budget: every public/og-*.jpg must be 1200x630 and under 300 KB.
 * Uses a tiny inline JPEG SOF parser to avoid a `sharp` dependency in CI.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIR = 'public';
const REQUIRED_W = 1200;
const REQUIRED_H = 630;
const MAX_BYTES = 300 * 1024;

function readJpegDimensions(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG');
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error(`bad marker at ${i}`);
    // Skip fill bytes
    while (buf[i] === 0xff) i++;
    const marker = buf[i++];
    // SOF0..SOF15 excluding DHT(0xC4), DAC(0xCC), DNL(0xDC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      // segment length (2) then precision (1) then height (2) then width (2)
      const h = buf.readUInt16BE(i + 3);
      const w = buf.readUInt16BE(i + 5);
      return { width: w, height: h };
    }
    // Standalone markers with no payload
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const segLen = buf.readUInt16BE(i);
    i += segLen;
  }
  throw new Error('SOF not found');
}

const failures = [];
const files = readdirSync(DIR).filter((f) => /^og-.*\.jpe?g$/i.test(f));
if (files.length === 0) {
  console.error('No og-*.jpg files found in public/.');
  process.exit(1);
}

for (const file of files) {
  const full = join(DIR, file);
  const bytes = statSync(full).size;
  const buf = readFileSync(full);
  let dims;
  try {
    dims = readJpegDimensions(buf);
  } catch (err) {
    failures.push(`${file}: unreadable (${err.message})`);
    continue;
  }
  const kb = (bytes / 1024).toFixed(1);
  const ok = dims.width === REQUIRED_W && dims.height === REQUIRED_H && bytes <= MAX_BYTES;
  console.log(
    `${ok ? '✓' : '✗'} ${file}  ${dims.width}x${dims.height}  ${kb} KB`,
  );
  if (dims.width !== REQUIRED_W || dims.height !== REQUIRED_H) {
    failures.push(`${file}: expected ${REQUIRED_W}x${REQUIRED_H}, got ${dims.width}x${dims.height}`);
  }
  if (bytes > MAX_BYTES) {
    failures.push(`${file}: ${kb} KB exceeds ${MAX_BYTES / 1024} KB budget`);
  }
}

if (failures.length) {
  console.error(`\n✗ OG image budget failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\n✓ ${files.length} OG image(s) within budget.`);