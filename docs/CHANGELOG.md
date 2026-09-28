# Changelog

All notable changes to IceFast are recorded here.

## Unreleased

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
