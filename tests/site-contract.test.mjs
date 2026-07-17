import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const fontLicenses = ['OFL-Atkinson-Hyperlegible-Next.txt', 'OFL-Literata.txt'];

test('homepage uses the typed Vite React entrypoint', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const html = read('../index.html');
  const vite = read('../vite.config.ts');

  assert.equal(packageJson.scripts.build, 'tsc -b && vite build');
  assert.ok(vite.includes('base: "./"'));
  assert.ok(vite.includes('assetFileNames: "assets/[name]-[hash][extname]"'));
  assert.doesNotMatch(vite, /\? "styles\.css"/);
  assert.match(html, /src="\/src\/main\.tsx"/);
  assert.match(html, /id="root"/);
  assert.doesNotMatch(html, /sangeev-public-tokens\.css/);
  for (const license of fontLicenses) {
    const source = new URL(`../public/licenses/${license}`, import.meta.url);
    const deployed = new URL(`../docs/licenses/${license}`, import.meta.url);
    const canonical = new URL(`../node_modules/@sangeev/estate-ui/LICENSES/${license}`, import.meta.url);
    assert.equal(readFileSync(source, 'utf8'), readFileSync(canonical, 'utf8'), `source font licence drift: ${license}`);
    assert.equal(readFileSync(deployed, 'utf8'), readFileSync(canonical, 'utf8'), `deployed font licence drift: ${license}`);
  }
});

test('homepage implements the approved stateful evidence-window project register', () => {
  const app = read('../src/App.tsx');
  const styles = read('../src/styles.css');
  const packageJson = JSON.parse(read('../package.json'));

  assert.match(app, /<EstatePageTitle id="page-title" variant="landing">Building small, practical tools\.<\/EstatePageTitle>/);
  assert.match(app, /<section[^>]*id="projects"/);
  assert.match(app, /useState<ProjectView>\("tools"\)/);
  assert.match(app, /className="state-tabs"/);
  assert.match(app, /aria-controls="estate-window"/);
  assert.match(app, /className="estate-window"/);
  assert.match(app, /<dl className="record-rows">/);
  assert.match(app, /record-row\$\{record\.evidence/);
  assert.match(app, /project-evidence\$\{record\.evidence\.portrait/);
  assert.match(app, /className="record-ledger"/);
  assert.match(app, /Tools view selected\. Three projects are visible\./);
  assert.match(app, /Workbench view selected\. One project is visible\./);
  assert.match(app, /opnotes-live\.webp/);
  assert.match(app, /scratchpad-active-list\.webp/);
  assert.match(app, /aligned-live\.webp/);
  for (const asset of ['opnotes-live.webp', 'scratchpad-active-list.webp', 'aligned-live.webp']) {
    assert.equal(existsSync(new URL(`../src/assets/evidence/${asset}`, import.meta.url)), true, `missing truthful evidence asset: ${asset}`);
  }
  assert.match(app, /from "@sangeev\/estate-ui"/);
  assert.match(app, /<>\s*<PublicEstateHeader current="home"[\s\S]*?<EstateShell variant="landing">/, 'header must sit outside the named shared shell');
  assert.match(styles, /@sangeev\/estate-ui\/contract\.css/);
  assert.match(styles, /\.estate-window/);
  assert.match(styles, /\.record-row/);
  assert.match(styles, /\.record-ledger/);
  assert.doesNotMatch(styles, /\.tool-card|\.hero-boundary|\.workbench-item/);
  assert.equal(packageJson.dependencies['@sangeev/estate-ui'], 'file:vendor/sangeev-estate-ui-2.0.0-alpha.2.tgz');
  assert.match(app, /Operation note generator/);
  assert.match(app, /Clinical Shift Scratchpad/);
  assert.match(app, /AlignEd/);
  assert.match(app, /https:\/\/aligned\.sangeev\.me/);
  assert.match(app, /Chess Coach/);
  assert.match(app, /Do not enter patient-identifiable information/);
  assert.match(app, /https:\/\/opnotes\.sangeev\.me/);
  assert.match(app, /https:\/\/scratchpad\.sangeev\.me/);
  assert.doesNotMatch(app, /tool-card|hero-boundary|workbench-item|Public tools|eyebrow|tool-kind|tool-number|Useful enough to keep within reach|Also on the workbench|The clinical tools stay separate/);
});

test('homepage has a persistent theme control and no manual stale date', () => {
  const app = read('../src/App.tsx');
  const main = read('../src/main.tsx');

  assert.match(app, /PublicEstateHeader/);
  assert.match(app, /useEstateTheme/);
  assert.match(main, /initialiseEstateTheme\(\)/);
  assert.doesNotMatch(app, /Last updated/);
});
