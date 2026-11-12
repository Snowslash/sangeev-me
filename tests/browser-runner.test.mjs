import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';

// Small subprocess checks: no browser is launched. A missing executable must
// fail promptly, not leave the artifact server listening until CI times out.
for (const runner of ['card-desk-browser', 'card-desk-motion', 'scatter-collision', 'card-desk-touch', 'card-previews-browser']) {
  test(`${runner}: browser launch failure exits without leaving a preview server alive`, () => {
    mkdirSync('.cache', { recursive: true });
    const output = mkdtempSync(path.resolve('.cache/browser-launch-'));
    try {
      const result = spawnSync(process.execPath, [`scripts/${runner}.mjs`], {
        env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '0', CHROMIUM_PATH: path.join(output, 'missing-chromium'), CARD_DESK_EVIDENCE: output },
        encoding: 'utf8', timeout: 4000,
      });
      assert.equal(result.error, undefined, `${runner} must not hang after launch failure: ${result.error}`);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /executable.*doesn't exist/);
    } finally { rmSync(output, { recursive: true, force: true }); }
  });
}
