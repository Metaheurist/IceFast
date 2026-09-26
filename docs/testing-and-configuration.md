# Testing & configuration

Vitest + Testing Library (`jsdom`). `npm test` runs `pretest` → `db:build` then `vitest run`.

Config: `vite.config.js` → `test` (`environment: 'jsdom'`, `setupFiles: './src/test/setup.js'`).

## Commands

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Suite map

| Area | Files |
| --- | --- |
| Status / pallet / search / OCR tokens | `src/data.test.js`, `src/sheetGap.test.js` |
| Floor ↔ Dispatch state | `src/AppContext.test.jsx` |
| Floor / Dispatch / note / pallet UI | `src/components/components.test.jsx` |
| Temps UI + assign / reefer | `src/components/TempsView.test.jsx` |
| Generators (fictional seed) | `src/seed/generateYardDay.test.js`, `src/seed/generateDemoDay.test.js` |
| Handshake DTO shape | `src/integrations/mandataHandshake.test.js` |
| SQLite matches generators | `src/db/demoDb.test.js` |
| OCR helpers | `src/ocr/localOcr.test.js` |

## Seed rules

Generator tests reject live client name patterns and legacy fleet branding (`DRT*`). Demo trailers use the **IF** prefix. Job Nos stay date-derived via the seed helpers.

## Test helpers

- Pass `seedTrailers` into `AppProvider` for a frozen graph (skips SQLite).
- Most unit tests do not need OCR engine files; `localOcr.test.js` covers status helpers.
- Sheet matching regressions go in `sheetGap.test.js`.

CI: [build-test-and-ci.md](build-test-and-ci.md).
