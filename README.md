# sangeev.me

Static React project hub for Sangeev’s small clinical tools and coding projects.

Live site: https://sangeev.me
Source: https://github.com/Snowslash/sangeev-me

The site is intentionally plain: a short personal index, links to separate project deployments and a visible boundary around clinical tools. It should not become a portfolio funnel, analytics surface or backend application.

## Hosted projects linked from the hub

- https://opnotes.sangeev.me — browser-only operation note drafting
- https://scratchpad.sangeev.me — local-first clinical shift scratchpad project page

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

- `src/App.tsx` — homepage content and components
- `src/styles.css` — Tailwind entrypoint and public-estate styling
- `src/lib/theme.ts` — shared local/cookie theme persistence
- `src/styles/theme-toggle.css` — canonical public-estate theme control styling; the token audit checks byte-identical copies and shared persistence markers in Scratchpad, Op Notes v2 and AlignEd
- `public/sangeev-public-tokens.css` — canonical public-estate tokens copied into the build
- `public/_headers` — Cloudflare Pages security headers copied into the build
- `docs/` — generated production output
- `scripts/audit-public-tokens.py` — cross-repo token consistency check when sibling repos are present

## Deployment

Recommended deployment: Cloudflare Pages with the checked-in production build.

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `docs`
- Production branch: `main`
- Custom domains: `sangeev.me` and `www.sangeev.me`
- Canonical redirect: `www.sangeev.me` → `sangeev.me`

## Design boundary

The public estate uses a restrained project-note style: warm paper background, Charter-style serif headings, system-sans body text, thin rules, ordinary links and minimal decoration. Avoid SaaS-style gradients, glass cards, fake dashboards, social proof and tracking scripts.

Clinical-adjacent pages should keep active safety/privacy wording near the primary action. Do not add patient-data storage, analytics or third-party scripts without redesigning the safety model.
