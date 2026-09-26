# Security

Facts for this repository. No backend; no TMS API calls in the default app.

## Runtime

- Browser PWA. Demo day loads from `public/demo.db` (sql.js). Floor / Dispatch / Temps state is React memory in `AppContext`.
- OCR uses vendored Tesseract under `/ocr` (synced by `npm run ocr:sync`). No third-party OCR CDN at runtime.

## Seed

- Generators in `src/seed/` invent customers, drivers, and job numbers.
- `generateDemoDay.test.js` / `generateYardDay.test.js` fail on known live-name patterns.
- Do not commit real warehouse extracts, messaging exports, or production job lists.

## CI

- `npm audit --audit-level=high` and Gitleaks on every push/PR ([build-test-and-ci.md](build-test-and-ci.md), [`.gitleaks.toml`](../.gitleaks.toml)).
- Default demo needs no API keys. Do not commit `.env` or vendor credentials.

```bash
npm audit --audit-level=high
```

## Camera

Scan live camera needs browser permission. Photo pick works without it.

## Reporting

Use GitHub Security Advisories on this repository when available; otherwise a private Issue to the maintainer.
