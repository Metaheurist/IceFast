# Next-phase development plan

Active roadmap for IceFast after the open-source v1.0 companion.

## Near term

- Harden CI coverage reporting and keep `npm audit` / Gitleaks green on every push
- Expand Scan matching fixtures for more sheet layouts (still fictional)
- Optional local persistence (IndexedDB) so Refresh does not wipe an in-progress demo day
- Static hosting notes (GitHub Pages / Cloudflare Pages) for shareable demos

## Mid term

- Multi-device shared day via a thin sync backend (auth + day document), still beside Mandata
- Operator config for temp bands, bay labels, and work-type badges without rebuilding seed
- Accessibility pass on Floor/Dispatch touch targets and Temps dual-zone widgets

## Later / gated

- Live Mandata (or other TMS) join using the existing handshake DTO shapes — requires vendor programme access
- Optional Thermo King / telematics adapters for reefer actuals (not photo OCR of controllers)
- Offline conflict rules if more than one tablet edits the same load

## Explicitly not planned

- Replacing Mandata Manifest as the driver app
- Importing real WhatsApp history into the demo seed
- Shipping live client or driver identities

Shipped work: [CHANGELOG.md](CHANGELOG.md). Product scope: [app-and-features.md](app-and-features.md).
