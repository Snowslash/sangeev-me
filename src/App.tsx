import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { X } from "lucide-react";
import { EstatePageTitle, EstateShell, PublicEstateHeader, useEstateTheme } from "@sangeev/estate-ui";
import { IdlePreview, previews } from "./Previews";

type ProjectKey = "opnotes" | "scratchpad" | "aligned" | "casebook" | "parallax" | "glassbox";

type ProjectRecord = {
  name: string;
  description: string;
  href: string;
  action: string;
  ariaLabel: string;
  /** A few words for the card face; the full description shows when the card is picked up. */
  tagline: string;
};

const projects: Record<ProjectKey, ProjectRecord> = {
  opnotes: {
    name: "Operation Note Generator",
    description: "Pick a procedure, fill in a few fields, and get a plain-text operation note to check and copy. Covers general surgery and trauma and orthopaedics.",
    href: "https://opnotes.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open project: Operation Note Generator",
    tagline: "Plain-text operation note drafts",
  },
  scratchpad: {
    name: "Clinical Shift Scratchpad",
    description: "A quick list for ward jobs during a shift. It stays on your device and clears itself when you’re done.",
    href: "https://scratchpad.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open project: Clinical Shift Scratchpad",
    tagline: "A ward-job list for one shift",
  },
  aligned: {
    name: "AlignEd",
    description: "Keeps your teaching plans, feedback and reflections together, then exports them for your portfolio.",
    href: "https://aligned.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open project: AlignEd",
    tagline: "Teaching evidence, kept together",
  },
  casebook: {
    name: "Casebook",
    description: "Turns your surgical logbook export into charts you can filter, and shows the exact entries behind every number.",
    href: "https://casebook.sangeev.me/",
    action: "Open project ↗",
    ariaLabel: "Open project: Casebook",
    tagline: "Your surgical logbook, as charts",
  },
  parallax: {
    name: "Parallax",
    description: "Practise reading X-rays: compare two views of the same wire, then see in 3D where it really lies.",
    href: "https://parallax.sangeev.me/",
    action: "Open project ↗",
    ariaLabel: "Open project: Parallax",
    tagline: "Learn to read X-ray views",
  },
  glassbox: {
    name: "Glassbox",
    description: "Predict what happens, watch a recorded physiology experiment, then see what changed and why.",
    href: "https://glassbox.sangeev.me/",
    action: "Open project ↗",
    ariaLabel: "Open project: Glassbox",
    tagline: "Predict, then watch the physiology",
  },
};

const projectOrder: ProjectKey[] = ["opnotes", "scratchpad", "aligned", "casebook", "parallax", "glassbox"];

// Groups follow projectOrder, so arrow-key order matches reading order.
const projectGroups: { id: string; title: string; keys: ProjectKey[] }[] = [
  { id: "clinical-workflow", title: "Clinical workflow", keys: ["opnotes", "scratchpad"] },
  { id: "portfolio", title: "Portfolio", keys: ["aligned", "casebook"] },
  { id: "labs", title: "Physiology and imaging labs", keys: ["parallax", "glassbox"] },
];

