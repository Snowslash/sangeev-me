export type ProjectKey = "opnotes" | "scratchpad" | "aligned" | "casebook" | "parallax" | "glassbox";

export type ProjectRecord = {
  name: string;
  description: string;
  href: string;
  action: string;
  ariaLabel: string;
  /** A few words for the card face; the full description shows when the card is picked up. */
  tagline: string;
};

export const projects: Record<ProjectKey, ProjectRecord> = {
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

export const projectOrder: ProjectKey[] = ["opnotes", "scratchpad", "aligned", "casebook", "parallax", "glassbox"];

// Groups follow projectOrder, so arrow-key order matches reading order.
export const projectGroups: { id: string; title: string; keys: ProjectKey[] }[] = [
  { id: "clinical-workflow", title: "Clinical workflow", keys: ["opnotes", "scratchpad"] },
  { id: "portfolio", title: "Portfolio", keys: ["aligned", "casebook"] },
  { id: "labs", title: "Physiology and imaging labs", keys: ["parallax", "glassbox"] },
];

export const groupIndex = (key: ProjectKey) => projectGroups.findIndex((group) => group.keys.includes(key));
export const groupOf = (key: ProjectKey) => projectGroups[groupIndex(key)];
