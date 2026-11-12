import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { loadTypeScript, plain, seededRandom } from './helpers/typescript-module.mjs';

const moduleUrl = new URL('../src/desk-layout.ts', import.meta.url);
const { layout, randomSpots, neededHeight, shelves, shelvesFit, perShelfRow } = loadTypeScript(moduleUrl);

const scatterFixture = JSON.parse(readFileSync(new URL('./fixtures/desk-scatter.json', import.meta.url), 'utf8'));
test('production default consumes Math.random rather than a fixed test seed', () => {
  const fixture = scatterFixture.cases[0];
  const math = Object.create(Math);
  math.random = seededRandom(fixture.seed);
  const subject = loadTypeScript(moduleUrl, { Math: math });
  assert.deepEqual(plain(subject.randomSpots(fixture.geometry)), fixture.spots);
});
for (const fixture of scatterFixture.cases) test(`seed ${fixture.seed} at ${fixture.geometry.width}: preserves RNG consumption, deal order and complete poses`, () => {
  let calls = 0;
  const rng = seededRandom(fixture.seed);
  const spots = randomSpots(fixture.geometry, () => { calls++; return rng(); });
  assert.equal(calls, fixture.calls);
  assert.deepEqual(Object.keys(spots), Object.keys(fixture.spots));
  assert.deepEqual(plain(spots), fixture.spots);
  assert.deepEqual(plain(layout('scatter', fixture.geometry, spots)), fixture.poses);
  assert.deepEqual(plain(layout('scatter', { ...fixture.geometry, width: 688 }, spots)), fixture.resized);
});

const keys = ['opnotes', 'scratchpad', 'aligned', 'casebook', 'parallax', 'glassbox'];
const geometry = (width, height = 720, introHeight = 360, introWidth = 380) => ({ width, height, introWidth, introHeight });
const poses = (xs, ys, rotations = keys.map(() => 0)) => Object.fromEntries(keys.map((key, i) => [key, { x: xs[i], y: ys[i], r: rotations[i] }]));

test('wide groups retain reading order, shelf labels, gaps and exact returned poses', () => {
  const desk = geometry(1180);
  assert.equal(shelvesFit(desk), true);
  assert.equal(perShelfRow(desk), 2);
  assert.deepEqual(plain(shelves(desk)), [0, 204, 408].map(top => ({ top, perRow: 2, rows: 1 })));
  assert.equal(neededHeight('groups', desk), 600);
  assert.deepEqual(plain(layout('groups', desk)), poses([428, 732, 428, 732, 428, 732], [32, 32, 236, 236, 440, 440]));
});

test('shelves wrap at their exact fit boundary without dropping the final group', () => {
  assert.equal(shelvesFit(geometry(707)), false);
  assert.equal(shelvesFit(geometry(708)), true);
  assert.equal(perShelfRow(geometry(1011)), 1);
  assert.equal(perShelfRow(geometry(1012)), 2);
  const desk = geometry(728);
  assert.equal(neededHeight('groups', desk), 1128);
  assert.deepEqual(plain(layout('groups', desk)), poses(keys.map(() => 428), [32, 208, 412, 588, 792, 968]));
});

test('small geometry places groups below the explicit introduction and expands the desk', () => {
  const desk = geometry(688);
  assert.equal(neededHeight('groups', desk), 952);
  assert.deepEqual(plain(layout('groups', desk)), poses([32, 376, 32, 376, 32, 376], [400, 400, 584, 584, 768, 768]));
  const small = geometry(320);
  assert.equal(neededHeight('groups', small), 1504);
  assert.deepEqual(plain(layout('groups', small)), poses(keys.map(() => 20), [400, 584, 768, 952, 1136, 1320]));
});

test('stack keeps supplied offsets and alternating lean without growing the desk', () => {
  const desk = geometry(1180);
  assert.equal(neededHeight('stack', desk), 0);
  assert.equal(neededHeight('scatter', desk), 0);
  const actual = plain(layout('stack', desk));
  for (const [i, key] of keys.entries()) {
    assert.equal(actual[key].x, Math.max(428, 1180 * 0.66 - 140) + i * 4);
    assert.equal(actual[key].y, 720 * 0.34 - 80 + i * 7);
    assert.equal(actual[key].r, (i % 2 ? 1 : -1) * (1 + i * 0.8));
  }
});

test('scatter resize revalidates a known intro collision, preserving safe poses and lean', () => {
  const spots = { opnotes: [0.4, 0.1, -2.3], scratchpad: [0.95, 0.05, 1.7], aligned: [0.1, 0.95, 0.4] };
  const before = structuredClone(spots);
  const wide = layout('scatter', geometry(1180), spots);
  assert.deepEqual(plain(wide.opnotes), { x: 404, y: 56, r: -2.3 });
  const narrow = layout('scatter', geometry(688), spots);
  assert.deepEqual(plain(narrow.opnotes), { x: 163.20000000000002, y: 392, r: -2.3 });
  assert.deepEqual(plain(narrow.scratchpad), { x: 384, y: 392, r: 1.7 });
  assert.deepEqual(plain(narrow.aligned), { x: 40.800000000000004, y: 532, r: 0.4 });
  assert.deepEqual(spots, before, 'layout must not rewrite the saved normalized deal');
});

test('overflow guards remain finite for small, empty and oversized normalized geometry', () => {
  for (const width of [0, 240, 320, 688, 1180, 1920]) for (const mode of ['groups', 'stack', 'scatter']) {
    const desk = geometry(width, 0);
    const result = layout(mode, desk, { opnotes: [-2, 4, -3] });
    assert.deepEqual(Object.keys(result), keys);
    for (const pose of Object.values(result)) {
      assert.ok(Object.values(pose).every(Number.isFinite));
      assert.ok(pose.x >= 0 && pose.x <= Math.max(0, width - 280));
      assert.ok(pose.y >= 0 && pose.y <= Math.max(0, neededHeight(mode, desk) - 160));
    }
  }
});

test('geometry obeys an explicit intro width rather than an ambient fixed column', () => {
  const desk = geometry(900, 720, 200, 200);
  assert.deepEqual(plain(layout('groups', desk)), poses([248, 552, 248, 552, 248, 552], [32, 32, 236, 236, 440, 440]));
  assert.deepEqual(plain(layout('scatter', desk, { opnotes: [0.1, 0.1, 2] }).opnotes), { x: 224, y: 56, r: 2 });
});

test('injected random sources reproduce complete deals without changing key or lean semantics', () => {
  const desk = geometry(1180);
  const first = plain(randomSpots(desk, seededRandom(29)));
  const second = plain(randomSpots(desk, seededRandom(29)));
  assert.deepEqual(first, second, 'same RNG stream must yield the same deal');
  assert.notDeepEqual(first, plain(randomSpots(desk, seededRandom(30))));
  assert.deepEqual(Object.keys(first).sort(), [...keys].sort());
  for (const [fx, fy, r] of Object.values(first)) {
    assert.ok(fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1);
    assert.ok(r >= -3 && r <= 3);
    assert.ok(Math.abs(r * 10 - Math.round(r * 10)) < 1e-10);
    assert.ok(fx * 900 >= 404 || fy * 560 >= 392);
  }
});
