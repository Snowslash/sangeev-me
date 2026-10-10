import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('every project action retains its visible phrase in the accessible name', () => {
  const source = read('../src/App.tsx');
  const names = [...source.matchAll(/ariaLabel: "([^"]+)"/g)].map(m => m[1]);
  assert.equal(names.length, 5);
  for (const name of names) assert.match(name, /^Open project: .+/, name);
});

test('all five public projects have ordinary initial HTML links', () => {
  const html = read('../index.html');
  for (const host of ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax']) {
    assert.match(html, new RegExp(`<a[^>]+href="https://${host}\\.sangeev\\.me/?"`), host);
  }
});

test('project links also remain available without switching the rendered selector', () => {
  const source = read('../src/App.tsx');
  assert.match(source, /<nav className="project-links" aria-label="Project pages">[\s\S]*?projectOrder\.map[\s\S]*?<a[^>]+href=\{projects\[key\]\.href\}/);
});
