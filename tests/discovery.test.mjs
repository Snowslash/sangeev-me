import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('every project action retains its visible phrase in the accessible name', () => {
  const source = read('../src/App.tsx');
  const names = [...source.matchAll(/ariaLabel: "([^"]+)"/g)].map(m => m[1]);
  assert.equal(names.length, 6);
  for (const name of names) assert.match(name, /^Open project: .+/, name);
});

test('all six public projects have ordinary initial HTML links', () => {
  const html = read('../index.html');
  for (const host of ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax', 'glassbox']) {
    assert.match(html, new RegExp(`<a[^>]+href="https://${host}\\.sangeev\\.me/?"`), host);
  }
});

test('the project window keeps its action without a duplicate link directory', () => {
  const source = read('../src/App.tsx');
  assert.doesNotMatch(source, /project-links|aria-label="Project pages"/);
  assert.doesNotMatch(read('../src/styles.css'), /\.project-links/);
  assert.match(source, /className="estate-primary-action stage-link" href=\{project\.href\}/);
  assert.match(source, /aria-pressed=\{selectedProject === key\}/);
});
