import { useState } from "react";
import {
  EstatePageTitle,
  EstateSectionTitle,
  EstateShell,
  PublicEstateHeader,
  useEstateTheme,
} from "@sangeev/estate-ui";

import alignedEvidence from "./assets/evidence/aligned-live.webp";
import opnotesEvidence from "./assets/evidence/opnotes-live.webp";
import scratchpadEvidence from "./assets/evidence/scratchpad-active-list.webp";

type ProjectView = "tools" | "workbench";

type Evidence = {
  src: string;
  alt: string;
  width: number;
  height: number;
  portrait?: boolean;
};

type ProjectRecord = {
  name: string;
  description: string;
  href: string;
  action: string;
  ariaLabel: string;
  evidence: Evidence | null;
};

type LedgerItem = {
  heading: string;
  text: string;
};

type ProjectRegisterView = {
  status: string;
  records: ProjectRecord[];
  ledger: LedgerItem[];
};

const projectViews: Record<ProjectView, ProjectRegisterView> = {
  tools: {
    status: "Tools view selected. Three projects are visible.",
    records: [
      {
        name: "Operation note generator",
        description: "Structured drafts for common emergency general-surgery operation notes.",
        href: "https://opnotes.sangeev.me",
        action: "Open tool",
        ariaLabel: "Open Operation note generator",
        evidence: {
          src: opnotesEvidence,
          width: 960,
          height: 377,
          alt: "Current Operation Note Generator interface with no entered patient data.",
        },
      },
      {
        name: "Clinical Shift Scratchpad",
        description: "A temporary ward-job list for busy clinical shifts.",
        href: "https://scratchpad.sangeev.me",
        action: "View project",
        ariaLabel: "View Clinical Shift Scratchpad",
        evidence: {
          src: scratchpadEvidence,
          width: 560,
          height: 1139,
          alt: "Synthetic Clinical Shift Scratchpad demo with fictional job details.",
          portrait: true,
        },
      },
      {
        name: "AlignEd",
        description: "Local-first teaching evidence and portfolio exports.",
        href: "https://aligned.sangeev.me",
        action: "Open tool",
        ariaLabel: "Open AlignEd",
        evidence: {
          src: alignedEvidence,
          width: 960,
          height: 342,
          alt: "Current AlignEd teaching workflow with no learner records entered.",
        },
      },
    ],
    ledger: [
      { heading: "Boundary", text: "Do not enter patient-identifiable information." },
      { heading: "Storage", text: "Each tool states its local boundary." },
      { heading: "Tracking", text: "No analytics. No tracking." },
    ],
  },
  workbench: {
    status: "Workbench view selected. One project is visible.",
    records: [
      {
        name: "Chess Coach",
        description: "Local-first chess analysis with Stockfish and optional Maia context.",
        href: "https://github.com/Snowslash/chess-coach",
        action: "View source",
        ariaLabel: "View Chess Coach source",
        evidence: null,
      },
    ],
    ledger: [
      { heading: "Source", text: "Repository only." },
      { heading: "Files", text: "PGNs and reports stay local." },
      { heading: "Tracking", text: "No analytics. No tracking." },
    ],
  },
};

function App() {
  const { theme, toggleTheme } = useEstateTheme();
  const [selectedView, setSelectedView] = useState<ProjectView>("tools");
  const currentView = projectViews[selectedView];

  return (
    <>
      <PublicEstateHeader current="home" theme={theme} onToggleTheme={toggleTheme} />
      <EstateShell variant="landing">
        <main className="root-page" id="main-content">
          <section className="intro" aria-labelledby="page-title">
            <EstatePageTitle id="page-title" variant="landing">Building small, practical tools.</EstatePageTitle>
            <p className="lede">I build browser and local-first tools for surgical training, ward work and the projects around them.</p>
          </section>

          <section className="projects-register" id="projects" aria-labelledby="projects-title">
            <div className="register-heading">
              <EstateSectionTitle id="projects-title">Projects</EstateSectionTitle>
              <div className="state-tabs" aria-label="Choose a project view">
                {(["tools", "workbench"] as const).map((view) => (
                  <button
                    type="button"
                    data-view={view}
                    aria-pressed={selectedView === view}
                    aria-controls="estate-window"
                    onClick={() => setSelectedView(view)}
                    key={view}
                  >
                    {view === "tools" ? "Tools" : "Workbench"}
                  </button>
                ))}
              </div>
            </div>

            <p className="visually-hidden" id="register-status" role="status" aria-live="polite" aria-atomic="true">
              {currentView.status}
            </p>

            <div
              className="estate-window"
              id="estate-window"
              data-view={selectedView}
              role="group"
              aria-labelledby="projects-title"
            >
              <dl className="record-rows">
                {currentView.records.map((record) => (
                  <div className={`record-row${record.evidence ? "" : " record-row--plain"}`} key={record.name}>
                    <dt className="project-name">{record.name}</dt>
                    <dd>
                      <div className="row-copy">
                        <p className="row-description">{record.description}</p>
                        <a className="record-action" href={record.href} aria-label={record.ariaLabel}>{record.action}</a>
                      </div>
                      {record.evidence ? (
                        <figure className={`project-evidence${record.evidence.portrait ? " project-evidence--portrait" : ""}`}>
                          <img
                            src={record.evidence.src}
                            width={record.evidence.width}
                            height={record.evidence.height}
                            alt={record.evidence.alt}
                            loading={record.name === "Operation note generator" ? "eager" : "lazy"}
                          />
                        </figure>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="record-ledger">
                {currentView.ledger.map((item) => (
                  <div className="ledger-cell" key={item.heading}>
                    <h3 className="structural-heading">{item.heading}</h3>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </EstateShell>

      <footer className="site-footer">
        <EstateShell variant="landing" className="footer-inner">
          <p>Sangeev · Surgery, software and small useful things.</p>
          <p>No analytics. No tracking.</p>
        </EstateShell>
      </footer>
    </>
  );
}

export default App;
