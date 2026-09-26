# IceFast — Warehouse Companion

Open-source **warehouse companion** for cold-chain floors: replace paper inbound/outbound sheets and WhatsApp notes / part-load temps with a shared tablet and desktop board. **Mandata Enterprise TMS** (or any TMS) can remain the traffic-office system of record — this app does not call Mandata by default.

**Docs:** [docs/README.md](docs/README.md) · **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) · **License:** [MIT](LICENSE)

## Features

- **Floor** — tablet warehouse sheet: status, pallet log, notes, bay times
- **Dispatch** — desktop board: trailer progress, holds, live feed from Floor
- **Temps** — part-load / parked-up board (Job No, vehicle, trailer, work type, bay, goods °C, reefer zones)
- **Scan** — camera or photo + local Tesseract.js OCR to match a printed sheet to an active load

Floor updates appear immediately on Dispatch. Temps actions append an ops thread line and a stub handshake payload for a future TMS join.

## Quick start

```bash
npm install
npm run dev
```

Each start rebuilds `public/demo.db` with a **fictional** inbound, outbound, and yard-temps day (no live client names or job numbers). Override the sheet date with `DEMO_LOAD_DATE=DD/MM/YYYY`.

Install as a **PWA** (browser Add to Home Screen). OCR engine files sync into `public/ocr` via `npm run ocr:sync` and are cached on-device by the service worker.

Full commands: [docs/getting-started.md](docs/getting-started.md).

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Covers status and pallet helpers, Floor ↔ Dispatch sync, Floor/Dispatch/Temps UI, Mandata handshake DTOs, Note/Pallet modals, SQLite seed, and sheet-field gap regressions. Map of test files: [docs/architecture.md](docs/architecture.md).

## Mandata (optional)

This companion is **not connected** to Mandata. Temps shows `Demo only — not connected to Mandata Enterprise TMS`.

Handshake stubs live in `src/integrations/mandataHandshake.js` (`toMandataJobPatch`, `toMandataAssetTemp`, `toMandataEvent`). There is no public OpenAPI schema; a live join needs vendor integration access.

Details: [docs/mandata.md](docs/mandata.md) · Seed schema: [docs/data.md](docs/data.md).
