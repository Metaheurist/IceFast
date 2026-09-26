# Architecture

Vite + React 19 SPA. Shared warehouse state in `src/AppContext.jsx`. No backend.

## Source map

```
src/
  App.jsx                 Header, view switch, note/pallet modals
  AppContext.jsx          Trailers, feed, yard, handshake, load/refresh
  data.js                 Status, pallet math, search/OCR match helpers
  seed/
    generateDemoDay.js    Fictional inbound/outbound day
    generateYardDay.js    Fictional Temps day
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
    LoadSearchBar.jsx     Search, filters, Scan entry
    SheetScanModal.jsx
    NoteModal.jsx
    PalletLogModal.jsx
scripts/
  build-demo-db.mjs       Writes public/demo.db
  sync-ocr-assets.mjs     Vendors Tesseract files
docs/                     This documentation
```

Demo fleet IDs in the seed use the fictional **IF** trailer prefix (e.g. IF200). There is no client extract pipeline in this repo — seed is generated only by `generateDemoDay` / `generateYardDay`.


## Shared state

`AppProvider` loads `demo.db` on first paint (unless tests pass `seedTrailers`).

**Sheets:** `cycleJobStatus`, `toggleJobPallet`, `setJobDoneCount`, `markJobHold`, `saveJobNote`, `updateTrailerMeta` (bay, times, checker). Each successful change prepends a **feed** item used by Dispatch.

**Yard:** `assignParked`, `setYardBay`, `logReefer`, `logGoodsTemp`, `markYardStatus`. Each prepends a **yard event** and sets `lastHandshake` from the Mandata stub mappers.

`view` is `floor` | `dashboard` | `temps`. Search query and status/temp filters are global so Scan can jump Floor and Dispatch to the same load.

## Tests

Vitest + Testing Library (`jsdom`). `pretest` rebuilds `demo.db`.

| Area | Files |
| --- | --- |
| Status / pallet / search / OCR tokens | `src/data.test.js`, `src/sheetGap.test.js` |
| Floor ↔ Dispatch state | `src/AppContext.test.jsx` |
| Floor / Dispatch / note / pallet UI | `src/components/components.test.jsx` |
| Temps UI + assign / reefer | `src/components/TempsView.test.jsx` |
| Yard generator + banned names | `src/seed/generateYardDay.test.js`, `generateDemoDay.test.js` |
| Handshake DTO shape | `src/integrations/mandataHandshake.test.js` |
| SQLite matches generators | `src/db/demoDb.test.js` |
| OCR helpers | `src/ocr/localOcr.test.js` |

## PWA

`vite-plugin-pwa` in `vite.config.js`. Manifest name: IceFast Warehouse. Service worker caches the app shell, `demo.db`, sql.js, and `/ocr`. Enabled in `vite` so a tablet can install during a local demo.
