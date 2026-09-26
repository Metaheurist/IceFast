# Contributing to IceFast

Thanks for helping improve this open-source warehouse companion.

## Setup

```bash
npm install
npm run dev
```

`predev` rebuilds the fictional SQLite demo day and syncs on-device OCR assets. See [docs/getting-started.md](docs/getting-started.md).

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

Seed data must stay **fictional** — no live client, driver, or job-number identities. Existing tests fail on known client name patterns.

## Pull requests

1. Keep changes focused (one concern per PR when practical).
2. Run `npm test` before opening the PR.
3. Update docs under `docs/` when behaviour or setup changes.
4. Do not commit `public/demo.db`, vendored OCR binaries under `public/ocr/` (except `README.txt`), or local extract scratch folders.

## Code style

Match the existing Vite + React patterns in the repo. Prefer clear names and small helpers over large new abstractions.
