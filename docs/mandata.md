# Mandata handshake

Stub DTOs in `src/integrations/mandataHandshake.js`. **No HTTP.** Temps actions call these and store the result as `lastHandshake` on `AppContext`. Shape is locked by `src/integrations/mandataHandshake.test.js`.

## Writers

```js
toMandataJobPatch(unit)
// { jobNo, vehicle, trailer, workType, bayNo, goodsTempC, fillPct }

toMandataAssetTemp(unit)
// { trailer, zone1: { set, actual }, zone2: { set, actual, off } }

toMandataEvent(event)
// { jobNo, at, type, message, source: 'warehouse-companion' }
```

## Field split in this codebase

| Concern | Code fields |
| --- | --- |
| Join keys | `jobNo`, `vehicle`, `trailer`, `workType`, `bayNo` |
| Goods temp | `goodsTempC` on the job / unit |
| Reefer | `zone1_*` / `zone2_*` (null zone 2 = OFF) |
| Yard shorthand | `yard_kind` / PL · FL badges (not a TMS enum in this repo) |

Goods temp and reefer zones are not mixed in the UI or in the DTOs.

Seed meta marks `tms` as `mandata-enterprise-stub`. Temps banner: `Demo only - not connected to Mandata Enterprise TMS`.
