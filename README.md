# IceFast

Local-first **warehouse companion** PWA for cold-chain Floor sheets, Dispatch board, yard Temps, and on-device sheet Scan. Fictional SQLite demo day; Mandata handshake modules are stubs (no HTTP).

![IceFast Dispatch board on desktop and Floor sheets on a phone](docs/images/hero.png)

**Changelog:** [CHANGELOG.md](CHANGELOG.md) · **Docs:** [docs/README.md](docs/README.md) · **License:** [MIT](LICENSE)

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
| <img src="docs/icons/lock.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Security](docs/SECURITY.md)** - seed rules, CI audit/Gitleaks |
| <img src="docs/icons/home.svg" width="32" height="32" alt="" aria-hidden="true"> | **[App overview](docs/app-and-features.md)** - Floor, Dispatch, Temps, Scan |
| <img src="docs/icons/settings.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Installation & usage](docs/setup-and-usage.md)** - scripts, PWA, date override |
| <img src="docs/icons/flask.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Testing & configuration](docs/testing-and-configuration.md)** - Vitest map, seed rules |
| <img src="docs/icons/timer.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Build, test & CI](docs/build-test-and-ci.md)** - scripts, Actions |
| <img src="docs/icons/layers.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Architecture](docs/architecture.md)** - source map, AppContext, PWA |
| <img src="docs/icons/database.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Data and seed](docs/data.md)** - `demo.db`, schema, fictional-data tests |
| <img src="docs/icons/shield.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Mandata handshake](docs/mandata.md)** - stub DTO writers |
| <img src="docs/icons/alert.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Known issues](docs/known-issues.md)** - persistence, OCR, PWA, seed |
| <img src="docs/icons/tree.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Project reference](docs/project-reference.md)** - tree and dependencies |
| <img src="docs/icons/history.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Changelog](docs/CHANGELOG.md)** |
| <img src="docs/icons/user.svg" width="32" height="32" alt="" aria-hidden="true"> | **[About](docs/about-and-support.md)** |
| <img src="docs/icons/git-branch.svg" width="32" height="32" alt="" aria-hidden="true"> | **[Contributing](CONTRIBUTING.md)** |

Demo seed is fictional. Temps banner: `Demo only - not connected to Mandata Enterprise TMS`.

---

## Features

- **Floor** - `FloorView.jsx`: status, pallet log, notes, bay times
- **Dispatch** - `DashboardView.jsx`: trailer progress, holds, live feed
- **Temps** - `TempsView.jsx`: yard units, goods °C, reefer zones, ops thread
- **Scan** - `SheetScanModal.jsx` + `localOcr.js`: local Tesseract match to active jobs

Detail: [docs/app-and-features.md](docs/app-and-features.md) · [docs/views.md](docs/views.md).

### Screenshots

<table>
<tr>
<td width="50%" valign="top"><a href="docs/views.md#floor"><img src="docs/images/floor.png" alt="Floor sheets"></a></td>
<td width="50%" valign="top"><a href="docs/views.md#dispatch"><img src="docs/images/dispatch.png" alt="Dispatch live dashboard"></a></td>
</tr>
<tr>
<td align="center"><b>Floor</b> - trailer sheets, pallet progress, notes</td>
<td align="center"><b>Dispatch</b> - fleet totals, trailer cards, exception feed</td>
</tr>
<tr>
<td width="50%" valign="top"><a href="docs/views.md#temps"><img src="docs/images/temps.png" alt="Part loads and yard temps"></a></td>
<td width="50%" valign="top"><a href="docs/views.md#scan"><img src="docs/images/scan-result.png" alt="Sheet scan with on-device OCR matches"></a></td>
</tr>
<tr>
<td align="center"><b>Temps</b> - open loads, parked reefers, ops thread</td>
<td align="center"><b>Scan</b> - on-device OCR matched to active jobs</td>
</tr>
</table>

Captured from `npm run dev` with the fictional demo day. More per view in [docs/views.md](docs/views.md); phone layouts in [docs/setup-and-usage.md](docs/setup-and-usage.md#install-as-a-pwa).

---

## Quick start

```bash
npm install
npm run dev
```

`predev` rebuilds `public/demo.db` and syncs OCR into `public/ocr`. Override sheet date with `DEMO_LOAD_DATE=DD/MM/YYYY`.

Commands: [docs/setup-and-usage.md](docs/setup-and-usage.md).

---

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Suites: [docs/testing-and-configuration.md](docs/testing-and-configuration.md). CI: [docs/build-test-and-ci.md](docs/build-test-and-ci.md).

---

## Handshake stubs

`src/integrations/mandataHandshake.js`: `toMandataJobPatch`, `toMandataAssetTemp`, `toMandataEvent`. No HTTP.

[docs/mandata.md](docs/mandata.md) · [docs/data.md](docs/data.md).

---

## Security

[docs/SECURITY.md](docs/SECURITY.md). Root [`SECURITY.md`](SECURITY.md) points at that file.

---

## License

[MIT](LICENSE)
