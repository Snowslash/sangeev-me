import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
// Literal copy extracted from the supplied ZIP; its digest records provenance.
// This is a fidelity contract, not verification of the projects' product claims.
const copy = JSON.parse(read('./fixtures/card-desk-copy.json'));

test('Card Desk preserves the supplied project descriptions, taglines and actions', () => {
  const app = read('../src/App.tsx');
  for (const [key, fields] of Object.entries(copy.projects)) {
    const record = app.match(new RegExp(`^  ${key}: \\{([\\s\\S]*?)^  \\},`, 'm'))?.[1] || '';
    for (const [field, value] of Object.entries(fields)) {
      assert.ok(record.includes(`${field}: ${JSON.stringify(value)}`), `${key}.${field} must match the approved ZIP`);
    }
  }
});

test('Card Desk preserves the supplied introduction and plain-English evidence labels', () => {
  const app = read('../src/App.tsx');
  assert.ok(app.includes(`<p className="lede">${copy.intro}</p>`));
  const labels = [...app.matchAll(/<span className="hinge-label">([^<]+)<\/span>/g)].map(match => match[1]);
  assert.deepEqual(labels, copy.evidenceLabels);
});

test('Card Desk restores the supplied repository link in the footer', () => {
  const footer = read('../src/App.tsx').match(/<footer className="site-footer"[\s\S]*?<\/footer>/)?.[0] || '';
  assert.ok(footer.includes(`<a className="footer-source" href="${copy.footer.href}">${copy.footer.text}</a>`));
});

test('the no-JavaScript fallback presents the same approved project copy', () => {
  const html = process.env.LANDING_HTML ? readFileSync(process.env.LANDING_HTML, 'utf8') : read('../index.html');
  assert.ok(html.includes(copy.intro));
  for (const fields of Object.values(copy.projects)) assert.ok(html.includes(fields.description), fields.name);
  assert.match(html, /id="main-content" tabindex="-1"/);
  assert.match(html, /Hi, I’m Sangeev/);
});
