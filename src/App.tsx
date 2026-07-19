import { useState } from "react";
import {
  EstatePageTitle,
  EstateSectionTitle,
  EstateShell,
  PublicEstateHeader,
  useEstateTheme,
} from "@sangeev/estate-ui";

type ProjectKey = "opnotes" | "scratchpad" | "aligned" | "chess";

type ProjectRecord = {
  name: string;
  description: string;
  href: string;
  action: string;
  ariaLabel: string;
};

const projects: Record<ProjectKey, ProjectRecord> = {
  opnotes: {
    name: "Operation Note Generator",
    description: "Structured drafts for common emergency general-surgery operation notes.",
    href: "https://opnotes.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open Operation Note Generator",
  },
  scratchpad: {
    name: "Clinical Shift Scratchpad",
    description: "A temporary ward-job list for busy clinical shifts.",
    href: "https://scratchpad.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open Clinical Shift Scratchpad",
  },
  aligned: {
    name: "AlignEd",
    description: "Local-first teaching evidence and portfolio exports.",
    href: "https://aligned.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open AlignEd",
  },
  chess: {
    name: "Chess Coach",
    description: "Local-first chess analysis with Stockfish and optional Maia context.",
    href: "https://github.com/Snowslash/chess-coach",
    action: "View source ↗",
    ariaLabel: "View Chess Coach source",
  },
};

const projectOrder: ProjectKey[] = ["opnotes", "scratchpad", "aligned", "chess"];

function EvidencePanel({ project }: { project: ProjectKey }) {
  switch (project) {
    case "opnotes":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Structured facts</span>
            <div className="op-facts">
              <div className="op-fact"><small>Finding</small><strong>Purulent fluid</strong></div>
              <div className="op-fact"><small>Packing</small><strong>Ribbon gauze packing</strong></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Reviewable excerpt</span>
            <pre className="note-excerpt"><strong>Findings:</strong> Purulent fluid encountered.{"\n"}<strong>Operation:</strong> Cavity packed with ribbon gauze.</pre>
          </div>
        </div>
      );

    case "scratchpad":
      return (
        <div className="hinge scratch-hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Captured job</span>
            <div className="capture-ticket">
              <div className="capture-task">Chase CT</div>
              <div className="capture-meta"><span>urgent</span><span>C7 / Bed 4</span></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Temporary active list</span>
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
            <span className="hinge-label">Session signal</span>
            <div className="confidence-facts">
              <div className="confidence-change"><span>Confidence</span><strong>2.5 → 4.0</strong></div>
              <p className="feedback-theme">Theme: <q>More time with suturing</q></p>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Next-session action</span>
            <p className="session-action"><strong>Allow a longer practical station</strong> and repeat the confidence measure.</p>
          </div>
        </div>
      );

    case "chess":
      return (
        <div className="hinge chess-hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Played move</span>
            <div className="played-move">3...Nf6??</div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Coaching note</span>
            <p className="chess-verdict">Missed the mate threat on f7. <strong>Best: 3...g6.</strong></p>
          </div>
        </div>
      );
  }
}

function App() {
  const { theme, toggleTheme } = useEstateTheme();
  const [selectedProject, setSelectedProject] = useState<ProjectKey>("opnotes");
  const project = projects[selectedProject];

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
            <EstateSectionTitle id="projects-title">Projects</EstateSectionTitle>
            <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
              {project.name} specimen shown.
            </p>

            <div className="project-window">
              <div className="project-register" role="group" aria-label="Choose a project">
                {projectOrder.map((key) => (
                  <button
                    className="project-selector"
                    type="button"
                    data-project={key}
                    aria-pressed={selectedProject === key}
                    aria-controls="project-evidence"
                    onClick={() => setSelectedProject(key)}
                    key={key}
                  >
                    <span>{projects[key].name}</span>
                  </button>
                ))}
              </div>

              <article className="evidence-stage" id="project-evidence" aria-label={`${project.name} evidence`}>
                <div className="stage-bar">
                  <p className="stage-description">{project.description}</p>
                  <a className="estate-primary-action stage-link" href={project.href} aria-label={project.ariaLabel}>{project.action}</a>
                </div>
                <div className="stage-body">
                  <EvidencePanel project={selectedProject} />
                </div>
              </article>
            </div>
          </section>
        </main>
      </EstateShell>

      <footer className="site-footer">
        <EstateShell variant="landing" className="footer-inner">
          <p>Maintained by Sangeev</p>
        </EstateShell>
      </footer>
    </>
  );
}

export default App;
