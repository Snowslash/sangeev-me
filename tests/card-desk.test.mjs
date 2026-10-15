import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('the desk leaves native touch scrolling available outside draggable cards', () => {
  const css = read('../src/styles.css');
  const desk = css.match(/\.project-window\s*\{([^}]+)\}/)?.[1] || '';
  assert.doesNotMatch(desk, /touch-action:\s*none/);
  assert.match(css.match(/\.project-selector\s*\{([^}]+)\}/)?.[1] || '', /touch-action:\s*none/);
});

test('initial-HTML evidence wraps on narrow screens without losing line breaks', () => {
  assert.match(read('../src/styles.css'), /\.no-js-fallback pre\s*\{[^}]*white-space:\s*pre-wrap/);
});

test('Card Desk retains a keyboard skip path before the shared header', () => {
  const app = read('../src/App.tsx');
  assert.match(app, /<a[^>]+className="skip-link"[^>]+href="#main-content"/);
  assert.ok(app.indexOf('className="skip-link"') < app.indexOf('<PublicEstateHeader'));
  assert.match(app, /<main[^>]+id="main-content"[^>]+tabIndex=\{-1\}/);
  const css = read('../src/styles.css');
  assert.match(css, /\.skip-link:focus/);
  assert.doesNotMatch(css.match(/\.skip-link\s*\{([^}]+)\}/)?.[1] || '', /display:\s*none|visibility:\s*hidden/);
});

test('Card Desk keeps source, dependency fixes and security policy unchanged', () => {
  const lock = JSON.parse(read('../package-lock.json'));
  assert.equal(lock.packages['node_modules/nanoid'].version, '3.3.20');
  assert.equal(lock.packages['node_modules/postcss'].version, '8.5.30');
  assert.equal(lock.packages['node_modules/source-map-js'].version, '1.2.2');
  const policy = read('../public/_headers');
  assert.match(policy, /script-src 'self'; connect-src 'none'/);
  assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval/);
  const app = read('../src/App.tsx');
  assert.doesNotMatch(app, /\bfetch\(|XMLHttpRequest|sendBeacon|<iframe|dangerouslySetInnerHTML/);
});

test('all six cards keep one canonical project destination and descriptive action', () => {
  const source = read('../src/App.tsx');
  for (const key of ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax', 'glassbox']) {
    const record = source.match(new RegExp(`${key}: \\{([\\s\\S]*?)\\n  \\}`))?.[1] || '';
    assert.match(record, new RegExp(`href: "https://${key}\\.sangeev\\.me/?"`));
    assert.match(record, /ariaLabel: "Open project: /);
    assert.match(record, /tagline: ".+"/);
  }
});
