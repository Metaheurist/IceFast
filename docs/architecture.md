# Architecture

Vite + React 19 SPA. Shared state in `src/AppContext.jsx`. No backend.

## Source map

```
src/
  App.jsx                 Header, view switch, note/pallet modals
  AppContext.jsx          Trailers, feed, yard, handshake, load/refresh
  data.js                 Status, pallet math, search/OCR match helpers
  seed/
    generateDemoDay.js    Inbound/outbound day
    generateYardDay.js    Temps day
  db/
    demoDb.js             Browser sql.js loader
    loadDemoTrailersFromFile.js
    queryTrailers.js      SQLite → UI objects
  integrations/
    mandataHandshake.js   Stub DTOs (no HTTP)
  ocr/localOcr.js         On-device Tesseract worker
  components/
    FloorView.jsx
    DashboardView.jsx
    TempsView.jsx
    LoadSearchBar.jsx
    SheetScanModal.jsx
    NoteModal.jsx
    PalletLogModal.jsx
scripts/
  build-demo-db.mjs
  sync-ocr-assets.mjs
docs/
```

Demo trailers use the fictional **IF** prefix (e.g. IF200). Seed comes only from `generateDemoDay` / `generateYardDay`.

## Shared state

`AppProvider` loads `demo.db` on first paint (unless tests pass `seedTrailers`).

**Sheets:** `cycleJobStatus`, `toggleJobPallet`, `setJobDoneCount`, `markJobHold`, `saveJobNote`, `updateTrailerMeta`. Each change prepends a feed item for Dispatch.

**Yard:** `assignParked`, `setYardBay`, `logReefer`, `logGoodsTemp`, `markYardStatus`. Each prepends a yard event and sets `lastHandshake` from the stub mappers.

`view` is `floor` | `dashboard` | `temps`. Search query and filters are global so Scan can jump Floor and Dispatch.

## Tests

Vitest + Testing Library (`jsdom`). `pretest` rebuilds `demo.db`. Suite map: [testing-and-configuration.md](testing-and-configuration.md). CI: [build-test-and-ci.md](build-test-and-ci.md).

## PWA

`vite-plugin-pwa` in `vite.config.js`. Manifest name: IceFast Warehouse. Service worker caches app shell, `demo.db`, sql.js, and `/ocr`. Enabled in `vite` for local tablet install.
