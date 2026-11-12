import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadTypeScript, plain } from './helpers/typescript-module.mjs';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/card-desk-rendering.json', import.meta.url), 'utf8'));
const { projects, projectOrder, projectGroups } = loadTypeScript(new URL('../src/projects.ts', import.meta.url));
const { EvidencePanel } = loadTypeScript(new URL('../src/EvidencePanel.tsx', import.meta.url));

test('catalogue preserves every field, group and reading order from the baseline', () => {
  assert.deepEqual(plain(projects), fixture.projects);
  assert.deepEqual(plain(projectOrder), fixture.order);
  assert.deepEqual(plain(projectGroups), fixture.groups);
  assert.deepEqual(plain(projectGroups.flatMap(group => group.keys)), fixture.order);
});

for (const key of fixture.order) test(`${key}: complete rendered evidence is byte-identical to the approved baseline`, () => {
  assert.equal(renderToStaticMarkup(createElement(EvidencePanel, { project: key })), fixture.evidence[key]);
});
