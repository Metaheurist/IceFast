# Changelog

All notable changes to IceFast are recorded here.

## Unreleased

- CI split into four workflows: `unit-tests.yml` (Vitest + coverage), `security.yml` (Gitleaks, npm audit, `npm audit signatures`, dependency review, CodeQL, weekly schedule), `benchmark.yml` (Vitest bench with job-summary table), and `e2e.yml` (production build + Playwright on desktop and tablet Chromium). Replaces the single `ci.yml`.
- Playwright e2e suite (`e2e/app.spec.js`) and Vitest benchmarks (`src/data.bench.js`, `src/seed/seed.bench.js`); new scripts `bench`, `test:e2e`, `test:e2e:install`.
- Dependabot weekly grouped updates for npm and GitHub Actions.
- Deps: `npm audit fix` for high-severity advisories in transitive `brace-expansion`, `source-map-js`, and `undici`.
- Deps: Dependabot #1-#6 in one change. Vite 6 to 8, `@vitejs/plugin-react` 6, Vitest and `@vitest/coverage-v8` 5, `vite-plugin-pwa` 2, React 19.3, `@testing-library/react` 16.3.3, `@testing-library/user-event` 14.6.7, `jsdom` 30.1.2; GitHub Actions `checkout`/`setup-node` v7, `cache` v6, `upload-artifact` v7, `dependency-review-action` v5. #4 and #6 could not install on their own: `plugin-react` 6 needs Vite 8 and `coverage-v8` 5 needs Vitest 5. Vitest 5 rewrote benchmarks, so `src/data.bench.js` and `src/seed/seed.bench.js` use the `bench` test fixture, `benchmark.yml` writes results with `--reporter=json` (the `--outputJson` flag is gone), and `scripts/bench-summary.mjs` reads the new format.
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
