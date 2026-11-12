import type { ProjectKey } from "./projects";

// Static, source-grounded specimens. Keep their copy, values and markup separate
// from the desk's interaction lifecycle; provenance is documented in README.md.
export function EvidencePanel({ project }: { project: ProjectKey }) {
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
