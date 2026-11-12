import { groupIndex, projectGroups, projectOrder, type ProjectKey } from "./projects";

export type Mode = "scatter" | "groups" | "stack";
export type Pose = { x: number; y: number; r: number };
export type Poses = Record<ProjectKey, Pose>;
export type Spots = Partial<Record<ProjectKey, [number, number, number]>>;

/** Content-box desk dimensions in CSS pixels; DOM measurement stays in App. */
export type DeskGeometry = { width: number; height: number; introWidth: number; introHeight: number };
type ShelfArea = Pick<DeskGeometry, "width" | "introWidth">;

export const CARD_W = 280;
export const CARD_H = 160;
const SHELF_LABEL = 32;
const SHELF_GAP = 12;
const ROW_GAP = 16;
export const SLOT_GAP = 24;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const shelfLeft = ({ introWidth }: Pick<DeskGeometry, "introWidth">) => introWidth + 48;

/** Shelves sit beside the intro whenever at least one card fits there. */
export const shelvesFit = (area: ShelfArea) => area.width - shelfLeft(area) >= CARD_W;
export const perShelfRow = (area: ShelfArea) => Math.max(1, Math.floor((area.width - shelfLeft(area) + SLOT_GAP) / (CARD_W + SLOT_GAP)));

/** One labelled shelf per group; a group longer than a row wraps onto further rows. */
export function shelves(area: ShelfArea) {
  const perRow = perShelfRow(area);
  let top = 0;
  return projectGroups.map((group) => {
    const rows = Math.max(1, Math.ceil(group.keys.length / perRow));
    const shelf = { top, perRow, rows };
    top += SHELF_LABEL + rows * CARD_H + (rows - 1) * ROW_GAP + SHELF_GAP;
    return shelf;
  });
}

const gridCols = (width: number) => Math.max(1, Math.min(3, Math.floor(width / (CARD_W + 16))));

/** The desk height a mode needs so every card lands on it; 0 when the default desk is enough. */
export function neededHeight(mode: Mode, area: Omit<DeskGeometry, "height">) {
  if (mode !== "groups") return 0;
  if (!shelvesFit(area)) return area.introHeight + 40 + Math.ceil(projectOrder.length / gridCols(area.width)) * (CARD_H + 24);
  const last = shelves(area).at(-1)!;
  return last.top + SHELF_LABEL + last.rows * CARD_H + (last.rows - 1) * ROW_GAP;
}

/** True when a card would touch the intro, allowing for lean and a clear margin. */
const introBlocks = (x: number, y: number, area: DeskGeometry) => x < area.introWidth + 24 && y < area.introHeight + 32;

/** A fresh scatter, preserving the supplied search, sort and RNG consumption. */
export function randomSpots(area: DeskGeometry, random: () => number = Math.random): Spots {
  const freeW = Math.max(1, area.width - CARD_W);
  const freeH = Math.max(1, area.height - CARD_H);
  const placed: { x: number; y: number }[] = [];
  const spots: Spots = {};
  const order = [...projectOrder].sort(() => random() - 0.5);
  for (const key of order) {
    let best: { x: number; y: number } | null = null;
    let bestScore = -Infinity;
    // Best of many random tries: the candidate whose card edges sit farthest from every card already down
    // (negative means overlap), so names stay readable.
    for (let attempt = 0; attempt < 160; attempt++) {
      const x = 24 + random() * Math.max(0, freeW - 48);
      const y = 24 + random() * Math.max(0, freeH - 48);
      if (introBlocks(x, y, area)) continue;
      const score = placed.length
        ? Math.min(...placed.map((spot) => Math.max(Math.abs(spot.x - x) - CARD_W, Math.abs(spot.y - y) - CARD_H)))
        : random();
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    const spot = best ?? { x: shelfLeft(area), y: 24 };
    placed.push(spot);
    spots[key] = [spot.x / freeW, spot.y / freeH, Math.round((random() * 6 - 3) * 10) / 10];
  }
  return spots;
}

export function layout(mode: Mode, area: DeskGeometry, spots: Spots = {}): Poses {
  const { width, height, introWidth, introHeight } = area;
  const poses = {} as Poses;
  const room = Math.max(height, neededHeight(mode, area));
  const freeW = Math.max(0, width - CARD_W);
  const freeH = Math.max(0, room - CARD_H);
  const shelfGeometry = shelves(area);
  const cols = gridCols(width);
  projectOrder.forEach((key, index) => {
    let pose: Pose;
    if (mode === "scatter") {
      const [fx, fy, r] = spots[key] ?? [0.5, 0.5, 0];
      // Normalized spots can enter the intro (including its controls) after a
      // resize. Recheck the current geometry, retaining the deal where safe.
      let x = clamp(fx * freeW, 24, Math.max(24, freeW - 24));
      let y = clamp(fy * freeH, 24, Math.max(24, freeH - 24));
      if (introBlocks(x, y, area)) {
        const right = introWidth + 24;
        const below = introHeight + 32;
        if (right <= freeW - 24 && right - x < below - y) x = right;
        else y = below;
      }
      pose = { x, y, r };
    } else if (mode === "groups" && shelvesFit(area)) {
      const group = groupIndex(key);
      const shelf = shelfGeometry[group];
      const slot = projectGroups[group].keys.indexOf(key);
      pose = {
        x: shelfLeft(area) + (slot % shelf.perRow) * (CARD_W + SLOT_GAP),
        y: shelf.top + SHELF_LABEL + Math.floor(slot / shelf.perRow) * (CARD_H + ROW_GAP),
        r: 0,
      };
    } else if (mode === "groups") {
      const colW = width / cols;
      pose = { x: (index % cols) * colW + (colW - CARD_W) / 2, y: introHeight + 40 + Math.floor(index / cols) * (CARD_H + 24), r: 0 };
    } else {
      pose = {
        x: Math.max(shelfLeft(area), width * 0.66 - CARD_W / 2) + index * 4,
        y: room * 0.34 - CARD_H / 2 + index * 7,
        r: (index % 2 ? 1 : -1) * (1 + index * 0.8),
      };
    }
    // Overflow guard: whatever the arrangement, every card stays on the desk.
    poses[key] = { ...pose, x: clamp(pose.x, 0, freeW), y: clamp(pose.y, 0, freeH) };
  });
  return poses;
}
