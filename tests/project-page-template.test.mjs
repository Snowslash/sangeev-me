import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// Maintainer templates must not add utilities to the unchanged homepage.
test('project-page templates are excluded from homepage utility discovery', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /@source not "\.\.\/project-pages";/);
});
