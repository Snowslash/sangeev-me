# sangeev.me

Static React project hub for Sangeev’s small clinical tools and coding projects.

Live site: https://sangeev.me
Source: https://github.com/Snowslash/sangeev-me

The homepage uses **Card Desk**. Six project cards—Operation Note Generator, Clinical Shift Scratchpad, AlignEd, Casebook, Parallax and Glassbox—open the existing static evidence and one canonical Open project action. The desktop desk starts grouped, with optional Scatter/Stack arrangements and pointer/keyboard movement. Phones use a normal-flow grouped list and a scrollable detail sheet. Ordinary links to all six projects remain in the initial HTML fallback for visitors without JavaScript. The shared header's `navigation="projects"` option keeps only Projects and GitHub in the navigation; the wordmark and theme toggle remain. No analytics, embedded clinical applications or backend are introduced.

## Hosted projects linked from the hub

- https://opnotes.sangeev.me — browser-only operation note drafting
- https://scratchpad.sangeev.me — local-first clinical shift scratchpad project page
- https://aligned.sangeev.me — local-first teaching evidence and portfolio exports
- https://casebook.sangeev.me/ — operative logbook explorer project page
- https://parallax.sangeev.me/ — X-ray projection geometry lab
- https://glassbox.sangeev.me/ — recorded physiology experiments

Important clinical workflow tools are kept in separate repositories/deployments so a homepage change cannot break a runnable tool.

## Local preview

```bash
git clone https://github.com/Snowslash/sangeev-me.git
cd sangeev-me
npm ci
npm run dev
```

Then open the local URL printed by Vite, normally:

```text
http://127.0.0.1:5173/
```

Production build and checks:

```bash
npm run check
```

### Card Desk artifact preview

After building, serve the actual `docs/` artifact with its unchanged security policy:

```bash
node scripts/preview.mjs
```

Open **http://127.0.0.1:4192/**. The server binds to loopback, sends `noindex`, applies the built `_headers`, denies non-read requests and returns the built 404 page for missing routes. Set `PORT` to choose another local port. This is a lightweight HTTP preview, **not** a Cloudflare runtime emulator. Vite remains useful for development, but is not the strict-CSP release check.

Local cards and their `#project` deep links stay in this preview. **Open project** goes to the real, separately deployed project. The shared header's wordmark and Projects link retain their canonical `https://sangeev.me` destinations; after leaving the preview, use browser Back to return here. No sibling site, shared package or live navigation has been rewritten to pretend the preview is deployed.

Try grouped/Scatter/Stack layouts, dragging and arrow-key nudges, Enter to open, Tab/Shift-Tab within the detail, and Escape/Put down to return. Reduced-motion preferences disable the motion. There are no clinical inputs or live simulations in these homepage specimens.

