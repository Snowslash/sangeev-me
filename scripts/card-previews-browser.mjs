import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPreviewServer } from './preview.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.CARD_DESK_EVIDENCE || '.cache/card-previews');
await mkdir(output, { recursive: true });
const server = await createPreviewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--disable-dev-shm-usage', '--renderer-process-limit=1'] });
const results = { previews: [], errors: [], external: [], csp: [] };
const save = () => writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
const keys = ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax', 'glassbox'];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', serviceWorkers: 'block' });
  await context.route('**/*', route => {
    if (route.request().url().startsWith(origin + '/')) return route.continue();
    results.external.push(route.request().url());
    return route.abort();
  });
  await context.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', e => window.__csp.push({ directive: e.violatedDirective, blocked: e.blockedURI }));
  });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.on('pageerror', e => results.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') results.errors.push(m.text()); });
  const sample = () => page.locator('.preview-art').evaluate(el => ({
    project: el.dataset.project,
    animations: el.getAnimations({ subtree: true }).map(a => ({ name: a.animationName, time: a.currentTime, state: a.playState, duration: a.effect.getTiming().duration, infinite: a.effect.getTiming().iterations === Infinity })),
    parts: [...el.querySelectorAll('[class]')].map(e => ({ name: e.getAttribute('class'), opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform, dash: getComputedStyle(e).strokeDashoffset })),
  }));
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.locator('.preview-window').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('.preview-window').getAttribute('aria-hidden'), 'true');
  results.idle = await sample();
  assert.ok(results.idle.animations.some(a => a.name === 'pv-bob' && a.infinite));
  for (const key of keys) {
    const card = page.locator(`.project-selector[data-project="${key}"]`);
    await card.hover();
    await page.waitForFunction(k => document.querySelector('.preview-art')?.dataset.project === k, key);
    await page.waitForTimeout(350);
    const early = await sample();
    await page.waitForTimeout(2650);
    const middle = await sample();
    await page.locator('.preview-window').screenshot({ path: path.join(output, `${key}.png`) });
    await page.waitForTimeout(2700);
    const secondCycle = await sample();
    assert.notDeepEqual(early.parts, middle.parts, `${key} visibly changes during the sequence`);
    const loops = secondCycle.animations.filter(a => a.infinite);
    assert.ok(loops.length > 0 && loops.every(a => a.state === 'running' && a.time > a.duration), `${key} naturally continues beyond its first cycle`);
    await page.mouse.move(5, 5);
    await page.waitForFunction(() => document.querySelector('.preview-art')?.dataset.project === 'idle');
    await card.focus();
    await page.waitForFunction(k => document.querySelector('.preview-art')?.dataset.project === k, key);
    await page.keyboard.press('Enter');
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.project), key);
    results.previews.push({ key, early, middle, secondCycle, keyboard: 'pass' });
    await save();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  results.liveReduced = await sample();
  assert.deepEqual(results.liveReduced.animations, []);
  await page.reload({ waitUntil: 'networkidle' });
  results.reduced = [];
  for (const key of keys) {
    await page.locator(`.project-selector[data-project="${key}"]`).focus();
    await page.waitForTimeout(100);
    const before = await sample();
    await page.waitForTimeout(150);
    const after = await sample();
    assert.deepEqual(after.animations, []);
    assert.deepEqual(before.parts, after.parts, `${key} is static under reduced motion`);
    results.reduced.push(key);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (const theme of ['dark', 'light']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.estate-site-header button').click();
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `desktop-${theme}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.preview-window').count(), 0);
  assert.equal(await page.locator('.project-selector').count(), 6);
  await page.screenshot({ path: path.join(output, 'phone.png'), fullPage: true });
  results.csp = await page.evaluate(() => window.__csp);
  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.csp, []);
  assert.deepEqual(results.external, []);
  assert.equal(new Set(results.previews.map(p => p.key)).size, keys.length);
  results.status = 'pass';
  await context.close();
} catch (error) {
  results.status = 'fail';
  results.failure = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  await save();
  console.log(JSON.stringify({ status: results.status, previews: results.previews.length, reduced: results.reduced, failure: results.failure, errors: results.errors, csp: results.csp, output }));
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
