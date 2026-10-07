import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

// Parallax initial public release, guided challenge 1. The wire is unchanged between views.
const projections = {
  'c1-000.png': '16773e7fbcdc26c44bbff7c636dc986f72d3e8c0f0735fcc209c98f53520159d',
  'c1-060.png': 'c4a7bc54ec367795594e48aeb8ef3bdbfebbd73a3d99dcca45d7628b9d71e13e',
};

test('Parallax previews the published projections and opens its existing landing page', () => {
  const app = read('../src/App.tsx');
  assert.match(app, /name: "Parallax"/);
  assert.match(app, /href: "https:\/\/parallax\.sangeev\.me\/"/);
  assert.match(app, /ariaLabel: "Open Parallax"/);
  const specimen = app.match(/case "parallax":([\s\S]*?)\n\s*\);/)?.[1] ?? '';
  assert.match(specimen, /0° view/);
  assert.match(specimen, /60° view/);
  assert.equal(specimen.match(/<img\b/g)?.length, 2);
  assert.equal(specimen.match(/width="256" height="256"/g)?.length, 2);
  assert.equal(specimen.match(/alt="[^"]+"/g)?.length, 2);
  assert.doesNotMatch(specimen, /<canvas|<iframe|<button|clinical safety|universally/i);
  assert.match(read('../README.md'), /https:\/\/parallax\.sangeev\.me\//);
});

test('Parallax image bytes and licence are preserved without a runtime dependency', () => {
  for (const [name, sha] of Object.entries(projections)) {
    const file = new URL(`../src/assets/parallax/${name}`, import.meta.url);
    assert.ok(existsSync(file), `missing published projection: ${name}`);
    const bytes = readFileSync(file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha);
    assert.equal(bytes.readUInt32BE(16), 256);
    assert.equal(bytes.readUInt32BE(20), 256);
    assert.ok(read('../src/App.tsx').includes(`./assets/parallax/${name}?no-inline`), 'Vite must emit a fingerprinted asset');
  }
  const licence = read('../public/licenses/MIT-Parallax.txt');
  assert.match(licence, /Copyright \(c\) 2026 Parallax contributors/);
  assert.match(licence, /THE SOFTWARE IS PROVIDED "AS IS"/);
});

test('Parallax remains discoverable without JavaScript', () => {
  assert.match(read('../index.html'), /<a href="https:\/\/parallax\.sangeev\.me\/">Parallax<\/a>/);
});

test('an odd final project selector fills the last mobile row', () => {
  const mobile = read('../src/styles.css').split('@media (max-width: 620px)')[1];
  assert.match(mobile, /\.project-selector:last-child:nth-child\(odd\)\s*\{[^}]*grid-column: 1 \/ -1;[^}]*border-inline-end: 0;/);
});
