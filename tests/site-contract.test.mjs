import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicEstateHeader } from '@sangeev/estate-ui';

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
  assert.match(app, /type ProjectKey = "opnotes" \| "scratchpad" \| "aligned" \| "casebook";/);
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
  for (const key of ['opnotes', 'scratchpad', 'aligned', 'casebook']) {
    assert.match(app, new RegExp(`case "${key}"`), `missing evidence state: ${key}`);
  }

  assert.match(app, /Structured drafts for common emergency general-surgery operation notes\./);
  assert.match(app, /A temporary ward-job list for busy clinical shifts\./);
  assert.match(app, /Local-first teaching evidence and portfolio exports\./);

  assert.match(app, /https:\/\/opnotes\.sangeev\.me/);
  assert.match(app, /https:\/\/scratchpad\.sangeev\.me/);
  assert.match(app, /https:\/\/aligned\.sangeev\.me/);
  assert.equal(app.match(/action: "Open project ↗"/g)?.length, 4);
  assert.doesNotMatch(app, /action: "View source ↗"/);

  for (const fixture of [
    'Purulent fluid',
    'Ribbon gauze packing',
    'Chase CT',
    '2.5 → 4.0',
    'More time with suturing',

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
  assert.equal(packageJson.dependencies['@sangeev/estate-ui'], 'file:vendor/sangeev-estate-ui-2.0.0-alpha.7.tgz');
  assert.doesNotMatch(app, /Boundary|Each tool states its local boundary|No analytics\. No tracking\./);
  assert.match(app, /<p>Maintained by Sangeev<\/p>/);
});

test('homepage opts into Projects and GitHub navigation while retaining the shared wordmark and theme control', () => {
  const app = read('../src/App.tsx');
  const headerProps = app.match(/<PublicEstateHeader\b([^>]*)\/>/)?.[1] ?? '';
  assert.match(headerProps, /navigation="projects"/);
  assert.doesNotMatch(read('../src/styles.css'), /\.estate-site-header\b/);
  const html = renderToStaticMarkup(createElement(PublicEstateHeader, {
    current: 'home', navigation: 'projects', theme: 'dark', onToggleTheme() {},
  }));
  const navigation = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  assert.deepEqual([...navigation.matchAll(/href="([^"]+)"/g)].map((match) => match[1]), [
    'https://sangeev.me/#projects', 'https://github.com/Snowslash',
  ]);
  assert.match(navigation, />Projects<\/a>/);
  assert.match(navigation, /aria-label="GitHub"/);
  assert.match(html, /class="estate-wordmark"[^>]*href="https:\/\/sangeev.me"/);
  assert.match(html, /aria-label="Switch to light mode"/);
});

test('homepage omits Chess Coach and its retired specimen styles', () => {
  assert.doesNotMatch(read('../src/App.tsx'), /chess|Stockfish|Maia|3\.\.\.Nf6|played-move/i);
  assert.doesNotMatch(read('../src/styles.css'), /chess|played-move/i);
  assert.doesNotMatch(read('../index.html'), /chess-coach|Chess Coach/i);
});

test('shared package MIT notice is copied into the public artifact', () => {
  const canonical = read('../node_modules/@sangeev/estate-ui/LICENSE');
  assert.match(canonical, /MIT License/);
  for (const directory of ['public', 'docs']) {
    assert.equal(read(`../${directory}/licenses/MIT-estate-ui.txt`), canonical);
  }
});

test('Casebook links its landing and shows only the source-grounded static filter result', () => {
  const app = read('../src/App.tsx');
  assert.match(app, /const projectOrder: ProjectKey\[\] = \["opnotes", "scratchpad", "aligned", "casebook"\]/);
  assert.match(app, /href: "https:\/\/casebook\.sangeev\.me\/"/);
  assert.match(app, /ariaLabel: "Open Casebook"/);
  const specimen = app.match(/case "casebook":([\s\S]*?)\n\s*\);/)?.[1] ?? '';
  for (const text of ['Static example', 'Performed', 'February 2026', 'Synthetic procedure A', 'Source rows 5 and 6', 'Duplicate retained']) assert.ok(specimen.includes(text), text);
  assert.doesNotMatch(specimen, /<input|<select|<button|competenc|score/i);
  assert.match(read('../README.md'), /https:\/\/casebook\.sangeev\.me\//);
});

test('evidence retains light tokens without overriding shared theme focus', () => {
  const styles = read('../src/styles.css');
  assert.match(styles, /--evidence-background: var\(--estate-mist\)/);
  assert.doesNotMatch(styles, /--estate-focus\s*:/);
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

test('Deep Atlas starts with dark browser chrome and semantic evidence roles', () => {
  assert.match(read('../index.html'), /name="theme-color" content="#061e1d"/);
});

test('Deep Atlas evidence uses semantic dark roles and ink on coral', () => {
  const css = read('../src/styles.css');
  const dark = css.match(/\[data-theme="dark"\] \.project-window,[\s\S]*?\{([^}]+)\}/)?.[1] ?? '';
  for (const [role, token] of Object.entries({background:'card', raised:'secondary', paper:'card', text:'foreground', muted:'muted-foreground', edge:'border', rule:'estate-rule', output:'background', 'output-text':'foreground'})) {
    assert.ok(dark.includes(`--evidence-${role}: var(--${token});`), `${role} must resolve to the dark semantic ${token}`);
  }
  assert.doesNotMatch(dark, /--estate-focus:/);
  assert.match(css, /\.capture-task\s*\{[^}]*color: var\(--estate-ink\)/);
  assert.match(css, /\.active-row__priority\s*\{[^}]*color: var\(--estate-ink\)/);
  assert.match(css, /\.project-selector\[aria-pressed="true"\]\s*\{[^}]*color: var\(--estate-ink\)/);
});

test('mobile evidence dividers follow the same semantic edge and rule roles', () => {
  const css = read('../src/styles.css');
  const mobile = css.slice(css.indexOf('@media (max-width: 620px)'));
  assert.doesNotMatch(mobile, /var\(--estate-(deep|shoal)\)/);
});
