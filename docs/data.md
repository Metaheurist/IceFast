# Data and seed

All warehouse and yard data in the running demo comes from **SQLite** `public/demo.db`, rebuilt on `npm run dev` / `npm test` / `npm run build`. The file is gitignored. There is no live client extract in the client bundle.

## Generators

| Generator | Output | Used by |
| --- | --- | --- |
| `src/seed/generateDemoDay.js` | Inbound + outbound trailers and jobs | Floor, Dispatch, Scan matching |
| `src/seed/generateYardDay.js` | Yard units + ops events | Temps board |

`scripts/build-demo-db.mjs` writes both into `demo.db` and copies sql.js WASM into `public/` for the browser loader.

Date: `todaySheetDate()` unless `DEMO_LOAD_DATE=DD/MM/YYYY`. Job numbers look like `YYMMDD` + sequence (sheet jobs) or `YYMMDD` + 80+ sequence (yard jobs) so they never collide with a remembered live Job No.

## Fictional-data rules

Seed must not contain live client, driver, or messaging identities. Tests fail on names such as Kerry, Gilfresh, Finnebrogue, Ashlee, and similar. Demo people (Niamh Boyle, Aoife Kane, Ellen Shaw, Mark Quinn) and demo customers (Northbridge Foods, Harbour Chill Ltd, …) are invented for the walkthrough.

## SQLite schema

### `meta`

| key | example |
| --- | --- |
| `load_date` | `22/08/2026` |
| `source` | synthetic inbound/outbound + yard temps day |
| `tms` | `mandata-enterprise-stub` |

### `trailers` / `jobs`

Paper-sheet shape: vehicle, trailer, driver, bay, times, checker; jobs with pallets, temp band, customer, Job No., collect/deliver, window, order ref, inbound vehicle lineage, status, note, `done_pallets_json`.

Job status: `pending` | `loaded` | `hold`.

### `yard_units`

Join keys the traffic office already uses, plus yard slang:

| Field | Role |
| --- | --- |
| `job_no`, `vehicle`, `trailer`, `driver` | Mandata-shaped (driver/vehicle empty if parked/unassigned) |
| `work_type` | `collection` \| `delivery` \| `trunk` \| `fullMove` |
| `yard_kind` | `partLoad` \| `fullLoad` \| `parked` \| `empty` \| `vor` (yard shorthand only) |
| `twin`, `bay_no`, `fill_pct`, `status` | Yard |
| `goods_temp_c` | Manifest / Cross Dock goods temp |
| `zone1_*`, `zone2_*` | Reefer asset; null zone 2 = OFF |
| `trailer_id` | Optional link to a demo sheet trailer |

### `yard_events`

Ops thread: `job_no`, `at`, `role` (dispatch/yard), `author`, `type`, `reply_to`, `message`, `payload_json` (reefer widget).

## Runtime load

- Browser: `src/db/demoDb.js` (sql.js + `/demo.db`)
- Vitest / Node: `src/db/loadDemoTrailersFromFile.js`
- Mapping: `src/db/queryTrailers.js`

Unit tests that need a frozen graph pass `seedTrailers` (and optionally yard arrays) into `AppProvider` instead of touching SQLite. If only trailers are passed, yard is generated with `generateYardDay(DEMO_LOAD_DATE, seedTrailers)`.

## In-session vs rebuild

Edits (status, pallets, notes, bay, Temps assign/log) live in React state only. **Refresh** or a new `db:build` restores the generated day. This is a prototype, not a multi-user server.
