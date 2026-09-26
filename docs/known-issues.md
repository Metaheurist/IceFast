# Known issues

Behaviour that matches the current code.

## Demo persistence

- Floor notes, pallet progress, and Temps actions live in React state only (`AppContext`).
- Header **Refresh** or a new `db:build` restores `demo.db`.
- No multi-user sync server in this repo.

## OCR / Scan

- First Scan needs assets under `/ocr` (`npm run ocr:sync` or `npm run dev`).
- Match quality depends on photo quality; demo sample path available in Scan UI.
- Some browsers block camera until permission is granted; photo pick still works.

## PWA

- Service worker enabled in Vite config for local install demos; clear site data if a stale SW serves an old shell.
- First install may wait on WASM / OCR assets.

## Handshake

- `mandataHandshake.js` writers are stubs. Temps banner states there is no live TMS connection.

## Seed

- Changing `DEMO_LOAD_DATE` regenerates Job Nos; old numbers will not match.
- Generator tests fail if banned live-name patterns appear in seed strings.

See [setup-and-usage.md](setup-and-usage.md) and [data.md](data.md).
