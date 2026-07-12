import { ArrowUpRight, Github } from "lucide-react";
import { PublicEstateHeader } from "./components/PublicEstateHeader";
import { useTheme } from "./lib/theme";

type Tool = {
  name: string;
  description: string;
  detail: string;
  href: string;
  action: string;
};

const tools: Tool[] = [
  {
    name: "Operation note generator",
    description: "Structured drafts for common emergency general-surgery operation notes.",
    detail: "Runs in the browser. No account, analytics or server-side patient data storage.",
    href: "https://opnotes.sangeev.me",
    action: "Open tool",
  },
  {
    name: "Clinical Shift Scratchpad",
    description: "A temporary ward-job list for the busy middle of a clinical shift.",
    detail: "Local working memory, not a medical record or source of truth for patient care.",
    href: "https://scratchpad.sangeev.me",
    action: "View project",
  },
  {
    name: "AlignEd",
    description: "A local-first teaching evidence tracker for planning sessions, collecting feedback and preparing portfolio exports.",
    detail: "Stores sessions in the browser. No accounts or cloud sync.",
    href: "https://aligned.sangeev.me",
    action: "Open tool",
  },
];

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <PublicEstateHeader current="home" theme={theme} onToggleTheme={toggleTheme} />
      <div className="site-shell">
        <main>
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <h1 id="page-title">Building small, practical tools.</h1>
            <p className="lede">
              I make browser and local-first software for recurring problems in surgical training, ward work and the projects around them.
            </p>
            <div className="hero-links" aria-label="Profile links">
              <a href="#tools">See the tools <span aria-hidden="true">↓</span></a>
              <a href="https://github.com/Snowslash"><Github size={16} aria-hidden="true" /> GitHub</a>
            </div>
          </div>

          <aside className="boundary" aria-label="Clinical project boundary">
            <p>These are personal projects, not hospital systems or approved clinical products.</p>
            <p><strong>Do not enter patient-identifiable information into public pages or repositories.</strong></p>
          </aside>
        </section>

        <section className="tools-section" id="tools" aria-labelledby="tools-title">
          <div className="section-heading">
            <h2 id="tools-title">Public tools</h2>
          </div>

          <div className="tool-list">
            {tools.map((tool) => (
              <article className="tool-card" key={tool.name}>
                <div className="tool-copy">
                  <h3>{tool.name}</h3>
                  <p className="tool-description">{tool.description}</p>
                  <p className="tool-detail">{tool.detail}</p>
                </div>
                <a className="tool-link" href={tool.href}>
                  {tool.action}<ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="workbench" aria-labelledby="workbench-title">
          <div className="workbench-heading">
            <h2 id="workbench-title">Workbench</h2>
          </div>
          <article className="workbench-item">
            <div>
              <h3>Chess Coach</h3>
              <p>Local-first chess analysis using Stockfish with optional Maia context. PGNs and generated reports stay on the user's machine.</p>
            </div>
            <a href="https://github.com/Snowslash/chess-coach">View source <ArrowUpRight size={17} aria-hidden="true" /></a>
          </article>
        </section>
      </main>

      <footer>
        <p>Sangeev · Surgery, software and small useful things.</p>
        <p>No analytics. No tracking.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
