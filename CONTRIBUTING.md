# Contributing

## Before you change seed or handshake

1. [docs/SECURITY.md](docs/SECURITY.md)
2. [docs/data.md](docs/data.md)
3. [docs/mandata.md](docs/mandata.md)

## Setup

```bash
npm install
npm run dev
```

`predev` rebuilds `demo.db` and syncs OCR assets. See [docs/setup-and-usage.md](docs/setup-and-usage.md).

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Put tests next to the code (`*.test.js` / `*.test.jsx`). Cover helpers in `src/data.js`, state in `src/AppContext.jsx`, UI under `src/components/`, seed under `src/seed/`, and handshake under `src/integrations/` when those areas change.

Seed must stay fictional. Generator tests fail on known live-name patterns.

## Pull requests

1. Target `main`. Keep one concern per PR when practical.
2. Run `npm test` (and `npm run build` for packaging changes) before opening.
3. CI must pass: Unit tests, Security (Gitleaks, npm audit, dependency review, CodeQL), and Playwright (build + e2e). Benchmarks report only ([docs/build-test-and-ci.md](docs/build-test-and-ci.md)).
4. Update `docs/` when behaviour or setup changes. Use ASCII hyphens (`-`) in docs.
5. Do not commit secrets, `public/demo.db`, vendored OCR under `public/ocr/` (except `README.txt`), `node_modules`, `dist`, or local extract scratch folders.

## Code map

| Area | Path |
|------|------|
| Shell / views | `src/App.jsx`, `src/components/` |
| Shared state | `src/AppContext.jsx` |
| Helpers | `src/data.js` |
| Seed | `src/seed/` |
| SQLite load | `src/db/` |
| Handshake stubs | `src/integrations/mandataHandshake.js` |
| OCR | `src/ocr/localOcr.js` |
| Benchmarks | `src/**/*.bench.js` |
| Playwright | `e2e/`, `playwright.config.js` |
| CI | `.github/workflows/` (`unit-tests`, `security`, `benchmark`, `e2e`) |

Match existing Vite + React patterns in the repo.
