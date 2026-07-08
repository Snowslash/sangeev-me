# sangeev.me

Static public project hub for Sangeev’s small clinical tools and coding projects.

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
python3 -m http.server 8000 --directory docs
```

Then open:

```text
http://127.0.0.1:8000/
```

No build step is required.

## Project layout

- `docs/index.html` — homepage
- `docs/styles.css` — homepage styling
- `docs/sangeev-public-tokens.css` — shared visual tokens for the public estate
- `docs/theme.js` — local theme toggle
- `docs/_headers` — Cloudflare Pages security headers
- `scripts/audit-public-tokens.py` — cross-repo token consistency check when sibling repos are present

## Deployment

Recommended deployment: Cloudflare Pages, no build step.

- Framework preset: None
- Build command: blank
- Build output directory: `docs`
- Production branch: `main`
- Custom domains: `sangeev.me` and `www.sangeev.me`
- Canonical redirect: `www.sangeev.me` → `sangeev.me`

## Design boundary

The public estate uses a restrained project-note style: warm paper background, Charter-style serif headings, system-sans body text, thin rules, ordinary links and minimal decoration. Avoid SaaS-style gradients, glass cards, fake dashboards, social proof and tracking scripts.

Clinical-adjacent pages should keep active safety/privacy wording near the primary action. Do not add patient-data storage, analytics or third-party scripts without redesigning the safety model.
