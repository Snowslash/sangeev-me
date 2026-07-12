import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('homepage uses the typed Vite React entrypoint', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const html = read('../index.html');
  const vite = read('../vite.config.ts');

  assert.equal(packageJson.scripts.build, 'tsc -b && vite build');
  assert.ok(vite.includes('assetFileNames: "assets/[name]-[hash][extname]"'));
  assert.doesNotMatch(vite, /\? "styles\.css"/);
  assert.match(html, /src="\/src\/main\.tsx"/);
  assert.match(html, /id="root"/);
});

test('homepage keeps a plain public tools and workbench structure', () => {
  const app = read('../src/App.tsx');
  const headerStyles = read('../src/styles/public-estate-header.css');

  assert.match(app, /<h1 id="page-title">Building small, practical tools\.<\/h1>/);
  assert.match(app, /<h2 id="tools-title">Public tools<\/h2>/);
  assert.match(app, /<h2 id="workbench-title">Workbench<\/h2>/);
  assert.match(app, /<>\s*<PublicEstateHeader current="home"[\s\S]*?<div className="site-shell">/, 'header must sit outside the page-specific content shell');
  assert.match(headerStyles, /width: min\(1160px, calc\(100% - 40px\)\)/);
  assert.match(headerStyles, /font-family: Charter, Cambria, Georgia, serif/);
  assert.match(headerStyles, /\.wordmark[\s\S]*?line-height: 1\.2/);
  assert.match(headerStyles, /\.site-header nav[\s\S]*?line-height: 1\.5/);
  assert.doesNotMatch(headerStyles, /\.site-header nav \{\s*display: none;/, 'primary navigation must remain available on mobile');
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

  assert.match(app, /PublicEstateHeader/);
  assert.match(theme, /sangeevSiteTheme/);
  assert.match(theme, /Domain=\.sangeev\.me/);
  assert.ok(theme.indexOf('const cookie = readCookie()') < theme.indexOf('window.localStorage.getItem'), 'cross-subdomain cookie should take precedence over stale origin storage');
  assert.doesNotMatch(app, /Last updated/);
});
