# sangeev.me

Static React project hub for Sangeev’s small clinical tools and coding projects.

Live site: https://sangeev.me
Source: https://github.com/Snowslash/sangeev-me

The site is intentionally plain: a short personal index followed by one evidence-led Projects register. Five project choices—Operation Note Generator, Clinical Shift Scratchpad, AlignEd, Casebook and Parallax—share one bounded window with static examples. The shared header's `navigation="projects"` option keeps only Projects and GitHub in the navigation; the wordmark and theme toggle remain. It should not become a portfolio funnel, analytics surface or backend application.

## Hosted projects linked from the hub

- https://opnotes.sangeev.me — browser-only operation note drafting
- https://scratchpad.sangeev.me — local-first clinical shift scratchpad project page
- https://aligned.sangeev.me — local-first teaching evidence and portfolio exports
- https://casebook.sangeev.me/ — operative logbook explorer project page
- https://parallax.sangeev.me/ — X-ray projection geometry lab

Important clinical workflow tools are kept in separate repositories/deployments so a homepage change cannot break a runnable tool.

## Local preview

```bash
git clone https://github.com/Snowslash/sangeev-me.git
cd sangeev-me
npm install
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

## Project layout

- `src/App.tsx` — five-project evidence register composed with package-owned estate primitives
- `src/assets/parallax/` — unmodified 0° and 60° projections from [Parallax's first guided challenge](https://github.com/Snowslash/parallax/tree/7b3e890640e37bd48596b1c6fc60e02e285508b0/demo/assets/v2); Vite emits fingerprinted copies
- `src/styles.css` — page-specific Evidence Window composition; shared identity and full-bleed chrome come from `@sangeev/estate-ui`
- `vendor/sangeev-estate-ui-2.0.0-alpha.7.tgz` — exact vendored `@sangeev/estate-ui` contract artifact
- `public/_headers` — Cloudflare static-asset security headers copied into the build
- `public/licenses/` — shared-package and Parallax MIT notices plus bundled-font OFL notices, copied into the build
- `docs/` — generated production output
- `scripts/audit-public-tokens.py` — cross-repo token consistency check when sibling repos are present

## Deployment

Cloudflare Worker auto-deploys the checked-in `docs/` artifact from `main`; `wrangler.jsonc` defines the static assets.

- Worker: `sangeev-me`
- Build command: `npm run build`
- Build output directory: `docs`
- Production branch: `main`
- Custom domains: `sangeev.me` and `www.sangeev.me`
- Canonical redirect: `www.sangeev.me` → `sangeev.me`

## Design boundary

The candidate public-estate language uses Evidence Window structure, the Drenched Atlas palette and Field Ledger typography: full-bleed dark estate chrome, bounded pale working surfaces, Literata headings, Atkinson body/UI text, attached register tabs and square ruled construction. Avoid gradients, glass cards, generic dashboard grids, fake evidence, social proof and tracking scripts.

Clinical-adjacent pages should keep active safety/privacy wording near the primary action. Do not add patient-data storage, analytics or third-party scripts without redesigning the safety model.