function EvidencePanel({ project }: { project: ProjectKey }) {
  switch (project) {
    case "opnotes":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">What you fill in</span>
            <div className="op-facts">
              <div className="op-fact"><small>Finding</small><strong>Purulent fluid</strong></div>
              <div className="op-fact"><small>Packing</small><strong>Ribbon gauze packing</strong></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">The draft you check</span>
            <pre className="note-excerpt"><strong>Findings:</strong> Purulent fluid encountered.{"\n"}<strong>Operation:</strong> Cavity packed with ribbon gauze.</pre>
          </div>
        </div>
      );

    case "scratchpad":
      return (
        <div className="hinge scratch-hinge">
          <div className="hinge-cause">
            <span className="hinge-label">A job you jot down</span>
            <div className="capture-ticket">
              <div className="capture-task">Chase CT</div>
              <div className="capture-meta"><span>urgent</span><span>C7 / Bed 4</span></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">How it sits on your list</span>
            <div className="active-row">
              <span className="active-row__priority">urgent</span>
              <div><strong>Chase CT</strong><small>C7 / Bed 4</small></div>
              <time dateTime="18:00">expires 18:00</time>
            </div>
          </div>
        </div>
      );

    case "aligned":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Feedback from a session</span>
            <div className="confidence-facts">
              <div className="confidence-change"><span>Confidence</span><strong>2.5 → 4.0</strong></div>
              <p className="feedback-theme">Theme: <q>More time with suturing</q></p>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">What to change next time</span>
            <p className="session-action"><strong>Allow a longer practical station</strong> and repeat the confidence measure.</p>
          </div>
        </div>
      );

    case "casebook":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Example filter</span>
            <div className="op-facts">
              <div className="op-fact"><small>Role</small><strong>Performed</strong></div>
              <div className="op-fact"><small>Month</small><strong>February 2026</strong></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Logbook entries that match</span>
            <div className="op-facts">
              <div className="op-fact"><small>Source rows 5 and 6</small><strong>Synthetic procedure A</strong></div>
              <p className="op-note">Duplicate retained</p>
            </div>
          </div>
        </div>
      );

    case "parallax":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">First view</span>
            <div className="op-facts">
              <div className="op-fact"><small>View</small><strong>0°</strong></div>
              <div className="op-fact"><small>Tip</small><strong>Within the outline</strong></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Additional view</span>
            <div className="op-facts">
              <div className="op-fact"><small>View</small><strong>60°</strong></div>
              <div className="op-fact"><small>Tip</small><strong>Beyond the outline</strong></div>
            </div>
          </div>
        </div>
      );

    case "glassbox":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Before blood loss</span>
            <div className="op-facts">
              <div className="op-fact"><small>Blood volume</small><strong>5,487 mL</strong></div>
              <div className="op-fact"><small>Mean arterial pressure</small><strong>95.3 mmHg</strong></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">At 550 s</span>
            <div className="op-facts">
              <div className="op-fact"><small>Blood volume</small><strong>4,685 mL</strong></div>
              <div className="op-fact"><small>Mean arterial pressure</small><strong>94.2 mmHg</strong></div>
            </div>
          </div>
        </div>
      );
  }
}

const themeColors = { dark: "#061e1d", light: "#073f3c" } as const;

type Mode = "scatter" | "groups" | "stack";
type Pose = { x: number; y: number; r: number };
type Poses = Record<ProjectKey, Pose>;

const CARD_W = 280;
const CARD_H = 160;
const INTRO_W = 380;
const SHELF_LEFT = INTRO_W + 48;
const SHELF_LABEL = 32;
const SHELF_GAP = 12;
const ROW_GAP = 16;
const SLOT_GAP = 24;

const groupIndex = (key: ProjectKey) => projectGroups.findIndex((group) => group.keys.includes(key));
const groupOf = (key: ProjectKey) => projectGroups[groupIndex(key)];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const keyFromHash = (): ProjectKey | null => {
  const key = window.location.hash.slice(1);
  return (projectOrder as string[]).includes(key) ? (key as ProjectKey) : null;
};

/** Shelves sit beside the intro whenever at least one card fits there. */
const shelvesFit = (width: number) => width - SHELF_LEFT >= CARD_W;
const perShelfRow = (width: number) => Math.max(1, Math.floor((width - SHELF_LEFT + SLOT_GAP) / (CARD_W + SLOT_GAP)));

