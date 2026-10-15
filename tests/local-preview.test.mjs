import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

// Small HTTP integration test. No browser, network dependency or package install.
test('local preview serves exact built bytes with the existing policy and real 404s', async () => {
  assert.ok(existsSync(new URL('../scripts/preview.mjs', import.meta.url)), 'local artifact preview must exist');
  const { createPreviewServer } = await import('../scripts/preview.mjs');
  const server = await createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ['/', '/index.html', '/?review=card-desk']) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.equal(await response.text(), readFileSync(new URL('../docs/index.html', import.meta.url), 'utf8'));
      assert.match(response.headers.get('content-security-policy'), /style-src 'self';/);
      assert.doesNotMatch(response.headers.get('content-security-policy'), /unsafe-inline|unsafe-eval/);
      assert.equal(response.headers.get('x-frame-options'), 'DENY');
      assert.match(response.headers.get('x-robots-tag'), /noindex/);
    }
    const head = await fetch(origin, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const asset = readdirSync(new URL('../docs/assets/', import.meta.url)).find(p => p.endsWith('.js'));
    const response = await fetch(`${origin}/assets/${asset}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /javascript/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(new URL(`../docs/assets/${asset}`, import.meta.url)));
    for (const route of ['/missing', '/assets/', '/%2e%2e%2fpackage.json', '/_headers']) {
      const response = await fetch(origin + route);
      assert.equal(response.status, 404, route);
      assert.match(await response.text(), /Page not found/);
    }
    assert.equal((await fetch(origin, { method: 'POST', body: 'not accepted' })).status, 405);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
