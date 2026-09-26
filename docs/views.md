# Views

Header nav: **Floor** · **Dispatch** · **Temps**. Scan is a modal from the search bar on Floor and Dispatch, not a fourth header tab.

## Floor

Tablet/phone warehouse sheet. Source: `src/components/FloorView.jsx`.

Direction chips under the header: All sheets, Outbound, Inbound, Hold / Collect.

Each trailer block looks like the paper sheet:

- Vehicle, trailer, driver
- Direction badge (inbound / outbound / HOLD / COLLECTION)
- **Bay**, **Time on**, **Time off**, inbound **Checker**, computed bay dwell
- Job rows: pallet progress, temp band, customer, Job No., collect, deliver, window, status, note

### Actions

| Action | What happens |
| --- | --- |
| Tap status | Cycles Pending → Loaded → Hold → Pending. Loaded fills all pallet numbers. Hold keeps partial progress. |
| Tap pallet count | Opens **Pallet log** — toggle individual pallets, set a count, or mark Hold |
| Note icon | Opens **Note** — typed (or dictate where SpeechRecognition exists). Saved notes appear on Dispatch live feed |
| Search / filters | Job No, customer, trailer, temp band, status. Chips for demo shortcuts (IF200, Hold, Frozen, …) |
| Scan | Photograph or pick a sheet photo; see [Scan](#scan) |

Special buckets use vehicle labels `HOLD` / `COLLECTION` (trailers `PALLETSHOLD` / `TOCOLLECT`) the same way the paper sheets group leftover and to-collect work.

## Dispatch

Desktop traffic dashboard. Source: `src/components/DashboardView.jsx`.

- Trailer cards with pallet progress bars (loaded vs hold remaining)
- Direction and temp-mix badges
- Exception emphasis on Hold jobs
- Click a card for job-level detail (collect/deliver, order ref, inbound vehicle lineage, notes)
- **Live feed** of status, pallet progress, notes, and bay/checker updates from Floor

Search and Scan work the same as Floor. Floor and Dispatch share `AppContext` — no extra sync step.

## Temps

Yard / part-load board that replaces the WhatsApp “temps / parked up” loop. Source: `src/components/TempsView.jsx`.

Looks like a traffic/cross-dock pad, not a chat clone. Labels are Mandata-shaped: **Job No, Vehicle, Trailer, Work type, Bay**. **PL** / **FL** are yard shorthand badges next to work type (`collection` / `delivery` / `trunk` / `fullMove`).

Three columns:

1. **Open loads** — fill %, goods °C, reefer Zone 1 / Zone 2 set vs actual (green at set, amber pulling down, red off-spec). Unassigned loads show as Unassigned until a parked box is put on.
2. **Available / parked** — unassigned trailers; **Twin** if dual-zone.
3. **Ops thread** — dispatch instruction then yard confirm. Reefer proof is a dual-zone widget, not a Thermo King photo.

### Actions

| Action | Job field | Asset field |
| --- | --- | --- |
| Bay | `bayNo` | — |
| Goods °C | `goodsTempC` (Manifest / Cross Dock shaped) | — |
| Reefer | — | Zone 1 / Zone 2 set vs actual (Thermo King shaped) |
| Assign parked | vehicle, trailer, twin, actuals copied onto the open load | parked unit becomes empty |
| VOR | status / yard kind | — |

Each action appends a thread line **and** a handshake DTO (`lastHandshake`). See [Mandata handshake](mandata.md).

Banner on this view: `Demo only — not connected to Mandata Enterprise TMS`.

## Scan

On-device Tesseract.js OCR. Source: `src/components/SheetScanModal.jsx`, engine `src/ocr/localOcr.js`.

Opened from **Scan** on the load search bar.

1. Live camera (rear camera preferred) or choose a photo
2. Frame is downscaled + greyscaled
3. Local worker reads text (no CDN at runtime; assets under `/ocr`)
4. Tokens are matched to active jobs (`matchLoadsFromSheetText` in `src/data.js`)
5. Choosing a hit fills search so Floor/Dispatch jumps to that load

A **demo sample** path exists for walkthroughs without a printed sheet (`buildDemoOcrSample` — fictional IF200 outbound). Engine files are vendored by `npm run ocr:sync` and cached by the PWA.
