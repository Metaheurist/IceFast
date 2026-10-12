# Project reference

## Tree

```text
IceFast/
  docs/                 guides; images/ holds the README and view screenshots
  public/               demo.db + OCR generated at build
  scripts/              db:build, ocr:sync
  src/                  app, seed, db, OCR, integrations
  e2e/                  Playwright specs
  .github/workflows/    unit-tests, security, benchmark, e2e
  .github/dependabot.yml
  playwright.config.js
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
| E2E | `@playwright/test` |

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