The optional browser regression runner uses an **already-installed** Playwright package rather than adding a site dependency:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROMIUM_PATH=/absolute/path/to/chromium \
node scripts/card-desk-browser.mjs
```

Evidence is written to ignored `.cache/card-desk-review/` (override with `CARD_DESK_EVIDENCE`). It checks the emitted artifact across desktop, tablet, phone and short viewports, both themes, all six modal journeys, keyboard and pointer interaction, hash navigation, reduced motion, CSP and no-JavaScript links. Run one browser/build job at a time within the host's existing resource limits. Production publication requires an explicitly authorised push to `main` and independent verification of the resulting Worker deployment.

Local verification (2026-10-15): the initial integration had a clean `npm ci` and full audit with zero findings. After restoring the ZIP copy, `npm run check` passed **36 tests**, TypeScript and the production build; the emitted-HTML copy and Glassbox contracts also passed (8 tests). Chromium reran **72 project-dialog journeys** across six viewports (320×568, 390×844, 768×1024, 1024×420, 1280×720 and 1440×1000), each in both themes, now checking the rendered introduction, descriptions, taglines, evidence labels and source footer against the ZIP fixture. Keyboard trapping/return, rapid hash changes, arrangement, dragging, query preservation, persisted theme and reduced motion passed. Desktop and 320px no-JavaScript views retain all six links and descriptions without horizontal overflow. No uncaught JavaScript errors, CSP violations or external resource requests occurred in that suite. Fresh copy-restoration evidence is in ignored `.cache/card-desk-copy-restored/`. This is local Chromium evidence, not a full accessibility audit or Safari/device certification.

The package manifest/lockfile, shared archive, theme entrypoint, security policy and Worker config remain byte-identical to the base checkout. TypeScript-AST comparison confirmed the complete evidence-rendering function is unchanged apart from the approved heading text: specimen values, source-row provenance and markup are preserved. The loopback server's HTML and referenced JS/CSS were compared byte-for-byte with the rebuilt artifact, with the existing CSP and `noindex` response verified. The pre-Card-Desk source baseline is `e3ab0f36deab797a14ecad772950c6da90d5fd73`. Card Desk was reviewed locally before publication was authorised; deployment identity and live acceptance must be checked independently of these local results.

### Arrangement motion verification

The resize effect now preserves an active arrangement transition when changing modes also changes the desk height. Full motion cancellation remains in the unmount, reduced-motion and interaction paths. The settling window allows the full 860ms movement plus the final card's stagger, rather than truncating it at 900ms. The supplied easing, stagger, layouts and CSS are unchanged.

Run `node scripts/card-desk-motion.mjs` with the same Playwright/Chromium environment shown above. It records intermediate computed transforms and natural transition completion for all six cards under Stack, Sort by group and Scatter at 800, 1024 and 1440px. It also exercises rapid keyboard replacement and reduced motion at load and during movement. Fresh verification passed all **54 card transitions**, the **36-test** native check/build and the existing **72 dialog journeys**. Evidence: `.cache/card-desk-motion-green/` and `.cache/card-desk-motion-regression/`; failed before-fix and immutable-ZIP comparison captures are retained separately.

A separate inherited layout limitation remains: on a narrow desktop desk, random Scatter positions can overlap the arrangement controls after the desk shrinks. The motion suite does not conceal this by force-clicking through cards; its reduced-motion check starts from a fresh grouped page, and rapid replacement uses real keyboard activation. This motion fix does not redesign the scatter layout.

### Touch input verification

Release review caught a desk-wide `touch-action: none` rule that blocked native scrolling above the narrow-layout breakpoint. Gesture capture is now confined to draggable cards; the surrounding desk and introduction retain native scrolling and zoom. The regression first reproduced a non-scrolling swipe, then passed at 768, 1024 and 844px widths with touch emulation. Touch dragging and tapping a card still work. The native check now has **37 tests**. This is Chromium touch-input evidence, not a physical-device Safari claim.

Run `node scripts/card-desk-touch.mjs` with the same Playwright/Chromium environment shown above. Results go to `.cache/card-desk-touch/`, or `CARD_DESK_EVIDENCE` when set. The modal browser checks also verify the header's actual inert ancestor and restored focusability, rather than checking an attribute on the wrong element.

### Supplied wording and publication checks

The homepage retains the supplied `sangeev.me-homepage-claude.zip` wording: introduction, six project descriptions and taglines, plain-English evidence headings, source footer link and complete no-JavaScript descriptions. `tests/fixtures/card-desk-copy.json` records literal copy and the original archive digest; the contract verifies fidelity, **not** the truth of every product claim. Real project destinations, specimen data and functional/security fixes remain intact.

Sangeev accepted keeping the supplied wording after these flags were raised. The copy remains unchanged; these technical qualifications are retained for provenance, not as outstanding copy-edit requests:

- **“tools that run in your browser”** overgeneralises Clinical Shift Scratchpad. Its current repository describes an Expo React Native app for iOS/Android; the browser serves its public landing page, not the clinical app (`../clinical-shift-scratchpad/README.md`, “Requirements” and “Run”).
- **“clears itself when you’re done”** implies clearing on finishing a shift. Scratchpad instead has a default 24-hour auto-expiry and separate manual clearing. `endShift()` only clears the shift-start setting (`../clinical-shift-scratchpad/src/types/job.ts`, `DEFAULT_AUTO_DELETE_HOURS`; `src/services/jobStore.ts`, `endShift`). This is not a guarantee of deletion at shift end or an independent privacy assurance.

These are observations of the sibling source at review time, not an independent deployment audit of those applications. No sibling project was changed.

## Project layout

The six project-page bodies share a checked source template in [`project-pages/`](project-pages/README.md). It is maintainer tooling, not part of the homepage bundle or the shared estate UI package. Changes are copied explicitly into the separately tested and deployed project repositories; updating this repository alone does not update those sites.

- `src/App.tsx` — six-project Card Desk and preserved evidence specimens, composed with package-owned estate primitives
- `src/styles.css` — page-specific paper desk and modal composition; shared identity and full-bleed chrome come from `@sangeev/estate-ui`
- `vendor/sangeev-estate-ui-2.0.0-alpha.7.tgz` — exact vendored `@sangeev/estate-ui` contract artifact
- `public/_headers` — Cloudflare static-asset security headers copied into the build
- `public/licenses/` — shared-package MIT notice plus bundled-font OFL notices, copied into the build
- `docs/` — generated production output
- `scripts/audit-public-tokens.py` — cross-repo token consistency check when sibling repos are present
- `scripts/preview.mjs` — local read-only artifact server with the existing security headers
- `scripts/card-desk-browser.mjs` — serial browser regression/evidence runner
- `scripts/card-desk-motion.mjs` — frame-level arrangement and motion-lifecycle regression
- `scripts/card-desk-touch.mjs` — native touch scrolling, card dragging and tapping regression

## Deployment

Cloudflare Worker auto-deploys the checked-in `docs/` artifact from `main`; `wrangler.jsonc` defines the static assets.

- Worker: `sangeev-me`
- Build command: `npm run build`
- Build output directory: `docs`
- Production branch: `main`
- Custom domains: `sangeev.me` and `www.sangeev.me`
- Canonical redirect: `www.sangeev.me` → `sangeev.me`

## Dependency security maintenance — 2026-10-13

The full npm audit initially reported three high-severity affected packages across five distinct advisories. A targeted `npm update nanoid postcss source-map-js --package-lock-only --ignore-scripts` changed only these transitive lockfile entries within their existing parent ranges:

| Package | Before | After | Advisory patch baseline |
| --- | --- | --- | --- |
| nanoid | 3.3.15 | 3.3.20 | 3.3.18 covers negative- and zero-size loops |
| postcss | 8.5.17 | 8.5.30 | 8.5.23 covers disclosure and its follow-up |
| source-map-js | 1.2.1 | 1.2.2 | 1.2.2 fixes indexed source-map offset DoS |

Primary advisory metadata was rechecked, including withdrawal status and related fixes: [NanoID negative size](https://github.com/advisories/GHSA-28wg-ghj8-5hjv), [NanoID zero size](https://github.com/advisories/GHSA-2v37-7h3g-55p8), [PostCSS traversal](https://github.com/advisories/GHSA-r28c-9q8g-f849), [PostCSS follow-up](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) and [source-map-js offsets](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). The PostCSS follow-up is moderate severity; npm reports the package at its highest advisory severity. The patch baselines are not claims about the latest releases.

Dependency paths are Vite → PostCSS → NanoID/source-map-js and @tailwindcss/vite → @tailwindcss/node → source-map-js. These are build/CI processing dependencies here, not visitor-facing services. PostCSS's inspected call uses fixed `nanoid(6)`, and the site accepts no visitor CSS or source maps. The production bundle's module inventory contains none of the three packages. Malicious build inputs are still a relevant boundary; the original audit did not demonstrate a live website exploit or compromise.

Verification: clean `npm ci`, full `npm audit --json` (**zero findings**), `npm run check` (27 tests, TypeScript and production build), emitted Glassbox contracts and targeted Chromium checks at 1280, 390 and 320px in both themes, including keyboard selection and no-JavaScript links. The generated `docs/` artifact remains byte-identical to the preceding release. The shared estate archive, six-project register, application source, security policies and Worker configuration are unchanged. No overrides, audit suppression or framework upgrade were needed.

The known favicon 404 and Cloudflare-injected, CSP-blocked JavaScript are separate diagnostics, not a reason to weaken CSP. Publication uses the existing automatic Worker integration; its commit check records the build and Worker version identities. Dependency audit results are point-in-time evidence, not a security certification.

## Design boundary

Parallax uses the same compact text-based before → after specimen as the other project panels. Its observations come from [guided challenge c1](https://github.com/Snowslash/parallax/tree/7b3e890640e37bd48596b1c6fc60e02e285508b0/demo/assets/v2): the same fixed wire tip projects within the cylinder outline at 0° and beyond the right outline at 60°. These are projected appearances, not claims about geometric containment or safety. The homepage embeds no Parallax images or interactive lab controls.

Glassbox also uses a static text specimen, not an embedded or live simulation. Its values are taken from the fictional Pulse blood-loss recording in [the pinned Glassbox lesson data](https://github.com/Snowslash/glassbox/blob/db2aaec7ff7725d9aaa187c5fc416d3d8930b2e4/evidence/engine/lesson-data.json): `runs.bleed.samples`, at elapsed 0 and approximately 550 s. Blood volume is rounded to whole mL (5,487 → 4,685); the engine-reported mean arterial pressure is rounded to one decimal place in mmHg (95.3 → 94.2). These are exported observations, not evidence of a causal mechanism, clinical cut-offs or patient measurements. The project action opens Glassbox's overview; its lessons and Model details retain the fuller explanation and limitations. No simulation assets, dependencies or clinical inputs are loaded by the homepage.

The shared public-estate language remains the pinned Drenched Atlas palette and Field Ledger typography: full-bleed dark estate chrome, Literata headings and Atkinson body/UI text. The approved Card Desk design permits page-local paper folds, texture, shadows, rotated cards and pick-up motion; these are not shared-header or token overrides, or a redesign of sibling applications. Static project evidence retains the limitations above. Avoid fake evidence, social proof and tracking scripts.

Clinical-adjacent pages should keep active safety/privacy wording near the primary action. Do not add patient-data storage, analytics or third-party scripts without redesigning the safety model.

## Licence

Original project code is licensed under the [MIT License](LICENSE), copyright © 2026 Sangeev Ravimohan.

Third-party dependencies and bundled assets retain their own licences. The shared estate UI and font notices remain in [`public/licenses/`](public/licenses/), alongside the project's MIT notice; all are copied into the static build's `licenses/` directory.
