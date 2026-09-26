# Security

Authoritative security guide for this repository.

## Threat model

IceFast is a **local-first browser PWA**. It loads a generated SQLite demo day into the page (sql.js) and keeps Floor / Dispatch / Temps state in React memory. It does not ship a backend, and it does not call Mandata or other TMS APIs by default.

OCR runs **on-device** via vendored Tesseract assets under `/ocr` (no third-party OCR CDN at runtime).

## Seed data

- Demo customers, drivers, and job numbers are **fictional**.
- Generator tests reject known live client name patterns.
- Do not commit real warehouse extracts, WhatsApp exports, or production job lists.

## Dependencies / CVE

- Runtime and dev dependencies are declared in `package.json` / `package-lock.json`.
- CI runs `npm audit --audit-level=high` and Gitleaks before merge — see [build-test-and-ci.md](build-test-and-ci.md).

```bash
npm audit --audit-level=high
```

## Secrets

- No API keys are required for the default demo.
- Do not commit `.env` files with Mandata or other vendor credentials if you add a live join later.
- Gitleaks scans the working tree on every CI run (README/docs allowlisted for badge false positives).

## Privileges

- No elevated OS privileges are required.
- Camera permission is only needed for live Scan; photo pick works without it.

## Out of scope

- Live Mandata / TMS credentials or HTTP
- Process injection or device rooting
- Shipping real customer or driver PII in the seed

<a id="nav-security-notes"></a>

## Notes

- Prefer fictional seed helpers in `src/seed/` over pasting production sheets.
- Treat session Floor notes and Temps actions as ephemeral until a persistence layer exists.
- Report vulnerabilities via GitHub Security Advisories on this repository when available; otherwise open a private Issue with the maintainer.
