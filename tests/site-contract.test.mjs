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

test('homepage deploys the reviewed docs artifact as a minimal Cloudflare Worker', () => {
  const wrangler = JSON.parse(read('../wrangler.jsonc'));
  assert.equal(wrangler.name, 'sangeev-me');
  assert.deepEqual(wrangler.observability, { enabled: false });
  assert.deepEqual(wrangler.assets, {
    directory: './docs',
    not_found_handling: 'single-page-application',
  });
});

test('homepage publishes canonical crawler discovery files', () => {
  for (const directory of ['public', 'docs']) {
    const robotsPath = `../${directory}/robots.txt`;
    const sitemapPath = `../${directory}/sitemap.xml`;
    assert.equal(existsSync(new URL(robotsPath, import.meta.url)), true, `${directory}/robots.txt must exist`);
    assert.equal(existsSync(new URL(sitemapPath, import.meta.url)), true, `${directory}/sitemap.xml must exist`);

    const robots = read(robotsPath);
    const sitemap = read(sitemapPath);
    assert.equal(robots, 'User-agent: *\nAllow: /\n\nSitemap: https://sangeev.me/sitemap.xml\n');
    assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(sitemap, /<loc>https:\/\/sangeev\.me\/<\/loc>/);
    assert.doesNotMatch(sitemap, /<html\b/i);
  }
});

test('homepage implements one unified four-project hinge window', () => {
  const app = read('../src/App.tsx');
  const styles = read('../src/styles.css');
  const packageJson = JSON.parse(read('../package.json'));

  assert.match(app, /<EstatePageTitle id="page-title" variant="landing">Building small, practical tools\.<\/EstatePageTitle>/);
  assert.match(app, /<section[^>]*id="projects"/);
  assert.match(app, /type ProjectKey = "opnotes" \| "scratchpad" \| "aligned" \| "chess"/);
  assert.match(app, /useState<ProjectKey>\("opnotes"\)/);
  assert.match(app, /className="project-window"/);
  assert.match(app, /className="project-register"[^>]*role="group"/);
  assert.match(app, /className="project-selector"/);
  assert.match(app, /data-project=\{key\}/);
  assert.match(app, /aria-pressed=\{selectedProject === key\}/);
  assert.match(app, /className="evidence-stage"/);
  assert.match(app, /className="stage-description"/);
  assert.match(app, /className="estate-primary-action stage-link"/);
  assert.doesNotMatch(app, /<button[^>]*className="[^"]*stage-link/);
  assert.match(app, /function EvidencePanel/);
  for (const key of ['opnotes', 'scratchpad', 'aligned', 'chess']) {
    assert.match(app, new RegExp(`case "${key}"`), `missing evidence state: ${key}`);
  }

  assert.match(app, /Structured drafts for common emergency general-surgery operation notes\./);
  assert.match(app, /A temporary ward-job list for busy clinical shifts\./);
  assert.match(app, /Local-first teaching evidence and portfolio exports\./);
  assert.match(app, /Local-first chess analysis with Stockfish and optional Maia context\./);
  assert.match(app, /https:\/\/opnotes\.sangeev\.me/);
  assert.match(app, /https:\/\/scratchpad\.sangeev\.me/);
  assert.match(app, /https:\/\/aligned\.sangeev\.me/);
  assert.match(app, /https:\/\/github\.com\/Snowslash\/chess-coach/);
  assert.equal(app.match(/action: "Open project ↗"/g)?.length, 3);
  assert.equal(app.match(/action: "View source ↗"/g)?.length, 1);

  for (const fixture of [
    'Purulent fluid',
    'Ribbon gauze packing',
    'Chase CT',
    '2.5 → 4.0',
    'More time with suturing',
    '3...Nf6??',
    'Missed the mate threat on f7.',
  ]) {
    assert.ok(app.includes(fixture), `missing fixture evidence: ${fixture}`);
  }
  assert.doesNotMatch(app, /provenance:|className="provenance"|Synthetic fixture|Synthetic demo|Synthetic training fixture|Fixture-backed examples/);

  assert.doesNotMatch(app, /ProjectView|Tools view selected|Workbench view selected|state-tabs|record-rows|record-row|className="project-evidence"/);
  assert.doesNotMatch(app, /assets\/evidence|<img|View project/);
  for (const staleAsset of ['opnotes-app.webp', 'scratchpad-app.webp', 'aligned-app.webp']) {
    assert.equal(existsSync(new URL(`../src/assets/evidence/${staleAsset}`, import.meta.url)), false, `unused screenshot evidence remains: ${staleAsset}`);
  }
  assert.match(app, /from "@sangeev\/estate-ui"/);
  assert.match(app, /<>\s*<PublicEstateHeader current="home"[\s\S]*?<EstateShell variant="landing">/, 'header must sit outside the named shared shell');
  assert.match(styles, /@sangeev\/estate-ui\/contract\.css/);
  assert.match(styles, /\.project-window/);
  assert.match(styles, /\.project-register/);
  assert.match(styles, /\.evidence-stage/);
  assert.match(styles, /\.hinge-arrow/);
  assert.doesNotMatch(styles, /\.provenance/);
  assert.doesNotMatch(styles, /\.state-tabs|\.record-rows|\.record-row|\.project-evidence/);
  assert.equal(packageJson.dependencies['@sangeev/estate-ui'], 'file:vendor/sangeev-estate-ui-2.0.0-alpha.3.tgz');
  assert.doesNotMatch(app, /Boundary|Each tool states its local boundary|No analytics\. No tracking\./);
  assert.match(app, /<p>Maintained by Sangeev<\/p>/);
});

test('homepage default HTML remains a complete useful project presentation without JavaScript', () => {
  const html = read('../index.html');

  assert.match(html, /<div id="root">[\s\S]*class="no-js-fallback"[\s\S]*<\/div>/);
  assert.match(html, /Building small, practical tools\./);
  assert.match(html, /Operation Note Generator/);
  assert.match(html, /Structured drafts for common emergency general-surgery operation notes\./);
  assert.match(html, /Purulent fluid/);
  assert.match(html, /Ribbon gauze packing/);
  assert.match(html, /Findings: Purulent fluid encountered\./);
  assert.match(html, /Operation: Cavity packed with ribbon gauze\./);
  assert.match(html, /href="https:\/\/opnotes\.sangeev\.me"/);
  assert.doesNotMatch(html, /Synthetic fixture|Synthetic demo|Synthetic training fixture|Fixture-backed examples/);
  assert.doesNotMatch(html, /class="no-js-fallback"[^>]*hidden/);
});

test('homepage has a persistent theme control and no manual stale date', () => {
  const app = read('../src/App.tsx');
  const main = read('../src/main.tsx');

  assert.match(app, /PublicEstateHeader/);
  assert.match(app, /useEstateTheme/);
  assert.match(main, /initialiseEstateTheme\(\)/);
  assert.doesNotMatch(app, /Last updated/);
});
