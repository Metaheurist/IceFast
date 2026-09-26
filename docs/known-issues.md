# Known issues

Living list of demo/prototype caveats. Prefer fixing with tests when practical.

## Demo persistence

- Floor notes, pallet progress, and Temps actions live in **React state only**.
- Header **Refresh** or a new `db:build` restores the generated day.
- There is no multi-user server sync yet.

## OCR / Scan

- First Scan needs OCR assets under `/ocr` (`npm run ocr:sync` or `npm run dev`).
- Low light / skewed photos reduce match quality; use the demo sample path for walkthroughs.
- Some browsers block camera until permission is granted; photo pick still works.

## PWA

- Service worker is enabled in Vite **dev** for tablet demos; clear site data if a stale SW caches an old shell.
- Large WASM/OCR assets may take a moment on first install.

## Mandata

- Handshake DTOs are stubs — Temps banner correctly states there is no live TMS connection.
- Do not assume field names match an unpublished Mandata OpenAPI schema.

## Seed

- Changing `DEMO_LOAD_DATE` regenerates every Job No; bookmarks to old numbers will miss.
- Generator tests fail if live client name patterns leak into seed strings.

See also [setup-and-usage.md](setup-and-usage.md) and [data.md](data.md).
