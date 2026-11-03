import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createPreviewServer } from './preview.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.CARD_DESK_EVIDENCE || '.cache/scatter-collision');
await mkdir(output, { recursive: true });
const result = { cases: [], errors: [], external: [] };
const server = await createPreviewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, args: ['--renderer-process-limit=1'] });
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme, serviceWorkers: 'block' });
    try {
      await context.route('**/*', route => {
        if (route.request().url().startsWith(origin + '/')) return route.continue();
        result.external.push(route.request().url()); return route.abort();
      });
      await context.addInitScript(() => {
        let state = 29;
        Math.random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
      });
      const page = await context.newPage();
      page.setDefaultTimeout(2500);
      page.on('pageerror', error => result.errors.push(error.message));
      await page.goto(origin);
      await page.locator('.project-selector').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.estate-site-header button').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      await page.waitForTimeout(1500);
      for (const [width, name] of [[1440, 'Scatter'], [800, null], [768, null], [800, 'Scatter'], [800, 'Stack'], [800, 'Scatter'], [800, 'Sort by group'], [800, 'Scatter'], [1440, null], [768, null]]) {
        await page.setViewportSize({ width, height: 900 });
        if (name) await page.getByRole('button', { name, exact: true }).click();
        await page.waitForTimeout(1500);
        const snapshot = await page.evaluate(() => {
          const rect = el => el.getBoundingClientRect().toJSON();
          const cards = [...document.querySelectorAll('.project-selector')].map(el => ({ key: el.dataset.project, ...rect(el) }));
          const controls = [...document.querySelectorAll('.desk-tray button')].map(el => {
            const box = rect(el);
            const points = [0.2, 0.5, 0.8].map(f => ({ x: box.left + box.width * f, y: box.top + box.height / 2 }));
            return { text: el.textContent, ...box, reachable: points.every(p => el.contains(document.elementFromPoint(p.x, p.y))) };
          });
          return { width: innerWidth, mode: document.querySelector('.project-window').dataset.mode, desk: rect(document.querySelector('.project-window')), cards, controls };
        });
        result.cases.push({ theme, action: name || 'resize', ...snapshot });
        assert.ok(snapshot.controls.every(c => c.reachable), `controls covered after ${name || 'resize'} at ${width}: ${JSON.stringify(snapshot.controls)}`);
        if (snapshot.mode === 'scatter') for (const card of snapshot.cards) {
          assert.ok(card.left >= snapshot.desk.left - 1 && card.right <= snapshot.desk.right + 1 && card.top >= snapshot.desk.top - 1 && card.bottom <= snapshot.desk.bottom + 1, `${card.key} outside desk`);
          assert.ok(snapshot.controls.every(c => card.right <= c.left || card.left >= c.right || card.bottom <= c.top || card.top >= c.bottom), `${card.key} collides with controls`);
        }
      }
      // Every control is activated by a real pointer, never a forced click.
      for (const name of ['Stack', 'Sort by group', 'Scatter']) {
        await page.getByRole('button', { name, exact: true }).click();
        await page.waitForTimeout(1400);
        assert.equal(await page.getByRole('button', { name, exact: true }).getAttribute('aria-pressed'), 'true');
      }
      await page.screenshot({ path: path.join(output, `scatter-${theme}-768.png`), fullPage: true });
    } finally { await context.close(); }
  }
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.external, []);
  result.status = 'pass';
} catch (error) { result.status = 'fail'; result.failure = error.message; process.exitCode = 1; }
finally {
  await writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ status: result.status, cases: result.cases.length, failure: result.failure, output }));
  await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
}