/** One labelled shelf per group; a group longer than a row wraps onto further rows. */
function shelves(width: number) {
  const perRow = perShelfRow(width);
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
function neededHeight(mode: Mode, width: number, introHeight: number) {
  if (mode !== "groups") return 0;
  if (!shelvesFit(width)) return introHeight + 40 + Math.ceil(projectOrder.length / gridCols(width)) * (CARD_H + 24);
  const last = shelves(width).at(-1)!;
  return last.top + SHELF_LABEL + last.rows * CARD_H + (last.rows - 1) * ROW_GAP;
}

type Spots = Partial<Record<ProjectKey, [number, number, number]>>;

/** True when a card at (x, y) would touch the intro column, allowing for its lean and a clear margin. */
const introBlocks = (x: number, y: number, introHeight: number) => x < INTRO_W + 24 && y < introHeight + 32;

/** A fresh scatter: each card at a random open spot, spread apart and clear of the intro, with a random lean. */
function randomSpots(width: number, height: number, introHeight: number): Spots {
  const freeW = Math.max(1, width - CARD_W);
  const freeH = Math.max(1, height - CARD_H);
  const placed: { x: number; y: number }[] = [];
  const spots: Spots = {};
  const order = [...projectOrder].sort(() => Math.random() - 0.5);
  for (const key of order) {
    let best: { x: number; y: number } | null = null;
    let bestScore = -Infinity;
    // Best of many random tries: the candidate whose card edges sit farthest from every card already down
    // (negative means overlap), so names stay readable.
    for (let attempt = 0; attempt < 160; attempt++) {
      const x = 24 + Math.random() * Math.max(0, freeW - 48);
      const y = 24 + Math.random() * Math.max(0, freeH - 48);
      if (introBlocks(x, y, introHeight)) continue;
      const score = placed.length
        ? Math.min(...placed.map((spot) => Math.max(Math.abs(spot.x - x) - CARD_W, Math.abs(spot.y - y) - CARD_H)))
        : Math.random();
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
    const spot = best ?? { x: SHELF_LEFT, y: 24 };
    placed.push(spot);
    spots[key] = [spot.x / freeW, spot.y / freeH, Math.round((Math.random() * 6 - 3) * 10) / 10];
  }
  return spots;
}

function layout(mode: Mode, width: number, height: number, introHeight: number, spots: Spots = {}): Poses {
  const poses = {} as Poses;
  const room = Math.max(height, neededHeight(mode, width, introHeight));
  const freeW = Math.max(0, width - CARD_W);
  const freeH = Math.max(0, room - CARD_H);
  const shelfGeometry = shelves(width);
  const cols = gridCols(width);
  projectOrder.forEach((key, index) => {
    let pose: Pose;
    if (mode === "scatter") {
      const [fx, fy, r] = spots[key] ?? [0.5, 0.5, 0];
      pose = { x: fx * freeW, y: fy * freeH, r };
    } else if (mode === "groups" && shelvesFit(width)) {
      const group = groupIndex(key);
      const shelf = shelfGeometry[group];
      const slot = projectGroups[group].keys.indexOf(key);
      pose = {
        x: SHELF_LEFT + (slot % shelf.perRow) * (CARD_W + SLOT_GAP),
        y: shelf.top + SHELF_LABEL + Math.floor(slot / shelf.perRow) * (CARD_H + ROW_GAP),
        r: 0,
      };
    } else if (mode === "groups") {
      const colW = width / cols;
      pose = { x: (index % cols) * colW + (colW - CARD_W) / 2, y: introHeight + 40 + Math.floor(index / cols) * (CARD_H + 24), r: 0 };
    } else {
      pose = {
        x: Math.max(SHELF_LEFT, width * 0.66 - CARD_W / 2) + index * 4,
        y: room * 0.34 - CARD_H / 2 + index * 7,
        r: (index % 2 ? 1 : -1) * (1 + index * 0.8),
      };
    }
    // Overflow guard: whatever the arrangement, every card stays on the desk.
    poses[key] = { ...pose, x: clamp(pose.x, 0, freeW), y: clamp(pose.y, 0, freeH) };
  });
  return poses;
}

// Where each card's smudge sits. Fixed per project so the look is stable.
const smudges: [number, number][] = [
  [82, 78],
  [18, 84],
  [76, 22],
  [24, 32],
  [88, 62],
  [40, 88],
];
const wearStyle = (key: ProjectKey) => {
  const [sx, sy] = smudges[projectOrder.indexOf(key) % smudges.length];
  return { "--smudge-x": `${sx}%`, "--smudge-y": `${sy}%` } as CSSProperties;
};

function useNarrow() {
  const query = "(max-width: 760px)";
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setNarrow(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

function App() {
  const { theme, toggleTheme } = useEstateTheme();
  const narrow = useNarrow();
  const deskRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Partial<Record<ProjectKey, HTMLButtonElement | null>>>({});
  const heldHeading = useRef<HTMLHeadingElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [viewHeight, setViewHeight] = useState(() => window.innerHeight);
  const [mode, setMode] = useState<Mode>("groups");
  // Each press of Scatter deals a new random arrangement; the page opens sorted by group.
  const [spots, setSpots] = useState<Spots>({});
  const [poses, setPoses] = useState<Poses>(() => layout("stack", 1180, 760, 360));
  const [stacking, setStacking] = useState<ProjectKey[]>(projectOrder);
  const [settling, setSettling] = useState(false);
  const [moving, setMoving] = useState<ProjectKey | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectKey | null>(keyFromHash);
  // Where the held card was lifted from, relative to its held pose, so pick-up reads as one card rising.
  const [lift, setLift] = useState<{ x: number; y: number; s: number; r: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  // The card under the pointer or keyboard focus, drawn in the preview window below the intro.
  const [preview, setPreview] = useState<ProjectKey | null>(null);
  const previewTimer = useRef(0);
  const showPreview = (key: ProjectKey | null) => {
    window.clearTimeout(previewTimer.current);
    // A short grace period so moving between neighbouring cards doesn't flash the idle picture.
    if (key) setPreview(key);
    else previewTimer.current = window.setTimeout(() => setPreview(null), 160);
  };
  const posesRef = useRef(poses);
  posesRef.current = poses;
  const dealt = useRef(false);
  const inertia = useRef(0);
  const dealFrame = useRef(0);
  const settleTimer = useRef(0);
  const closeTimer = useRef(0);
  const clickTimer = useRef(0);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const wasSelected = useRef<ProjectKey | null>(null);
  const cancelMotion = useCallback(() => {
    cancelAnimationFrame(inertia.current);
    cancelAnimationFrame(dealFrame.current);
    window.clearTimeout(settleTimer.current);
  }, []);
  const suppressClick = useRef(false);
  const drag = useRef<{
    key: ProjectKey; id: number; startX: number; startY: number; from: Pose;
    lastX: number; lastY: number; lastT: number; vx: number; vy: number; moved: boolean;
  } | null>(null);
  const project = selectedProject ? projects[selectedProject] : null;
  const introHeight = () => introRef.current?.offsetHeight ?? 360;
  // Keep the supplied window-height desk; grow it when grouped shelves need more room.
  const deskHeight = (m: Mode) => {
    const room = Math.max(720, viewHeight - 72 - 80);
    if (m !== "groups") return room;
    const intro = introHeight();
    return Math.max(room, Math.max(neededHeight("groups", size.width, intro), intro) + 32);
  };

  useEffect(() => {
    const onResize = () => setViewHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColors[theme]);
  }, [theme]);

  useLayoutEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(desk);
    return () => observer.disconnect();
  }, []);

  // Allow the last card's 55ms stagger to finish its full 860ms transition.
  const settle = useCallback((next: Poses, duration = 1300) => {
    cancelMotion();
    setMoving(null);
    setSettling(!reducedMotion());
    setPoses(next);
    if (!reducedMotion()) settleTimer.current = window.setTimeout(() => setSettling(false), duration);
  }, [cancelMotion]);

  // First paint: the cards start as a stack and are dealt across the desk once.
  useEffect(() => {
    cancelAnimationFrame(inertia.current);
    setMoving(null);
    if (!size.width || narrow) {
      cancelMotion();
      setSettling(false);
      return;
    }
    if (!dealt.current) {
      dealt.current = true;
      setPoses(layout("stack", size.width, deskHeight("groups"), introHeight()));
      if (reducedMotion()) setPoses(layout("groups", size.width, deskHeight("groups"), introHeight()));
      else dealFrame.current = requestAnimationFrame(() => { dealFrame.current = requestAnimationFrame(() => settle(layout("groups", size.width, deskHeight("groups"), introHeight()), 1300)); });
      return () => cancelAnimationFrame(dealFrame.current);
    }
    // Grouping can resize the desk. Retarget the cards without cancelling the
    // arrangement transition or its timer; full cleanup belongs to unmount.
    setPoses(layout(mode, size.width, deskHeight(mode), introHeight(), spots));
    return () => cancelAnimationFrame(dealFrame.current);
  }, [size, narrow, viewHeight, settle, cancelMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (!media.matches) return;
      cancelMotion();
      setSettling(false);
      setMoving(null);
      window.clearTimeout(clickTimer.current);
      suppressClick.current = false;
      if (dropping) {
        window.clearTimeout(closeTimer.current);
        setDropping(false);
        setSelectedProject(null);
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      setPoses(layout(mode, size.width, deskHeight(mode), introHeight(), spots));
    };
    media.addEventListener("change", stop);
    return () => media.removeEventListener("change", stop);
  }, [mode, size, spots, dropping, viewHeight, cancelMotion]);

  useEffect(() => () => {
    cancelMotion();
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(clickTimer.current);
    window.clearTimeout(previewTimer.current);
  }, [cancelMotion]);

  const arrange = (next: Mode) => {
    const nextSpots = next === "scatter" ? randomSpots(size.width, deskHeight("scatter"), introHeight()) : spots;
    if (next === "scatter") setSpots(nextSpots);
    setMode(next);
    setStacking(projectOrder);
    settle(layout(next, size.width, deskHeight(next), introHeight(), nextSpots));
  };

  const raise = (key: ProjectKey) => setStacking((current) => [...current.filter((k) => k !== key), key]);

  const place = (key: ProjectKey, pose: Pose) => {
    setPoses((current) => ({
      ...current,
      [key]: { ...pose, x: clamp(pose.x, 0, size.width - CARD_W), y: clamp(pose.y, 0, deskHeight(mode) - CARD_H) },
    }));
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, key: ProjectKey) => {
    if (narrow || event.button !== 0) return;
    cancelMotion();
    window.clearTimeout(clickTimer.current);
    suppressClick.current = false;
    setSettling(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    const now = performance.now();
    drag.current = {
      key, id: event.pointerId, startX: event.clientX, startY: event.clientY, from: posesRef.current[key],
      lastX: event.clientX, lastY: event.clientY, lastT: now, vx: 0, vy: 0, moved: false,
    };
    raise(key);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) < 5) return;
    if (!state.moved) {
      state.moved = true;
      setMoving(state.key);
    }
    const now = performance.now();
    const dt = Math.max(1, now - state.lastT);
    state.vx = state.vx * 0.6 + ((event.clientX - state.lastX) / dt) * 0.4;
    state.vy = state.vy * 0.6 + ((event.clientY - state.lastY) / dt) * 0.4;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastT = now;
    place(state.key, { x: state.from.x + dx, y: state.from.y + dy, r: state.from.r + clamp(state.vx * 9, -9, 9) });
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    if (!state.moved) return;
    suppressClick.current = true;
    clickTimer.current = window.setTimeout(() => { suppressClick.current = false; }, 0);
    const { key } = state;
    const rest = state.from.r;
    let { vx, vy } = state;
    if (reducedMotion()) {
      setMoving(null);
      place(key, { ...posesRef.current[key], r: rest });
      return;
    }
    // Throw: carry the release velocity, bleed it off with friction, stop at the desk edge.
    const floor = deskHeight(mode) - CARD_H;
    const step = () => {
      vx *= 0.9;
      vy *= 0.9;
      const pose = posesRef.current[key];
      const x = clamp(pose.x + vx * 16, 0, size.width - CARD_W);
      const y = clamp(pose.y + vy * 16, 0, floor);
      if (x === 0 || x === size.width - CARD_W) vx = 0;
      if (y === 0 || y === floor) vy = 0;
      const still = Math.hypot(vx, vy) < 0.02;
      posesRef.current = { ...posesRef.current, [key]: { x, y, r: still ? rest : rest + clamp(vx * 9, -9, 9) } };
      setPoses(posesRef.current);
      if (still) setMoving(null);
      else inertia.current = requestAnimationFrame(step);
    };
    inertia.current = requestAnimationFrame(step);
  };

  const onPointerCancel = () => {
    drag.current = null;
    cancelMotion();
    window.clearTimeout(clickTimer.current);
    suppressClick.current = false;
    setMoving(null);
    setSettling(false);
  };

  const focusCard = (key: ProjectKey) => {
    cancelMotion();
    setSettling(false);
    setMoving(null);
    if (!dealt.current) dealt.current = true;
    raise(key);
  };

  const pickUp = (key: ProjectKey) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    window.clearTimeout(closeTimer.current);
    cancelMotion();
    setSettling(false);
    setMoving(null);
    returnFocus.current = cardRefs.current[key] ?? null;
    raise(key);
    const card = cardRefs.current[key]?.getBoundingClientRect();
    const desk = deskRef.current?.getBoundingClientRect();
    if (card && desk && !narrow) {
      const heldW = Math.min(780, window.innerWidth - 32);
      setLift({
        x: card.left + card.width / 2 - window.innerWidth / 2,
        y: card.top + card.height / 2 - window.innerHeight / 2,
        s: CARD_W / heldW,
        r: posesRef.current[key].r,
      });
    } else setLift(null);
    setDropping(false);
    setSelectedProject(key);
    history.replaceState(null, "", `#${key}`);
  };

  const putDown = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    const finish = () => {
      setDropping(false);
      setSelectedProject(null);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    if (reducedMotion()) finish();
    else {
      setDropping(true);
      closeTimer.current = window.setTimeout(finish, 280);
    }
  }, []);

  useEffect(() => {
    const onHash = () => {
      window.clearTimeout(closeTimer.current);
      cancelMotion();
      setSettling(false);
      setMoving(null);
      setDropping(false);
      setLift(null);
      const key = keyFromHash();
      // URL navigation changes the return target even while another card is held.
      if (key) returnFocus.current = cardRefs.current[key] ?? null;
      setSelectedProject(key);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [cancelMotion]);

  useLayoutEffect(() => {
    if (selectedProject) {
      if (!returnFocus.current) returnFocus.current = cardRefs.current[selectedProject] ?? null;
      heldHeading.current?.focus({ preventScroll: true });
    } else if (wasSelected.current) {
      returnFocus.current?.focus();
      returnFocus.current = null;
    }
    wasSelected.current = selectedProject;
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        putDown();
      }
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
      if (!controls?.length) { event.preventDefault(); heldHeading.current?.focus(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !Array.from(controls).includes(active as HTMLElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (active === last || !Array.from(controls).includes(active as HTMLElement))) {
        event.preventDefault(); first.focus();
      }
    };
    const keepFocus = (event: FocusEvent) => {
      if (!dialogRef.current?.contains(event.target as Node)) heldHeading.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("focusin", keepFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", keepFocus);
    };
  }, [selectedProject, putDown]);

  // Arrow keys nudge the focused card across the desk; Shift moves it further.
  const onCardKey = (event: KeyboardEvent<HTMLButtonElement>, key: ProjectKey) => {
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const move = moves[event.key];
    if (!move || narrow) return;
    event.preventDefault();
    const distance = event.shiftKey ? 96 : 24;
    raise(key);
    const pose = posesRef.current[key];
    place(key, { ...pose, x: pose.x + move[0] * distance, y: pose.y + move[1] * distance });
  };

  return (
    <>
      <div inert={Boolean(selectedProject)}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PublicEstateHeader current="home" navigation="projects" theme={theme} onToggleTheme={toggleTheme} />
      </div>
      <main className="desk-page" id="main-content" tabIndex={-1}>
        <EstateShell variant="landing">
          <section
            className="project-window"
            id="projects"
            aria-labelledby="page-title"
            ref={deskRef}
            data-mode={mode}
            data-narrow={narrow || undefined}
            style={narrow || !size.width ? undefined : { height: deskHeight(mode), minHeight: 0 }}
          >
            <div className="intro" ref={introRef} inert={Boolean(selectedProject)}>
              <EstatePageTitle id="page-title" variant="landing">Hi, I’m Sangeev<span className="title-stop">.</span></EstatePageTitle>
              <p className="lede">I build small tools that run in your browser, for surgical training, ward work and teaching.</p>
              <p className="desk-hint">
                {narrow ? "Tap a project to see an example of it working." : "Click a card to see an example of it working. You can also drag the cards around."}
              </p>
              {!narrow && (
                <div className="desk-tray" role="group" aria-label="Arrange the cards">
                  {(
                    [
                      ["scatter", "Scatter"],
                      ["groups", "Sort by group"],
                      ["stack", "Stack"],
                    ] as const
                  ).map(([value, label]) => (
                    <button type="button" key={value} aria-pressed={mode === value} onClick={() => arrange(value)}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!narrow &&
              shelvesFit(size.width) &&
              projectGroups.map((group, shelf) => (
                <p
                  className="shelf-label"
                  aria-hidden="true"
                  key={group.id}
                  style={{
                    transform: `translate(${SHELF_LEFT}px, ${shelves(size.width)[shelf].top}px)`,
                    width: perShelfRow(size.width) * (CARD_W + SLOT_GAP) - SLOT_GAP,
                  }}
                >
                  {group.title}
                </p>
              ))}

            {!narrow && shelvesFit(size.width) && (() => {
              // The space under the intro, beside the shelves, shows a wordless picture of the hovered project.
              const top = introHeight() + 28;
              const height = neededHeight("groups", size.width, introHeight()) - top;
              const Diagram = preview ? previews[preview] : IdlePreview;
              return (
                <div
                  className="preview-window"
                  aria-hidden="true"
                  data-shown={(mode === "groups" && height >= 180) || undefined}
                  style={{ top, height: Math.max(0, height), width: INTRO_W }}
                >
                  <div className="preview-art" key={preview ?? "idle"} data-project={preview ?? "idle"}>
                    <Diagram />
                  </div>
                </div>
              );
            })()}

            <ul className="project-register" role="group" aria-label="Projects" inert={Boolean(selectedProject)}>
              {projectOrder.map((key) => {
                const card = projects[key];
                const pose = poses[key];
                const first = groupOf(key).keys[0] === key;
                const style = narrow
                  ? undefined
                  : ({
                      transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.r}deg)`,
                      zIndex: stacking.indexOf(key) + 1,
                      transitionDelay: settling ? `${projectOrder.indexOf(key) * 55}ms` : undefined,
                    } as CSSProperties);
                return (
                  <li key={key} className="project-slot">
                    {narrow && first && <h2 className="flow-group">{groupOf(key).title}</h2>}
                    {/* The card's cut corner would clip its own shadow and focus ring, so both live on this layer beneath it. */}
                    {!narrow && (
                      <span
                        className="card-shadow"
                        aria-hidden="true"
                        data-moving={moving === key || undefined}
                        data-settling={settling || undefined}
                        data-lifted={selectedProject === key || undefined}
                        style={style}
                      />
                    )}
                    <button
                      type="button"
                      className="project-selector"
                      data-project={key}
                      data-lifted={(selectedProject === key && !narrow) || undefined}
                      aria-pressed={selectedProject === key}
                      aria-controls="project-evidence"
                      data-moving={moving === key || undefined}
                      data-settling={settling || undefined}
                      style={{ ...style, ...wearStyle(key) }}
                      ref={(node) => {
                        cardRefs.current[key] = node;
                      }}
                      onPointerDown={(event) => onPointerDown(event, key)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerCancel}
                      onClick={() => pickUp(key)}
                      onKeyDown={(event) => onCardKey(event, key)}
                      onFocus={() => {
                        focusCard(key);
                        showPreview(key);
                      }}
                      onBlur={() => showPreview(null)}
                      onPointerEnter={() => showPreview(key)}
                      onPointerLeave={() => showPreview(null)}
                    >
                      <span className="card-name">{card.name}</span>
                      <span className="card-tagline">{card.tagline}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {project && selectedProject && (
              <>
                <div className="desk-scrim" data-dropping={dropping || undefined} onClick={putDown} aria-hidden="true" />
                <section
                  className="evidence-stage"
                  id="project-evidence"
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="held-title"
                  data-dropping={dropping || undefined}
                  style={
                    lift
                      ? ({ "--lift-x": `${lift.x}px`, "--lift-y": `${lift.y}px`, "--lift-s": lift.s, "--lift-r": `${lift.r}deg` } as CSSProperties)
                      : undefined
                  }
                >
                  <header className="stage-head">
                    <h2 className="stage-title" id="held-title" tabIndex={-1} ref={heldHeading}>
                      {project.name}
                    </h2>
                    <button type="button" className="stage-close" onClick={putDown} aria-label="Put the card down">
                      <X size={20} strokeWidth={2.5} aria-hidden="true" />
                      <span>Put down</span>
                    </button>
                  </header>
                  <p className="stage-description">{project.description}</p>
                  <div className="stage-body">
                    <EvidencePanel project={selectedProject} />
                  </div>
                  <footer className="stage-foot">
                    <a className="estate-primary-action stage-link" href={project.href} aria-label={project.ariaLabel}>{project.action}</a>
                    <span className="stage-host">{new URL(project.href).host}</span>
                  </footer>
                </section>
              </>
            )}
          </section>
        </EstateShell>
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {project ? `${project.name} picked up.` : ""}
        </p>
      </main>

      <footer className="site-footer" inert={Boolean(selectedProject)}>
        <EstateShell variant="landing" className="footer-inner">
          <p>Maintained by Sangeev</p>
          <a className="footer-source" href="https://github.com/Snowslash/sangeev-me">Source on GitHub</a>
        </EstateShell>
      </footer>
    </>
  );
}

export default App;
