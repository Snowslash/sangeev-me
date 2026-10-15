import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPreviewServer } from './preview.mjs';

// Frame-level regression: settled screenshots cannot establish animated movement.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.CARD_DESK_EVIDENCE || '.cache/card-desk-motion');
await mkdir(output, { recursive: true });
const server = await createPreviewServer(process.env.CARD_DESK_DOCUMENT_ROOT);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
  args: ['--disable-dev-shm-usage', '--renderer-process-limit=1'],
});
const results = { scenarios: [], errors: [], failures: [] };
const save = () => writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
try {
  for (const width of [1440, 1024, 800]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference', serviceWorkers: 'block' });
    await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => results.errors.push(error.message));
    try {
      await page.goto(origin);
      await page.locator('.project-selector').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      for (const name of ['Stack', 'Sort by group', 'Scatter']) {
        await page.evaluate(() => {
          const cards = [...document.querySelectorAll('.project-selector')];
          const start = performance.now();
          const events = [];
          const record = event => {
            if (event.propertyName === 'transform' && event.target.matches('.project-selector')) events.push({ key: event.target.dataset.project, type: event.type, time: performance.now() - start });
          };
          document.addEventListener('transitionend', record);
          document.addEventListener('transitioncancel', record);
          const sample = () => ({
            time: performance.now() - start,
            mode: document.querySelector('.project-window').dataset.mode,
            height: document.querySelector('.project-window').getBoundingClientRect().height,
            cards: cards.map(card => ({ key: card.dataset.project, transform: getComputedStyle(card).transform, settling: card.hasAttribute('data-settling') })),
          });
          window.__motion = { frames: [sample()], events, done: false };
          const tick = () => {
            window.__motion.frames.push(sample());
            if (performance.now() - start < 1550) requestAnimationFrame(tick);
            else {
              window.__motion.done = true;
              document.removeEventListener('transitionend', record);
              document.removeEventListener('transitioncancel', record);
            }
          };
          requestAnimationFrame(tick);
        });
        await page.getByRole('button', { name, exact: true }).click();
        await page.waitForFunction(() => window.__motion.done);
        const capture = await page.evaluate(() => window.__motion);
        const checks = capture.frames[0].cards.map((card, index) => {
          const final = capture.frames.at(-1).cards[index].transform;
          const intermediate = capture.frames.some(frame => frame.cards[index].transform !== card.transform && frame.cards[index].transform !== final);
          const lastEvent = capture.events.filter(event => event.key === card.key).at(-1)?.type;
          const settled = !capture.frames.at(-1).cards[index].settling;
          return { key: card.key, intermediate, lastEvent, settled };
        });
        const scenario = { width, name, checks, capture };
        results.scenarios.push(scenario);
        for (const check of checks) {
          if (!check.intermediate || check.lastEvent !== 'transitionend' || !check.settled) results.failures.push({ width, name, ...check });
        }
        await save();
      }
      if (!process.env.CARD_DESK_DOCUMENT_ROOT) {
        // Real keyboard activation also exercises rapid replacement without a
        // moving card accidentally intercepting a test pointer on the tray.
        for (const name of ['Stack', 'Sort by group', 'Stack']) {
          await page.getByRole('button', { name, exact: true }).focus();
          await page.keyboard.press('Enter');
          await page.waitForTimeout(100);
        }
        assert.equal(await page.locator('.project-window').getAttribute('data-mode'), 'stack');
        await page.waitForFunction(() => !document.querySelector('.project-selector[data-settling]'));
        assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
        await page.getByRole('button', { name: 'Sort by group', exact: true }).focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.project-selector[data-settling]').count(), 6);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.project-selector[data-settling]').count(), 0);
        assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
        // Start from groups: random scatter can cover controls in the supplied design.
        // An immutable ZIP comparison checks normal motion, not our added lifecycle guards.
        await page.reload();
        await page.locator('.project-selector').first().waitFor();
        await page.getByRole('button', { name: 'Stack', exact: true }).click();
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.project-selector[data-settling]').count(), 0);
        assert.equal(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length), 0);
        results.scenarios.at(-1).lifecycle = ['rapid-keyboard-replacement', 'natural-completion', 'reduced-motion-during-arrangement', 'reduced-motion-at-load'];
      }
    } finally {
      await context.close();
    }
  }
  assert.deepEqual(results.errors, []);
  assert.deepEqual(results.failures, [], 'every card must move through intermediate frames and finish naturally, without snapping');
  results.status = 'pass';
} catch (error) {
  results.status = 'fail';
  results.failure = error.message;
  process.exitCode = 1;
} finally {
  await save();
  console.log(JSON.stringify({ status: results.status, scenarios: results.scenarios.length, failures: results.failures, errors: results.errors, output }));
  await browser.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
