# IceFast

Open-source **warehouse companion** for cold-chain floors. Replace paper inbound/outbound sheets and ad-hoc notes / part-load temp threads with a shared tablet and desktop board. A TMS such as **Mandata Enterprise** can remain the traffic-office system of record - this app does not call Mandata by default.

**Changelog:** [CHANGELOG.md](CHANGELOG.md) · **Docs:** [docs/README.md](docs/README.md) · **License:** [MIT](LICENSE)

### Roadmap

[docs/next-phase-development-plan.md](docs/next-phase-development-plan.md)

### Tech stack

<table>
<tr>
<td valign="middle" width="140">
<img src="docs/icons/core.svg" width="28" height="28" alt="" aria-hidden="true">&nbsp;<b>Core</b>
</td>
<td>

[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20modules-F7DF1E?style=flat-square&logo=javascript&logoColor=000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=000)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</td>
</tr>
<tr>
<td valign="middle" width="140">
<img src="docs/icons/package.svg" width="28" height="28" alt="" aria-hidden="true">&nbsp;<b>App&nbsp;/&nbsp;PWA</b>
</td>
<td>

[![PWA](https://img.shields.io/badge/PWA-Service%20worker%20%26%20manifest-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![sql.js](https://img.shields.io/badge/sql.js-SQLite%20in%20browser-003B57?style=flat-square)](https://sql.js.org/)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-on--device%20OCR-000000?style=flat-square)](https://tesseract.projectnaptha.com/)

</td>
</tr>
<tr>
<td valign="middle" width="140">
<img src="docs/icons/tools.svg" width="28" height="28" alt="" aria-hidden="true">&nbsp;<b>Tooling&nbsp;&amp;&nbsp;CI</b>
</td>
<td>

[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Testing Library](https://img.shields.io/badge/Testing%20Library-React-E33332?style=flat-square&logo=testinglibrary&logoColor=white)](https://testing-library.com/)
[![Gitleaks](https://img.shields.io/badge/Gitleaks-secret%20scan-1E2E3E?style=flat-square)](https://github.com/gitleaks/gitleaks)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/Metaheurist/IceFast/actions)

</td>
</tr>
</table>

**Repository:** [github.com/Metaheurist/IceFast](https://github.com/Metaheurist/IceFast)

[![CI](https://img.shields.io/github/actions/workflow/status/Metaheurist/IceFast/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/Metaheurist/IceFast/actions/workflows/ci.yml)

---

### Documentation

| | |
| :--- | :--- |
| <img src="docs/icons/lock.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Security](docs/SECURITY.md)** - threat model, seed rules, out of scope |
| <img src="docs/icons/home.svg" width="32" height="32" alt="" aria-hidden="true"> | **[App overview & features](docs/app-and-features.md)** - Floor, Dispatch, Temps, Scan |
| <img src="docs/icons/settings.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Installation & usage](docs/setup-and-usage.md)** - install, PWA, date override |
| <img src="docs/icons/flask.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Testing & configuration](docs/testing-and-configuration.md)** - Vitest map, seed rules |
| <img src="docs/icons/timer.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Build, test & CI](docs/build-test-and-ci.md)** - scripts, Actions, gates |
| <img src="docs/icons/layers.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Architecture](docs/architecture.md)** - source map, shared state, PWA |
| <img src="docs/icons/database.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Data and seed](docs/data.md)** - `demo.db`, schema, fictional-data rules |
| <img src="docs/icons/shield.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Mandata handshake](docs/mandata.md)** - stub DTOs, goods vs reefer |
| <img src="docs/icons/alert.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Known issues](docs/known-issues.md)** - OCR, PWA, demo refresh |
| <img src="docs/icons/tree.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Project reference](docs/project-reference.md)** - tree and dependencies |
| <img src="docs/icons/history.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Changelog](docs/CHANGELOG.md)** |
| <img src="docs/icons/rocket.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Roadmap](docs/next-phase-development-plan.md)** |
| <img src="docs/icons/user.svg" width="32" height="32" alt="" aria-hidden="true"> | **[About & support](docs/about-and-support.md)** |
| <img src="docs/icons/git-branch.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Contributing](CONTRIBUTING.md)** |

Demo seed is **fictional** (no live client names or job numbers). Temps shows `Demo only - not connected to Mandata Enterprise TMS`.

---

## Features

- **Floor** - tablet warehouse sheet: status, pallet log, notes, bay times
- **Dispatch** - desktop board: trailer progress, holds, live feed from Floor
- **Temps** - part-load / parked-up board (Job No, vehicle, trailer, work type, bay, goods °C, reefer zones)
- **Scan** - camera or photo + local Tesseract.js OCR to match a printed sheet to an active load

Floor updates appear immediately on Dispatch. Temps actions append an ops thread line and a stub handshake payload for a future TMS join.

Full walkthrough: [docs/app-and-features.md](docs/app-and-features.md) · Views detail: [docs/views.md](docs/views.md).

---

## Quick start

```bash
npm install
npm run dev
```

Each start rebuilds `public/demo.db` with a fictional inbound, outbound, and yard-temps day. Override the sheet date with `DEMO_LOAD_DATE=DD/MM/YYYY`.

Install as a **PWA** (browser Add to Home Screen). OCR engine files sync into `public/ocr` via `npm run ocr:sync` and are cached on-device by the service worker.

Full commands: [docs/setup-and-usage.md](docs/setup-and-usage.md).

---

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Covers status and pallet helpers, Floor ↔ Dispatch sync, Floor/Dispatch/Temps UI, Mandata handshake DTOs, Note/Pallet modals, SQLite seed, and sheet-field gap regressions.

Map of suites: [docs/testing-and-configuration.md](docs/testing-and-configuration.md). CI runs the same gate on every push and pull request - see [docs/build-test-and-ci.md](docs/build-test-and-ci.md).

---

## Mandata (optional)

This companion is **not connected** to Mandata. Handshake stubs live in `src/integrations/mandataHandshake.js` (`toMandataJobPatch`, `toMandataAssetTemp`, `toMandataEvent`). There is no public OpenAPI schema; a live join needs vendor integration access.

Details: [docs/mandata.md](docs/mandata.md) · Seed schema: [docs/data.md](docs/data.md).

---

## Security

Authoritative guide: **[docs/SECURITY.md](docs/SECURITY.md)**. Root [`SECURITY.md`](SECURITY.md) points GitHub's security tab at that file.

---

## License

[MIT](LICENSE)
