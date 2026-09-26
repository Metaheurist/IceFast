# Installation & usage

## Requirements

- **Node.js 22+** (npm; see `.nvmrc`)
- Modern Chromium or Safari for the PWA and on-device OCR

## Install and run

```bash
npm install
npm run dev
```

`predev` rebuilds `public/demo.db` and syncs OCR engine files into `public/ocr` before Vite starts. Open the URL Vite prints (typically `http://localhost:5173/`).

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Rebuild demo DB + OCR assets, then Vite |
| `npm run db:build` | Write `public/demo.db` only |
| `npm run ocr:sync` | Copy Tesseract worker/core/lang files into `public/ocr` |
| `npm test` | Rebuild DB, then Vitest once |
| `npm run test:watch` | Vitest watch |
| `npm run test:coverage` | Coverage report |
| `npm run build` | Production bundle (`prebuild` rebuilds DB + OCR) |
| `npm run preview` | Serve the production build |

## Sheet date

Default load date is **today** (`DD/MM/YYYY`). Override when generating the SQLite file:

```bash
# Windows PowerShell
$env:DEMO_LOAD_DATE="22/08/2026"; npm run db:build

# Unix
DEMO_LOAD_DATE=22/08/2026 npm run db:build
```

Job numbers and yard job keys are derived from that date, so changing the day changes every Job No.

## Install as a PWA

In Chrome/Edge or Safari on a phone or tablet: **Add to Home Screen**. The service worker caches:

- App shell
- `demo.db` + sql.js WASM
- `/ocr` Tesseract assets (so sheet scan works offline after first load)

OCR files are gitignored except `public/ocr/README.txt`. They appear after `ocr:sync` (also part of `predev`).

Do not commit client PDF extracts or OCR scratch folders - the demo day is generated only from `src/seed/`.

## Refresh

Header **Refresh** reloads sheets and yard units from local `demo.db`. Floor notes and Temps actions taken in this session are discarded. Last-sync time is shown in the header on larger screens.

## Production build

```bash
npm run build
npm run preview
```

Static output lands in `dist/`. No backend; host as a static SPA/PWA.

CI: [build-test-and-ci.md](build-test-and-ci.md).
