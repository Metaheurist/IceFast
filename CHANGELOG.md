# Changelog

Canonical notes: **[docs/CHANGELOG.md](docs/CHANGELOG.md)**.

## Unreleased

- CI split into four workflows: `unit-tests.yml` (Vitest + coverage), `security.yml` (Gitleaks, npm audit, `npm audit signatures`, dependency review, CodeQL, weekly schedule), `benchmark.yml` (Vitest bench with job-summary table), and `e2e.yml` (production build + Playwright on desktop and tablet Chromium). Replaces the single `ci.yml`.
- Playwright e2e suite (`e2e/app.spec.js`) and Vitest benchmarks (`src/data.bench.js`, `src/seed/seed.bench.js`); new scripts `bench`, `test:e2e`, `test:e2e:install`.
- Dependabot weekly grouped updates for npm and GitHub Actions.
- Deps: `npm audit fix` for high-severity advisories in transitive `brace-expansion`, `source-map-js`, and `undici`.
- Deps: Dependabot #1-#6 in one change: Vite 8, `@vitejs/plugin-react` 6, Vitest 5, `vite-plugin-pwa` 2, React 19.3, testing-library and `jsdom` patches, GitHub Actions majors. Benchmarks moved to the Vitest 5 `bench` fixture and JSON reporter.
- Screenshots in the README and docs (`docs/images/`): hero, view gallery, per-view and phone captures.
- Fix: `ocr:sync` vendors Tesseract relaxed-SIMD cores so on-device OCR works on current Chrome/Edge.
- Fix: Dispatch trailer detail header no longer hides the first job row on wide screens.
- Docs trimmed to codebase reference (removed roadmap and duplicate marketing pages).
- GitHub Actions CI on push/PR: Vitest unit tests, Gitleaks, npm audit, production build.

## v1.0.0

- Open-source warehouse companion: Floor, Dispatch, Temps, on-device sheet Scan.
- Fictional SQLite demo day (`demo.db`) for inbound/outbound sheets and yard temps.
- Mandata handshake stub DTOs (no live TMS HTTP).
- Vitest + Testing Library coverage for helpers, UI, seed, and handshake contracts.
- PWA install (service worker caches app shell, sql.js, OCR assets).
