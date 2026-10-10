import { useState } from "react";
import {
  EstatePageTitle,
  EstateSectionTitle,
  EstateShell,
  PublicEstateHeader,
  useEstateTheme,
} from "@sangeev/estate-ui";

type ProjectKey = "opnotes" | "scratchpad" | "aligned" | "casebook" | "parallax";

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
    ariaLabel: "Open project: Operation Note Generator",
  },
  scratchpad: {
    name: "Clinical Shift Scratchpad",
    description: "A temporary ward-job list for busy clinical shifts.",
    href: "https://scratchpad.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open project: Clinical Shift Scratchpad",
  },
  aligned: {
    name: "AlignEd",
    description: "Local-first teaching evidence and portfolio exports.",
    href: "https://aligned.sangeev.me",
    action: "Open project ↗",
    ariaLabel: "Open project: AlignEd",
  },
  casebook: {
    name: "Casebook",
    description: "Explore an operative logbook with filters and source-row traceability.",
    href: "https://casebook.sangeev.me/",
    action: "Open project ↗",
    ariaLabel: "Open project: Casebook",
  },
  parallax: {
    name: "Parallax",
    description: "A browser lab for understanding X-ray views and 3D geometry.",
    href: "https://parallax.sangeev.me/",
    action: "Open project ↗",
    ariaLabel: "Open project: Parallax",
  },
};

const projectOrder: ProjectKey[] = ["opnotes", "scratchpad", "aligned", "casebook", "parallax"];

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

    case "casebook":
      return (
        <div className="hinge">
          <div className="hinge-cause">
            <span className="hinge-label">Static example · Filters</span>
            <div className="op-facts">
              <div className="op-fact"><small>Role</small><strong>Performed</strong></div>
              <div className="op-fact"><small>Month</small><strong>February 2026</strong></div>
            </div>
          </div>
          <div className="hinge-arrow" aria-hidden="true">→</div>
          <div className="hinge-effect">
            <span className="hinge-label">Matching rows</span>
            <div className="op-facts">
              <div className="op-fact"><small>Source rows 5 and 6</small><strong>Synthetic procedure A</strong></div>
              <p>Duplicate retained</p>
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
  }
}

function App() {
  const { theme, toggleTheme } = useEstateTheme();
  const [selectedProject, setSelectedProject] = useState<ProjectKey>("opnotes");
  const project = projects[selectedProject];

  return (
    <>
      <PublicEstateHeader current="home" navigation="projects" theme={theme} onToggleTheme={toggleTheme} />
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
            <nav className="project-links" aria-label="Project pages">
              {projectOrder.map((key) => (
                <a key={key} href={projects[key].href}>{projects[key].name}</a>
              ))}
            </nav>
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
