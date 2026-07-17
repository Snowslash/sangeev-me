import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const fontLicenses = ['OFL-Atkinson-Hyperlegible-Next.txt', 'OFL-Literata.txt'];

const readLossyWebpDimensions = (file) => {
  const bytes = readFileSync(file);
  const marker = bytes.indexOf(Buffer.from('VP8 '));
  assert.notEqual(marker, -1, `missing VP8 image chunk: ${file}`);
  const payload = marker + 8;
  assert.deepEqual([...bytes.subarray(payload + 3, payload + 6)], [0x9d, 0x01, 0x2a], `invalid VP8 frame header: ${file}`);
  return [bytes.readUInt16LE(payload + 6) & 0x3fff, bytes.readUInt16LE(payload + 8) & 0x3fff];
};

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

test('homepage deploys the reviewed docs artifact as a minimal Cloudflare Worker', () => {
  const wrangler = JSON.parse(read('../wrangler.jsonc'));
  assert.equal(wrangler.name, 'sangeev-me');
  assert.deepEqual(wrangler.observability, { enabled: false });
  assert.deepEqual(wrangler.assets, {
    directory: './docs',
    not_found_handling: 'single-page-application',
  });
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
  assert.match(app, /className="project-evidence"/);
  assert.doesNotMatch(app, /record-ledger|ledger-cell/);
  assert.match(app, /Tools view selected\. Three projects are visible\./);
  assert.match(app, /Workbench view selected\. One project is visible\./);
  assert.match(app, /opnotes-app\.webp/);
  assert.match(app, /scratchpad-app\.webp/);
  assert.match(app, /aligned-app\.webp/);
  assert.match(app, /Operation Note Generator app at the empty Procedure stage/);
  assert.match(app, /Clinical Shift Scratchpad app showing shift controls and job filters, with job content excluded/);
  assert.match(app, /AlignEd app at the empty teaching-workflow choice screen/);
  assert.doesNotMatch(app, /(?:opnotes|scratchpad|aligned)-landing\.webp|Redesign preview/);
  for (const asset of ['opnotes-app.webp', 'scratchpad-app.webp', 'aligned-app.webp']) {
    const source = new URL(`../src/assets/evidence/${asset}`, import.meta.url);
    assert.equal(existsSync(source), true, `missing truthful evidence asset: ${asset}`);
    assert.deepEqual(readLossyWebpDimensions(source), [960, 409], `unexpected evidence dimensions: ${asset}`);
    const stem = asset.replace(/\.webp$/, '');
    const deployed = readdirSync(new URL('../docs/assets/', import.meta.url)).filter((name) => name.startsWith(`${stem}-`) && name.endsWith('.webp'));
    assert.equal(deployed.length, 1, `expected one deployed evidence asset for ${asset}`);
    assert.deepEqual(readFileSync(new URL(`../docs/assets/${deployed[0]}`, import.meta.url)), readFileSync(source), `deployed evidence drift: ${asset}`);
  }
  for (const staleAsset of ['opnotes-landing.webp', 'scratchpad-landing.webp', 'aligned-landing.webp', 'opnotes-live.webp', 'scratchpad-active-list.webp', 'aligned-live.webp']) {
    assert.equal(existsSync(new URL(`../src/assets/evidence/${staleAsset}`, import.meta.url)), false, `stale evidence asset remains: ${staleAsset}`);
  }
  assert.match(app, /from "@sangeev\/estate-ui"/);
  assert.match(app, /<>\s*<PublicEstateHeader current="home"[\s\S]*?<EstateShell variant="landing">/, 'header must sit outside the named shared shell');
  assert.match(styles, /@sangeev\/estate-ui\/contract\.css/);
  assert.match(styles, /\.estate-window/);
  assert.match(styles, /\.record-row/);
  assert.match(styles, /\.project-evidence img \{[^}]*height: auto;[^}]*object-fit: contain;/s);
  assert.doesNotMatch(styles, /\.record-ledger|\.ledger-cell/);
  assert.doesNotMatch(styles, /\.tool-card|\.hero-boundary|\.workbench-item/);
  assert.equal(packageJson.dependencies['@sangeev/estate-ui'], 'file:vendor/sangeev-estate-ui-2.0.0-alpha.3.tgz');
  assert.match(app, /Operation note generator/);
  assert.match(app, /Clinical Shift Scratchpad/);
  assert.match(app, /AlignEd/);
  assert.match(app, /https:\/\/aligned\.sangeev\.me/);
  assert.match(app, /Chess Coach/);
  assert.doesNotMatch(app, /Boundary|Each tool states its local boundary|No analytics\. No tracking\./);
  assert.match(app, /https:\/\/opnotes\.sangeev\.me/);
  assert.match(app, /https:\/\/scratchpad\.sangeev\.me/);
  assert.equal(app.match(/action: "View project"/g)?.length, 3);
  assert.match(app, /className="estate-primary-action record-action"/);
  assert.match(styles, /\.record-action\s*\{[^}]*width: fit-content;[^}]*margin-block-start: var\(--estate-space-4\);/s);
  assert.doesNotMatch(styles, /\.record-action[^}]*text-decoration/s);
  assert.match(app, /ariaLabel: "View Operation note generator"/);
  assert.match(app, /ariaLabel: "View AlignEd"/);
  assert.doesNotMatch(app, /action: "Open tool"|ariaLabel: "Open (?:Operation note generator|AlignEd)"/);
  assert.doesNotMatch(app, /https:\/\/(?:opnotes|aligned)\.sangeev\.me\/app\//);
  assert.doesNotMatch(app, /tool-card|hero-boundary|workbench-item|Public tools|eyebrow|tool-kind|tool-number|Useful enough to keep within reach|Also on the workbench|The clinical tools stay separate/);
  assert.match(app, /<p>Maintained by Sangeev<\/p>/);
  assert.doesNotMatch(app, /Sangeev · Surgery, software and small useful things\.|No analytics\. No tracking\./);
});

test('homepage has a persistent theme control and no manual stale date', () => {
  const app = read('../src/App.tsx');
  const main = read('../src/main.tsx');

  assert.match(app, /PublicEstateHeader/);
  assert.match(app, /useEstateTheme/);
  assert.match(main, /initialiseEstateTheme\(\)/);
  assert.doesNotMatch(app, /Last updated/);
});
