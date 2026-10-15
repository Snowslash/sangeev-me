# Project-page body templates

`shared/ProjectPage.tsx` and `shared/project-page.css` are the source for the reviewed paper-card project pages. They preserve the supplied composition and voice. The template handles screenshot pick-up/put-down, exact animation-event filtering, interrupted motion, reduced motion and queued native-dialog close events. Consumer HTML also retains useful introductions, limitations and real links before JavaScript runs.

These are **page-body templates**, not new estate UI primitives. `@sangeev/estate-ui` still owns tokens, fonts, chrome, theme and controls; its exact vendored pins remain with each consumer. Project configuration, screenshots, applications and science/data stay in their own repositories. Nothing in this directory is imported by the homepage or copied to its published `docs/` artifact.

## Check and update consumers

Use Python 3.10+ (standard library only). Arrange six clean public clones/worktrees beneath one chosen parent, using their repository names:

- `clinical-shift-scratchpad/landing/src/`
- `op-note-gen/src/landing/`
- `AlignEd/src/landing/`
- `casebook/src/landing/`
- `glassbox/web/src/`
- `parallax/demo/` — stylesheet only; its browser-native dialog implementation stays separate.

From this repository, check without writing:

```sh
python3 -B project-pages/scripts/sync-project-templates.py --root /path/to/sibling-clones
```

To propagate an explicitly reviewed template edit, add `--write`. The utility preflights existing destination directories and rejects symlinked paths; it does not create checkouts, install packages, stage, commit or deploy. It replaces only five `ProjectPage.tsx` files and six `project-page.css` files. Review the resulting diffs and run **each consumer's native tests/build and emitted-artifact/browser checks** before publishing. It does not synchronise project copy, entrypoints or the static no-JavaScript fallback: those need their own parity checks.

Tooling unit checks:

```sh
python3 -B -m unittest discover -s project-pages/tests
npm test
```

`npm test` includes six mocked lifecycle regressions against the canonical React implementation. With all six consumers prepared, run the same harness against their actual implementations:

```sh
MOTION_ROOT=/path/to/sibling-clones node --test tests/project-page-motion.test.mjs
```

That full source suite has 35 cases. These are controlled DOM/time/React-scheduling tests, **not** real-browser focus or animation proof. Browser acceptance must also check natural 480ms figure lift completion rather than the 300ms backdrop event, natural put-down, rapid/native close and reopening, keyboard focus return, both themes, small/large viewports and no-JavaScript navigation. Use synthetic screenshots/data only and retain each application's security policy.

## Publication boundary

Each project keeps its existing Git-triggered Cloudflare target. A template commit here is not a deployment of its consumers. Publish and verify each project separately against its exact reviewed source/artifact, including nested app routes and assets. Do not replace a repository with an archive, update scientific pins to hide content changes, publish a private AlignEd development tree or roll unrelated shared-package changes into a landing-page release.
