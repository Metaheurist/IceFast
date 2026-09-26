# Testing

Vitest + Testing Library (`jsdom`). `npm test` runs `pretest` → `db:build` then `vitest run`.

## Commands

```bash
npm test              # rebuild demo.db, run once
npm run test:watch    # watch mode (run db:build yourself if seed changed)
npm run test:coverage # coverage report
```

## Map of suites

| Area | Files |
| --- | --- |
| Status / pallet / search / OCR tokens | `src/data.test.js`, `src/sheetGap.test.js` |
| Floor ↔ Dispatch state | `src/AppContext.test.jsx` |
| Floor / Dispatch / note / pallet UI | `src/components/components.test.jsx` |
| Temps UI + assign / reefer | `src/components/TempsView.test.jsx` |
| Yard + demo generators (fictional seed) | `src/seed/generateYardDay.test.js`, `src/seed/generateDemoDay.test.js` |
| Handshake DTO shape | `src/integrations/mandataHandshake.test.js` |
| SQLite matches generators | `src/db/demoDb.test.js` |
| OCR helpers | `src/ocr/localOcr.test.js` |

## Seed rules

Demo data must stay fictional. Generator tests reject live client name patterns and legacy fleet branding (`DRT*`). Demo trailers use the **IF** prefix (e.g. IF200).

When adding seed jobs, prefer invented customers and the helpers in `generateDemoDay.js` / `generateYardDay.js` so Job Nos stay date-derived.

## Tips

- Pass `seedTrailers` into `AppProvider` for a frozen graph in component tests (avoids hitting SQLite).
- OCR engine files are not required for most unit tests; `localOcr.test.js` only checks status helpers.
- Sheet matching regressions belong in `sheetGap.test.js` so Floor Scan behaviour stays pinned.
