# Overview

Compact product summary. Full feature walkthrough: **[app-and-features.md](app-and-features.md)**.

**IceFast** is an open-source warehouse companion for cold-chain operations. Floor staff and traffic share one local day of work instead of paper sheets and WhatsApp.

A TMS (for example Mandata Enterprise, formerly Manpack) can remain the planner’s system of record. IceFast sits beside it: sheets, pallet progress, notes, and the yard temps loop that the TMS does not replace on the dock.

## Who it is for

| Role | View | Job |
| --- | --- | --- |
| Warehouse / checker | **Floor** | Mark pallets, cycle status, note exceptions, log bay times |
| Traffic / dispatch | **Dispatch** | Watch trailer progress, holds, and the live notes feed |
| Yard / cross-dock | **Temps** | Parked boxes, bay, goods °C, reefer zones, ops thread |
| Anyone with a sheet photo | **Scan** | Photograph a printed sheet and jump to the matching load |

State is shared in the browser. A Floor tap shows up immediately on Dispatch. Temps actions append an ops-thread line and a stub Mandata handshake payload.

## What it replaces

- Paper **inbound** and **outbound** warehouse sheets
- WhatsApp notes / hold messages to dispatch
- The **Temperatures – Part loads** style WhatsApp group (parked-up trailer, bay, controller proof)

## What it does not do

Out of scope for the current prototype:

- Live Mandata (or other TMS) credentials or HTTP
- Replacing a Mandata Manifest-style driver app
- Live Thermo King / Webfleet telematics
- Camera capture of reefer controllers
- Importing real WhatsApp history
- Live client, driver, or job-number data (seed is fictional)

## Demo banner

Temps shows:

> Demo only — not connected to Mandata Enterprise TMS

Treat every load, trailer, and temperature on screen as **synthetic**. Rebuilds on each `npm run dev`.
