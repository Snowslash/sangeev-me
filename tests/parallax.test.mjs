import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const parallaxSpecimen = () => read('../src/App.tsx').match(/case "parallax":([\s\S]*?)\n\s*\);/)?.[1] ?? '';

// Guided challenge c1: the same fixed wire, viewed at 0° and 60°.
// These observations concern its projection, not geometric containment or safety.
test('Parallax uses the shared text hinge for two views of the same fixed wire', () => {
  const specimen = parallaxSpecimen();
  assert.match(specimen, /className="hinge"/);
  assert.match(specimen, /className="hinge-cause"/);
  assert.match(specimen, /className="hinge-effect"/);
  assert.match(specimen, /className="hinge-arrow" aria-hidden="true">→/);
  assert.match(specimen, /className="hinge-label">First view<\/span>/);
  assert.match(specimen, /className="hinge-label">Additional view<\/span>/);
  assert.equal(specimen.match(/className="op-facts"/g)?.length, 2);
  assert.equal(specimen.match(/className="op-fact"/g)?.length, 4);
  assert.match(specimen, /<small>View<\/small><strong>0°<\/strong>/);
  assert.match(specimen, /<small>Tip<\/small><strong>Within the outline<\/strong>/);
  assert.match(specimen, /<small>View<\/small><strong>60°<\/strong>/);
  assert.match(specimen, /<small>Tip<\/small><strong>Beyond the outline<\/strong>/);
  assert.doesNotMatch(specimen, /<(?:img|picture|canvas|svg|iframe|button|input|select|textarea)\b/i);
  assert.doesNotMatch(specimen, /\b(?:safe|unsafe|contained|containment|breach|universally)\b/i);
});

test('Parallax retains its project destination and fixture provenance', () => {
  const app = read('../src/App.tsx');
  assert.match(app, /name: "Parallax"/);
  assert.match(app, /href: "https:\/\/parallax\.sangeev\.me\/"/);
  assert.match(app, /ariaLabel: "Open project: Parallax"/);
  const readme = read('../README.md');
  assert.match(readme, /https:\/\/parallax\.sangeev\.me\//);
  assert.match(readme, /same fixed wire/);
  assert.match(readme, /c1/);
  assert.match(readme, /0°/);
  assert.match(readme, /60°/);
});

test('unused Parallax projection assets, imports and styles are removed', () => {
  for (const path of ['../src/assets/parallax/c1-000.png', '../src/assets/parallax/c1-060.png', '../public/licenses/MIT-Parallax.txt']) {
    assert.equal(existsSync(new URL(path, import.meta.url)), false, `unused file remains: ${path}`);
  }
  assert.doesNotMatch(read('../src/App.tsx'), /parallaxView|assets\/parallax|projection-comparison|projection-preview|projection-caption|parallax-hinge/);
  assert.doesNotMatch(read('../src/styles.css'), /projection-comparison|projection-preview|projection-caption|parallax-hinge/);
});

test('Parallax remains discoverable without JavaScript', () => {
  assert.match(read('../index.html'), /<a href="https:\/\/parallax\.sangeev\.me\/">Parallax<\/a>/);
});

test('an odd final project selector fills the last mobile row', () => {
  const mobile = read('../src/styles.css').split('@media (max-width: 620px)')[1];
  assert.match(mobile, /\.project-selector:last-child:nth-child\(odd\)\s*\{[^}]*grid-column: 1 \/ -1;[^}]*border-inline-end: 0;/);
});
