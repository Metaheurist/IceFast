# Mandata handshake

**Mandata Enterprise TMS** (formerly Manpack) is a common system of record for jobs, vehicles, stages, and work type in cold-chain haulage. IceFast does **not** call Mandata - the handshake here is a stable DTO for a later vendor integration.

Public Mandata pages describe an open API / integration framework. **No public OpenAPI schema** was available when this companion was built. Handshake means keyed payloads the traffic pad already understands - not a fake live wire.

## What Mandata owns vs what this board owns

| Concern | Where it lives |
| --- | --- |
| Job No, vehicle, trailer, work type, stages | Mandata (stubbed as join keys on Temps) |
| Goods / pallet temperature on the live job | Mandata Manifest / Cross Dock - field `goodsTempC` on the companion |
| Dual-zone reefer set vs actual | Asset telematics (Thermo King is a listed Mandata partner) - Zone 1 / Zone 2 on the companion |
| Parked-up trailer, bay shout, controller proof | Yard loop the TMS does not replace - Temps board + ops thread |
| PL / FL | Yard shorthand only; not a documented Mandata enum |

Goods temp and reefer zones are **never mixed** in the UI or in the DTOs.

## Stub writers

`src/integrations/mandataHandshake.js` - **no HTTP**.

```js
toMandataJobPatch(unit)
// { jobNo, vehicle, trailer, workType, bayNo, goodsTempC, fillPct }

toMandataAssetTemp(unit)
// { trailer, zone1: { set, actual }, zone2: { set, actual, off } }

toMandataEvent(event)
// { jobNo, at, type, message, source: 'warehouse-companion' }
```

Temps actions call these and store the result as `lastHandshake` on `AppContext`. Contract tests in `src/integrations/mandataHandshake.test.js` freeze the JSON shape. A later Mandata vendor API can implement these three writers. Do not invent undocumented endpoints.

## Rollout checks (this demo)

- Demo seed contains no live client, driver, or messaging identities
- UI copy uses Job No / Vehicle / Trailer / Work type / Bay, with PL as a badge
- Goods °C and reefer zones are two fields
- Temps shows it is not connected to TMS
- Handshake mapper round-trips in tests; `db:build` still generates inbound + outbound sheets
- Floor / Dispatch tests still pass

A **live join** needs Mandata integration access from their vendor programme. That access is not in public docs and is out of scope here.

## Out of scope

Live Mandata credentials, Manifest replacement, Thermo King live feed, camera of controllers, messaging import.
