# Changelog

All notable changes to IceFast are recorded here.

## Unreleased

- CI split into four workflows: `unit-tests.yml` (Vitest + coverage), `security.yml` (Gitleaks, npm audit, `npm audit signatures`, dependency review, CodeQL, weekly schedule), `benchmark.yml` (Vitest bench with job-summary table), and `e2e.yml` (production build + Playwright on desktop and tablet Chromium). Replaces the single `ci.yml`.
- Playwright e2e suite (`e2e/app.spec.js`) and Vitest benchmarks (`src/data.bench.js`, `src/seed/seed.bench.js`); new scripts `bench`, `test:e2e`, `test:e2e:install`.
- Dependabot weekly grouped updates for npm and GitHub Actions.
- Deps: `npm audit fix` for high-severity advisories in transitive `brace-expansion`, `source-map-js`, and `undici`.
- Screenshots: README hero (Dispatch on desktop + Floor on a phone) and a view gallery; per-view captures in `docs/views.md` (Floor, pallet log, note, quick filter, Dispatch, trailer detail, Temps, reefer dialog, Scan camera and result), one per view in `docs/app-and-features.md`, phone layouts in `docs/setup-and-usage.md`. Images live in `docs/images/`.
- Fix: `ocr:sync` now also vendors Tesseract's relaxed-SIMD cores, which `tesseract.js` 7 loads on current Chrome/Edge. Without them on-device OCR failed with "Engine error" (the demo sample still worked).
- Fix: Dispatch trailer detail table header no longer covers the first job row on wide screens.
- Docs trimmed to codebase reference (removed roadmap and duplicate marketing pages).
- GitHub Actions CI on push/PR: Vitest unit tests, Gitleaks, npm audit, production build.

## v1.0.0

- Open-source warehouse companion: Floor, Dispatch, Temps, on-device sheet Scan.
- Fictional SQLite demo day (`demo.db`) for inbound/outbound sheets and yard temps.
- Mandata handshake stub DTOs (no live TMS HTTP).
- Vitest + Testing Library coverage for helpers, UI, seed, and handshake contracts.
- PWA install (service worker caches app shell, sql.js, OCR assets).
