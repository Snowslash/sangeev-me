import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const specimen = () => read('../src/App.tsx').match(/case "glassbox":([\s\S]*?)\n\s*\);/)?.[1] ?? '';

test('Glassbox opens its project overview, not a forced first lesson', () => {
  const record = read('../src/App.tsx').match(/glassbox: \{([\s\S]*?)\n  \}/)?.[1] ?? '';
  assert.match(record, /name: "Glassbox"/);
  assert.match(record, /href: "https:\/\/glassbox\.sangeev\.me\/"/);
  assert.match(record, /ariaLabel: "Open project: Glassbox"/);
  assert.match(record, /Predict what happens, watch a recorded physiology experiment, then see what changed and why\./);
});

test('Glassbox uses rounded observations from the recorded fictional blood-loss run', () => {
  const panel = specimen();
  for (const text of ['Before blood loss', 'At 550 s', 'Blood volume', 'Mean arterial pressure', '5,487 mL', '4,685 mL', '95.3 mmHg', '94.2 mmHg']) {
    assert.ok(panel.includes(text), `missing recorded observation: ${text}`);
  }
  assert.equal(panel.match(/className="op-fact"/g)?.length, 4);
  assert.doesNotMatch(panel, /<(?:img|canvas|iframe|button|input|select)\b/);
  assert.doesNotMatch(panel, /\b(?:safe|validated|live simulation|patient)\b/i);
});

test('Glassbox remains available in the initial HTML and emitted fallback', () => {
  const html = process.env.LANDING_HTML ? readFileSync(process.env.LANDING_HTML, 'utf8') : read('../index.html');
  assert.match(html, /<a href="https:\/\/glassbox\.sangeev\.me\/">Glassbox<\/a>/);
  assert.match(html, /Predict what happens, watch a recorded physiology experiment, then see what changed and why\./);
  assert.doesNotMatch(html, /project-links/);
});

test('the static observations retain a pinned source and their interpretation boundary', () => {
  const readme = read('../README.md');
  assert.match(readme, /https:\/\/github\.com\/Snowslash\/glassbox\/blob\/db2aaec7ff7725d9aaa187c5fc416d3d8930b2e4\/evidence\/engine\/lesson-data\.json/);
  assert.match(readme, /fictional/);
  assert.match(readme, /550 s/);
  assert.match(readme, /not evidence of a causal mechanism/);
});
