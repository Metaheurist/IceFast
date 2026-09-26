# Data and seed

Runtime warehouse and yard data comes from `public/demo.db` (gitignored), rebuilt by `predev` / `pretest` / `prebuild`.

## Generators

| Generator | Output | Used by |
| --- | --- | --- |
| `src/seed/generateDemoDay.js` | Inbound + outbound trailers and jobs | Floor, Dispatch, Scan |
| `src/seed/generateYardDay.js` | Yard units + ops events | Temps |

`scripts/build-demo-db.mjs` writes both into `demo.db` and copies sql.js WASM into `public/`.

Date: `todaySheetDate()` unless `DEMO_LOAD_DATE=DD/MM/YYYY`. Sheet Job Nos: `YYMMDD` + sequence. Yard Job Nos: `YYMMDD` + 80+ sequence.

## Fictional-data rules

Seed must not contain live client, driver, or messaging identities. Generator tests reject known live-name patterns. Demo people and customers in the generators are invented.

## SQLite schema

### `meta`

| key | example |
| --- | --- |
| `load_date` | `22/08/2026` |
| `source` | synthetic inbound/outbound + yard temps day |
| `tms` | `mandata-enterprise-stub` |

### `trailers` / `jobs`

Sheet shape: vehicle, trailer, driver, bay, times, checker; jobs with pallets, temp band, customer, Job No., collect/deliver, window, order ref, inbound lineage, status, note, `done_pallets_json`.

Job status: `pending` | `loaded` | `hold`.

### `yard_units`

| Field | Role |
| --- | --- |
| `job_no`, `vehicle`, `trailer`, `driver` | Join keys (empty vehicle/trailer if parked/unassigned) |
| `work_type` | `collection` \| `delivery` \| `trunk` \| `fullMove` |
| `yard_kind` | `partLoad` \| `fullLoad` \| `parked` \| `empty` \| `vor` |
| `twin`, `bay_no`, `fill_pct`, `status` | Yard |
| `goods_temp_c` | Goods temp |
| `zone1_*`, `zone2_*` | Reefer; null zone 2 = OFF |
| `trailer_id` | Optional link to a sheet trailer |

### `yard_events`

Ops thread: `job_no`, `at`, `role`, `author`, `type`, `reply_to`, `message`, `payload_json`.

## Runtime load

- Browser: `src/db/demoDb.js`
- Vitest / Node: `src/db/loadDemoTrailersFromFile.js`
- Mapping: `src/db/queryTrailers.js`

Tests can pass `seedTrailers` (and optional yard arrays) into `AppProvider`. If only trailers are passed, yard uses `generateYardDay(DEMO_LOAD_DATE, seedTrailers)`.

## In-session vs rebuild

Status, pallets, notes, bay, and Temps edits stay in React state until Refresh or a new `db:build`.
