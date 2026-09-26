# Project reference

## Tree

```text
IceFast/
  docs/
  public/               demo.db + OCR generated at build
  scripts/              db:build, ocr:sync
  src/                  app, seed, db, OCR, integrations
  .github/workflows/
  CONTRIBUTING.md
  index.html
  package.json
  vite.config.js
```

## Dependencies

| Area | Packages |
|------|----------|
| UI | `react`, `react-dom`, `lucide-react` |
| Styling | `tailwindcss`, `@tailwindcss/vite` |
| Data | `sql.js` |
| OCR | `tesseract.js` |
| Build | `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa` |
| Test | `vitest`, `@vitest/coverage-v8`, `@testing-library/*`, `jsdom` |

Lockfile: `package-lock.json`. CI uses `npm ci`.

## Doc index

| Topic | Doc |
|-------|-----|
| Install / PWA / date | [setup-and-usage.md](setup-and-usage.md) |
| Seed / schema | [data.md](data.md) |
| Tests | [testing-and-configuration.md](testing-and-configuration.md) |
| Build / CI | [build-test-and-ci.md](build-test-and-ci.md) |
| Handshake stubs | [mandata.md](mandata.md) |
| Security | [SECURITY.md](SECURITY.md) |
| Known issues | [known-issues.md](known-issues.md) |
| Contributing | [CONTRIBUTING.md](../CONTRIBUTING.md) |
