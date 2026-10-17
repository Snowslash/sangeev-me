import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const digest = text => createHash('sha256').update(text).digest('hex');
const keys = ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax', 'glassbox'];
// Approved sangeev.me-homepage-claude-2.zip, SHA-256:
// 1fe4062891024f2b12ee05da68d1fe69bf332386173e66319de02facfeb7ba81
function previewSource() {
  assert.ok(existsSync(new URL('../src/Previews.tsx', import.meta.url)), 'the approved project diagrams must be present');
  return read('../src/Previews.tsx');
}

test('the approved six diagrams and idle illustration remain unchanged', () => {
  const source = previewSource();
  assert.equal(digest(source), 'db8f1b3bd06e939622a3acb6b6e8dc416ea9d2561336739d45a5e8c894c30515');
  const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: createRequire(import.meta.url) });
  assert.deepEqual(Object.keys(exports.previews), keys);
  const diagrams = [...Object.values(exports.previews), exports.IdlePreview].map(component => renderToStaticMarkup(createElement(component)));
  assert.equal(new Set(diagrams).size, 7);
  for (const diagram of diagrams) {
    assert.match(diagram, /<svg[^>]*viewBox="0 0 360 240"/);
    assert.doesNotMatch(diagram, /<script|<foreignObject|<image|<text|https?:/);
  }
});

test('the supplied looping preview styles and timings are preserved exactly', () => {
  const css = read('../src/styles.css');
  const start = css.indexOf('/* ── Preview window:');
  assert.ok(start >= 0, 'the preview animation stylesheet must be integrated');
  const preview = css.slice(start, css.indexOf('/* ── Cards ── */', start));
  assert.equal(digest(preview), '79c62afc62873ebee7dbe915c4468147731d3e01d5585804428551ae16d7cdb7');
  assert.match(preview, /animation-iteration-count: infinite/);
  assert.match(preview, /pv-swing 4\.2s ease-in-out infinite alternate/);
  assert.match(preview, /pv-bob 1\.6s ease-in-out infinite alternate/);
});

test('decorative previews respond to hover and focus without replacing card safeguards', () => {
  const app = read('../src/App.tsx');
  assert.match(app, /className="preview-window"\s+aria-hidden="true"/);
  assert.match(app, /const Diagram = preview \? previews\[preview\] : IdlePreview/);
  assert.match(app, /onPointerEnter=\{\(\) => showPreview\(key\)\}/);
  assert.match(app, /onFocus=\{\(\) => \{\s*focusCard\(key\);\s*showPreview\(key\);/);
  assert.match(app, /onPointerLeave=\{\(\) => showPreview\(null\)\}/);
  assert.match(app, /onBlur=\{\(\) => showPreview\(null\)\}/);
  assert.match(app, /clearTimeout\(previewTimer\.current\)/);
  assert.match(app, /onPointerCancel=\{onPointerCancel\}/);
  assert.match(app, /duration = 1300/);
  assert.match(app, /window\.location\.pathname \+ window\.location\.search/);
});

test('reduced motion makes every preview static without changing ordinary loops', () => {
  const css = read('../src/styles.css');
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /\.preview-art,\s*\.preview-art \*\s*\{ animation: none !important; \}/);
  assert.match(reduced, /\.pv-trace\s*\{ stroke-dasharray: none; \}/);
  assert.match(reduced, /\.pv-link\s*\{ stroke-dasharray: none; \}/);
});
