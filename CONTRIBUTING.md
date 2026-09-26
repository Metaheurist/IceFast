# Contributing to IceFast

Thanks for helping improve this open-source warehouse companion.

## Prerequisites

1. [docs/SECURITY.md](docs/SECURITY.md) - fictional seed only; no live TMS credentials in-repo.
2. [docs/data.md](docs/data.md) and [docs/mandata.md](docs/mandata.md) before changing seed or handshake shapes.
3. Open an Issue before large features or a live Mandata join.

## Setup

```bash
npm install
npm run dev
```

`predev` rebuilds the fictional SQLite demo day and syncs on-device OCR assets. See [docs/setup-and-usage.md](docs/setup-and-usage.md).

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Add or update unit tests next to the code you change (`*.test.js` / `*.test.jsx`). Prefer covering:

- Status / pallet / search helpers in `src/data.js`
- Floor ↔ Dispatch state in `src/AppContext.jsx`
- UI flows in `src/components/`
- Seed generators under `src/seed/`
- Handshake DTOs in `src/integrations/`

Seed data must stay **fictional** - no live client, driver, or job-number identities. Existing tests fail on known client name patterns.

## Pull requests

1. Target `main`. Keep changes focused (one concern per PR when practical).
2. Run `npm test` (and ideally `npm run build`) before opening the PR.
3. CI must pass: unit tests, Gitleaks, npm audit, production build - see [docs/build-test-and-ci.md](docs/build-test-and-ci.md).
4. Update docs under `docs/` when behaviour or setup changes. Use ASCII hyphens (`-`) in docs.
5. Do not commit secrets, `public/demo.db`, vendored OCR binaries under `public/ocr/` (except `README.txt`), `node_modules`, `dist`, or local extract scratch folders.

## Code map

| Area | Path |
|------|------|
| Shell / views | `src/App.jsx`, `src/components/` |
| Shared state | `src/AppContext.jsx` |
| Helpers | `src/data.js` |
| Seed | `src/seed/` |
| SQLite load | `src/db/` |
| Mandata stubs | `src/integrations/mandataHandshake.js` |
| OCR | `src/ocr/localOcr.js` |
| CI | `.github/workflows/ci.yml` |

## Code style

Match the existing Vite + React patterns in the repo. Prefer clear names and small helpers over large new abstractions.
