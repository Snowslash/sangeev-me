import type { ReactNode } from "react";

// Wordless diagrams of what each project does, shown in the preview window while a card is hovered or focused.
// They are decorative: every card already says what its project is in words. Strokes take the desk's text colour;
// `.pv-muted` lines recede and `.pv-fill` areas are a faint wash.
//
// Every diagram loops (see styles.css). Most run on one 5s cycle in four beats: `pv-a` parts appear first,
// then `pv-b`, `pv-c` and `pv-d`, everything holds, and the whole picture clears before the next cycle.
// `pv-o1` to `pv-o6` stagger parts within a beat. Parallax swings back and forth instead.

type Diagram = () => ReactNode;

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 360 240" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/** Operation Note Generator: a few fields are filled in, become a plain-text note, and the note is checked. */
const OpNotes: Diagram = () =>
  svg(
    <>
      {[44, 92, 140].map((y, i) => (
        <g key={y} className={`pv-a pv-o${i + 1}`}>
          <rect className="pv-muted" x="24" y={y} width="112" height="30" rx="2" />
          <path className={`pv-type pv-o${i + 2}`} pathLength={1} d={`M36 ${y + 15}h${[56, 72, 40][i]}`} />
        </g>
      ))}
      <path className="pv-b pv-muted" d="M152 104h40m-10-10 10 10-10 10" />
      <g className="pv-b pv-o2">
        <path d="M212 36h88l24 24v144H212z" />
        <path className="pv-muted" d="M300 36v24h24" />
      </g>
      {[76, 96, 116, 136, 156].map((y, i) => (
        <path key={y} className={`pv-c pv-o${i + 1}`} d={`M228 ${y}h${[72, 56, 80, 64, 44][i]}`} />
      ))}
      <path className="pv-d pv-pop pv-strong" d="M236 184l10 10 22-22" />
    </>,
  );

/** Clinical Shift Scratchpad: jobs are jotted onto a phone list; one is ticked off and slides away while the clock turns. */
const Scratchpad: Diagram = () =>
  svg(
    <>
      <rect className="pv-muted" x="120" y="16" width="120" height="208" rx="14" />
      <path className="pv-muted" d="M164 30h32" />
      {[58, 98, 138, 178].map((y, i) => (
        <g key={y} className={i === 0 ? "pv-done" : `pv-a pv-o${i + 1}`}>
          <rect className="pv-fill" x="134" y={y} width="92" height="30" rx="3" />
          <circle cx="148" cy={y + 15} r="5" />
          {i === 0 && <circle className="pv-tick" cx="148" cy={y + 15} r="5" />}
          <path d={`M162 ${y + 15}h${[48, 36, 52, 30][i]}`} />
        </g>
      ))}
      <g className="pv-a pv-o5">
        <circle cx="290" cy="64" r="22" />
        <path className="pv-hand" d="M290 64V50" />
        <path className="pv-muted" d="M290 64l9 6" />
      </g>
    </>,
  );

/** AlignEd: a plan, feedback and a reflection are dropped into one record, which then goes out as a portfolio export. */
const AlignEd: Diagram = () =>
  svg(
    <>
      <g className="pv-gather pv-o1 pv-to-1">
        <rect x="24" y="28" width="56" height="48" rx="2" />
        <path className="pv-muted" d="M24 42h56M38 22v12m28-12v12" />
      </g>
      <g className="pv-gather pv-o2 pv-to-2">
        <path d="M24 100h60v36H50l-14 12v-12H24z" />
      </g>
      <g className="pv-gather pv-o3 pv-to-3">
        <rect x="24" y="168" width="56" height="48" rx="2" />
        <path className="pv-muted" d="M34 184h36M34 196h28M34 208h32" />
      </g>
      <g className="pv-a pv-o1">
        <path d="M168 84h28l8 10h44v66h-80z" />
        <rect className="pv-fill pv-swell" x="168" y="94" width="80" height="66" />
      </g>
      <path className="pv-c pv-muted" d="M262 122h28m-10-10 10 10-10 10" />
      <g className="pv-c pv-o2 pv-strong">
        <path d="M302 92h34v60h-34z" />
        <path d="M310 108h18M310 120h18M310 132h12" />
      </g>
    </>,
  );

/** Casebook: logbook rows become a bar chart; one bar is picked, and a line runs back to the exact rows it counts. */
const Casebook: Diagram = () =>
  svg(
    <>
      <g className="pv-a pv-muted">
        <rect x="20" y="28" width="132" height="184" rx="2" />
        {[52, 76, 100, 124, 148, 172, 196].map((y) => (
          <path key={y} d={`M20 ${y}h132`} />
        ))}
        <path d="M60 28v184" />
      </g>
      <path className="pv-a pv-muted" d="M196 212h144M196 212V36" />
      {[
        [212, 120],
        [244, 64],
        [276, 150],
        [308, 96],
      ].map(([x, h], i) => (
        <rect key={x} className={`pv-bar pv-o${i + 2}${i === 1 ? " pv-picked" : ""}`} x={x} y={212 - h} width="22" height={h} />
      ))}
      <path className="pv-link pv-strong" pathLength={1} d="M244 148C200 148 196 88 152 88M244 160c-44 0-48 0-92 0" />
      <rect className="pv-row pv-c" x="22" y="78" width="128" height="20" />
      <rect className="pv-row pv-c pv-o2" x="22" y="150" width="128" height="20" />
    </>,
  );

/** Parallax: the beam and the plate turn together around a wire in bone, as in the lab. The wire's shadow stays
 * centred on the plate and grows or shrinks with the wire's angle to the beam (longest when the wire lies flat to it). */
const Parallax: Diagram = () =>
  svg(
    <>
      <ellipse className="pv-fill" cx="180" cy="128" rx="44" ry="26" />
      <ellipse className="pv-muted" cx="180" cy="128" rx="44" ry="26" />
      <path className="pv-strong" d="M162 115l36 26" />
      <g className="pv-carm">
        <circle cx="180" cy="28" r="10" />
        <path className="pv-muted" d="M174 36 116 192M186 36l58 156" />
        <rect className="pv-muted" x="96" y="192" width="168" height="16" rx="2" />
        <path className="pv-shadow pv-strong" d="M151 200h58" />
      </g>
    </>,
  );

/** Glassbox: make a prediction, then a playhead draws the recording as it falls away from a steady baseline. */
const Glassbox: Diagram = () =>
  svg(
    <>
      <path className="pv-muted" d="M40 28v176h296" />
      <path className="pv-muted pv-dash" d="M40 92h296" />
      <path className="pv-a pv-strong" d="M24 60v40m-8-10 8 10 8-10" />
      <path className="pv-trace" pathLength={1} d="M40 92h60c30 0 40 64 80 72s70 4 156 6" />
      <path className="pv-playhead" d="M40 28v176" />
    </>,
  );

/** Shown before any card is hovered: a card with a pointer over it, inviting a hover. */
const Idle: Diagram = () =>
  svg(
    <>
      <path className="pv-muted" d="M110 70h120l20 20v80H110z" />
      <path className="pv-muted" d="M230 70v20h20" />
      <path className="pv-muted" d="M128 96h60M128 112h40" />
      <path className="pv-pointer" d="M206 134v44l11-11 9 19 8-4-9-19h16z" />
    </>,
  );

export const previews = { opnotes: OpNotes, scratchpad: Scratchpad, aligned: AlignEd, casebook: Casebook, parallax: Parallax, glassbox: Glassbox };
export const IdlePreview = Idle;
