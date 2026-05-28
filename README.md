# sangeev.me

Static personal homepage and project hub for `sangeev.me`.

## Hosting plan

Recommended deployment: Cloudflare Pages, no build step.

- Framework preset: **None**
- Build command: blank
- Build output directory: `docs`
- Production branch: `main`
- Custom domains: `sangeev.me` and `www.sangeev.me`
- Canonical redirect: `www.sangeev.me` → `sangeev.me`

## Local preview

```bash
python3 -m http.server 8000 --directory docs
```

Then open <http://127.0.0.1:8000>.

## Notes

This root site intentionally links out to separate project deployments such as `opnotes.sangeev.me`. Important clinical workflow tools should remain isolated from portfolio changes.
