import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPreviewServer } from './preview.mjs';

// Use an existing Playwright installation; do not add a runtime dependency.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.CARD_DESK_EVIDENCE || '.cache/card-desk-review');
await mkdir(output, { recursive: true });
const server = await createPreviewServer();
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  headless: true,
  args: ['--disable-dev-shm-usage', '--renderer-process-limit=1'],
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const projects = ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax', 'glassbox'];
const copy = JSON.parse(await readFile(new URL('../tests/fixtures/card-desk-copy.json', import.meta.url), 'utf8'));
const urls = projects.map(key => `https://${key}.sangeev.me${['casebook', 'parallax', 'glassbox'].includes(key) ? '/' : ''}`);
const results = { origin, scenarios: [], errors: [], csp: [], external: [] };
const save = () => writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function context(options = {}) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', ...options });
  await ctx.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    results.external.push(route.request().url());
    return route.abort();
  });
  await ctx.addInitScript(() => {
    window.__violations = [];
    document.addEventListener('securitypolicyviolation', event => window.__violations.push({ directive: event.violatedDirective, blocked: event.blockedURI }));
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(7000);
  page.on('pageerror', error => results.errors.push(error.message));
  return { ctx, page };
}
async function layout(page) {
  return page.evaluate(() => ({
    width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    header: document.querySelector('.estate-site-header').getBoundingClientRect().toJSON(),
    theme: document.documentElement.dataset.theme,
    themeColor: document.querySelector('meta[name="theme-color"]').content,
    bodyColor: getComputedStyle(document.body).backgroundColor,
  }));
}
async function closed(page, key) {
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.waitForFunction(k => document.activeElement?.dataset.project === k, key);
  assert.ok(await page.locator('.estate-site-header').evaluate(element => !element.closest('[inert]')));
  const themeButton = page.locator('.estate-site-header button');
  await themeButton.focus();
  assert.ok(await themeButton.evaluate(element => element === document.activeElement), 'header becomes focusable after closing');
  await page.locator(`[data-project="${key}"]`).focus();
}
try {
  // Same artifact, genuine site headers. Every project is opened in every scenario.
  for (const [label, width, height] of [['desktop', 1440, 1000], ['laptop', 1280, 720], ['tablet', 768, 1024], ['phone', 390, 844], ['small', 320, 568], ['short', 1024, 420]]) {
    for (const theme of ['dark', 'light']) {
      const { ctx, page } = await context({ viewport: { width, height }, colorScheme: theme });
      const scenario = { label, width, height, theme, projects: [] };
      results.scenarios.push(scenario);
      await page.goto(origin + '/?review=card-desk');
      await page.locator('.project-selector').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.estate-site-header button').click();
      await page.waitForTimeout(80);
      scenario.layout = await layout(page);
      assert.equal(scenario.layout.theme, theme);
      assert.equal(scenario.layout.h1, 1);
      assert.equal(scenario.layout.main, 1);
      assert.ok(scenario.layout.scrollWidth <= width + 1, `${label} overflow`);
      assert.ok(Math.abs(scenario.layout.header.x) < 1 && Math.abs(scenario.layout.header.width - width) < 1, 'full-bleed shared header');
      assert.equal(await page.locator('.project-selector').count(), 6);
      assert.equal(await page.locator('.project-window').getAttribute('data-mode'), 'groups');
      assert.equal(await page.locator('.lede').innerText(), copy.intro);
      assert.equal(await page.locator('.site-footer .footer-source').innerText(), copy.footer.text);
      assert.equal(await page.locator('.site-footer .footer-source').getAttribute('href'), copy.footer.href);
      await page.screenshot({ path: path.join(output, `${label}-${theme}.png`), fullPage: true });
      for (const [i, key] of projects.entries()) {
        const card = page.locator(`[data-project="${key}"]`);
        assert.equal(await card.locator('.card-tagline').innerText(), copy.projects[key].tagline);
        await card.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        await page.waitForTimeout(600);
        assert.equal(await dialog.locator('a.stage-link').getAttribute('href'), urls[i]);
        assert.equal(await dialog.locator('.stage-description').innerText(), copy.projects[key].description);
        assert.deepEqual(await dialog.locator('.hinge-label').allTextContents(), copy.evidenceLabels.slice(i * 2, i * 2 + 2));
        assert.equal(await dialog.locator('a.stage-link').getAttribute('aria-label'), `Open project: ${await dialog.locator('h2').innerText()}`);
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'focus starts inside modal');
        for (let tab = 0; tab < 5; tab++) {
          await page.keyboard.press(tab === 0 ? 'Shift+Tab' : 'Tab');
          assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'modal must trap both directions');
        }
        const geometry = await dialog.evaluate(el => {
          const box = el.getBoundingClientRect();
          return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, viewport: innerHeight, width: innerWidth, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
        });
        assert.ok(geometry.x >= -1 && geometry.right <= width + 1, `${label}/${key} dialog horizontal bounds ${JSON.stringify(geometry)}`);
        assert.ok(geometry.y >= -1 && geometry.bottom <= height + 1, `${label}/${key} dialog vertical bounds ${JSON.stringify(geometry)}`);
        assert.ok(geometry.scrollWidth <= geometry.clientWidth + 1, 'dialog content must fit horizontally');
        await dialog.locator('a.stage-link').scrollIntoViewIfNeeded();
        assert.ok(await dialog.locator('a.stage-link').isVisible());
        if (['opnotes', 'glassbox'].includes(key) && ['desktop', 'phone', 'small', 'short'].includes(label)) {
          await dialog.locator('.stage-close').scrollIntoViewIfNeeded();
          // Capture a fixed modal in its actual viewport, not a stitched full page.
          await page.screenshot({ path: path.join(output, `${label}-${theme}-${key}.png`) });
        }
        await page.keyboard.press('Escape');
        await closed(page, key);
        assert.equal(new URL(page.url()).search, '?review=card-desk', 'closing preserves query');
        assert.equal(new URL(page.url()).hash, '', 'closing clears project hash');
        scenario.projects.push({ key, url: urls[i], geometry, keyboard: 'pass' });
      }
      results.csp.push(...await page.evaluate(() => window.__violations));
      await save();
      await ctx.close();
    }
  }
  const { ctx, page } = await context({ viewport: { width: 1440, height: 1000 } });
  await page.goto(origin);
  await page.locator('.project-selector').first().waitFor();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.className), 'skip-link');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content');
  await page.waitForTimeout(1400);
  for (const [name, mode] of [['Scatter', 'scatter'], ['Stack', 'stack'], ['Sort by group', 'groups']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(1400);
    assert.equal(await page.locator('.project-window').getAttribute('data-mode'), mode);
    assert.equal(await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
    if (mode === 'scatter') await page.screenshot({ path: path.join(output, 'desktop-scatter.png'), fullPage: true });
  }
  const first = page.locator('[data-project="opnotes"]');
  await first.focus();
  const beforeKey = await first.getAttribute('style');
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await first.getAttribute('style'), beforeKey, 'keyboard nudges card');
  const beforeDrag = await first.getAttribute('style');
  const box = await first.boundingBox();
  await page.mouse.move(box.x + 60, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + 140, box.y + 140, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  assert.notEqual(await first.getAttribute('style'), beforeDrag, 'drag moves card');
  assert.equal(await page.getByRole('dialog').count(), 0, 'drag must not open card');
  await first.click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Put the card down' }).click();
  await closed(page, 'opnotes');
  await first.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(650);
  await page.locator('.desk-scrim').click({ position: { x: 5, y: 5 } });
  await closed(page, 'opnotes');
  // A rapid hash navigation must cancel an in-flight close, not discard the new selection.
  await page.goto(origin + '/?keep=yes#glassbox');
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.getByRole('dialog').locator('h2').innerText(), 'Glassbox');
  await page.keyboard.press('Escape');
  await page.evaluate(() => { location.hash = 'parallax'; });
  await page.waitForTimeout(650);
  assert.equal(await page.getByRole('dialog').locator('h2').innerText(), 'Parallax');
  await page.keyboard.press('Escape');
  await closed(page, 'parallax');
  assert.equal(new URL(page.url()).search, '?keep=yes');
  // Shared theme preference survives reload; local preview never rewrites destinations.
  await page.locator('.estate-site-header button').click();
  const toggled = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await page.locator('.project-selector').first().waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'), toggled);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Scatter', exact: true }).click();
  await pause(100);
  assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
  await first.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await closed(page, 'opnotes');
  results.interactionChecks = ['skip', 'arrangements', 'keyboard-nudge', 'drag', 'click-after-drag', 'close', 'backdrop', 'hash-open', 'hash-race', 'query-preserved', 'theme-persistence', 'reduced-motion'];
  results.csp.push(...await page.evaluate(() => window.__violations));
  await ctx.close();
  results.noJavaScript = [];
  for (const width of [1440, 320]) {
    const { ctx, page } = await context({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    await page.goto(origin);
    const links = await page.locator('a').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
    const text = await page.locator('body').innerText();
    assert.ok(text.includes(copy.intro));
    for (const fields of Object.values(copy.projects)) assert.ok(text.includes(fields.description), `no-JS copy: ${fields.name}`);
    // Preserved fallback uses a trailing root slash for Scratchpad and AlignEd;
    // both spellings resolve to the same destination, without changing the HTML.
    for (const url of urls) assert.ok(links.some(link => new URL(link, origin).href === new URL(url).href), `no-JS link ${url}`);
    const geometry = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(geometry.scrollWidth <= width + 1);
    assert.equal(await page.locator('h1').count(), 1);
    await page.screenshot({ path: path.join(output, `no-js-${width}.png`), fullPage: true });
    results.noJavaScript.push({ width, links, geometry });
    await ctx.close();
  }
  assert.deepEqual(results.errors, [], 'no uncaught errors');
  assert.deepEqual(results.csp, [], 'no CSP violations');
  assert.deepEqual(results.external, [], 'homepage must not request external resources');
  results.status = 'pass';
} catch (error) {
  results.status = 'fail';
  results.failure = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  await save();
  console.log(JSON.stringify({ status: results.status, scenarios: results.scenarios.length, projectJourneys: results.scenarios.reduce((n, x) => n + x.projects.length, 0), errors: results.errors, csp: results.csp, failure: results.failure, output }));
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
