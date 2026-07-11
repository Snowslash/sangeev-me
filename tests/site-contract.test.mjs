import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('homepage uses the typed Vite React entrypoint', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const html = read('../index.html');

  assert.equal(packageJson.scripts.build, 'tsc -b && vite build');
  assert.match(html, /src="\/src\/main\.tsx"/);
  assert.match(html, /id="root"/);
});

test('homepage keeps a plain public tools and workbench structure', () => {
  const app = read('../src/App.tsx');

  assert.match(app, /<h1 id="page-title">Building small, practical tools\.<\/h1>/);
  assert.match(app, /<h2 id="tools-title">Public tools<\/h2>/);
  assert.match(app, /<h2 id="workbench-title">Workbench<\/h2>/);
  assert.match(app, /Operation note generator/);
  assert.match(app, /Clinical Shift Scratchpad/);
  assert.match(app, /AlignEd/);
  assert.match(app, /https:\/\/aligned\.sangeev\.me/);
  assert.match(app, /Chess Coach/);
  assert.match(app, /Do not enter patient-identifiable information/);
  assert.match(app, /https:\/\/opnotes\.sangeev\.me/);
  assert.match(app, /https:\/\/scratchpad\.sangeev\.me/);
  assert.doesNotMatch(app, /eyebrow|tool-kind|tool-number|Clinical boundary|Useful enough to keep within reach|Also on the workbench|The clinical tools stay separate/);
});

test('homepage has a persistent theme control and no manual stale date', () => {
  const app = read('../src/App.tsx');
  const theme = read('../src/lib/theme.ts');

  assert.match(app, /ThemeToggle/);
  assert.match(theme, /sangeevSiteTheme/);
  assert.match(theme, /Domain=\.sangeev\.me/);
  assert.ok(theme.indexOf('const cookie = readCookie()') < theme.indexOf('window.localStorage.getItem'), 'cross-subdomain cookie should take precedence over stale origin storage');
  assert.doesNotMatch(app, /Last updated/);
});
