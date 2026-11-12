import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPreviewServer } from './preview.mjs';

import { chromium } from 'playwright';
const output = path.resolve(process.env.CARD_DESK_EVIDENCE || '.cache/card-desk-touch');
await mkdir(output, { recursive: true });
const server = await createPreviewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  headless: true,
  args: ['--disable-dev-shm-usage', '--renderer-process-limit=1'],
});
const results = { scenarios: [], errors: [] };
try {
  for (const [width, height] of [[768, 600], [1024, 420], [844, 390]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, serviceWorkers: 'block' });
    try {
      const page = await context.newPage();
      page.on('pageerror', error => results.errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await page.locator('.project-selector').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      const point = await page.evaluate(() => {
        const desk = document.querySelector('.project-window');
        const box = desk.getBoundingClientRect();
        for (let y = innerHeight - 48; y > Math.max(180, box.top + 120); y -= 24) {
          for (let x = box.left + 8; x < box.right - 8; x += 24) {
            const element = document.elementFromPoint(x, y);
            if (element && desk.contains(element) && !element.closest('button, a')) return { x, y, target: element.className, touchAction: getComputedStyle(desk).touchAction };
          }
        }
        throw new Error('No non-interactive desk surface found');
      });
      const cdp = await context.newCDPSession(page);
      const before = await page.evaluate(() => scrollY);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y }] });
      for (let step = 1; step <= 12; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - step * 10 }] });
        await page.waitForTimeout(20);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => scrollY);
      const scenario = { width, height, point, before, after, scrolled: after > before + 40 };
      results.scenarios.push(scenario);
      assert.ok(scenario.scrolled, `native swipe on ${point.target} must scroll at ${width}px: ${before} -> ${after}`);
      assert.equal(point.touchAction, 'auto', 'desk permits native scrolling and zoom');
      // Restrict gesture capture to cards: a touch drag still moves a card without opening it.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const card = page.locator('.project-selector[data-project="opnotes"]');
      await card.scrollIntoViewIfNeeded();
      const cardBox = await card.boundingBox();
      const style = await card.getAttribute('style');
      const x = cardBox.x + cardBox.width / 2;
      const y = cardBox.y + cardBox.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 8; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + step * 4, y: y + step * 3 }] });
        await page.waitForTimeout(20);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(1200);
      assert.notEqual(await card.getAttribute('style'), style, 'touch drag moves the card');
      assert.equal(await page.getByRole('dialog').count(), 0, 'touch drag does not open a dialog');
      await card.tap();
      await page.getByRole('dialog').waitFor();
      await page.getByRole('button', { name: 'Put the card down' }).tap();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      scenario.touchDragAndTap = 'pass';
    } finally { await context.close(); }
  }
  // Normal-flow phones must scroll on cards, and the overflowing sheet must
  // scroll locally without moving its locked background. Native CDP gestures,
  // not dispatchEvent or programmatic scrollTop, drive both assertions.
  for (const [width, height] of [[390, 600], [320, 568]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, serviceWorkers: 'block' });
    try {
      const page = await context.newPage();
      page.on('pageerror', error => results.errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      const card = page.locator('.project-selector[data-project="opnotes"]');
      await card.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const cdp = await context.newCDPSession(page);
      const swipe = async (x, y) => {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        for (let step = 1; step <= 12; step++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 10 }] });
          await page.waitForTimeout(20);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(250);
      };
      await card.scrollIntoViewIfNeeded();
      const box = await card.boundingBox();
      const before = await page.evaluate(() => scrollY);
      const style = await card.getAttribute('style');
      await swipe(box.x + box.width / 2, box.y + box.height / 2);
      const after = await page.evaluate(() => scrollY);
      assert.ok(after > before + 40, 'native swipe on a normal-flow phone card scrolls the page');
      assert.equal(await card.getAttribute('style'), style, 'phone scrolling never drags the card');
      assert.equal(await page.getByRole('dialog').count(), 0);
      await card.tap();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      await page.waitForTimeout(450);
      const sheet = await dialog.boundingBox();
      const background = await page.evaluate(() => scrollY);
      const scrollBefore = await dialog.evaluate(el => el.scrollTop);
      await swipe(sheet.x + sheet.width / 2, sheet.y + sheet.height - 80);
      const scrollAfter = await dialog.evaluate(el => el.scrollTop);
      assert.ok(scrollAfter > scrollBefore + 40, 'native swipe scrolls the overflowing detail sheet');
      assert.equal(await page.evaluate(() => scrollY), background, 'modal scroll cannot move the locked page');
      await page.getByRole('button', { name: 'Put the card down' }).tap();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.project), 'opnotes');
      results.scenarios.push({ width, height, before, after, scrollBefore, scrollAfter, background, phoneCardScroll: 'pass', sheetScroll: 'pass', focusReturn: 'pass' });
    } finally { await context.close(); }
  }
  assert.deepEqual(results.errors, []);
  results.status = 'pass';
} catch (error) {
  results.status = 'fail';
  results.failure = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
