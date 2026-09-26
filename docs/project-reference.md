# Project reference

Repository layout, dependencies, and troubleshooting pointers.

## Tree

```text
IceFast/
  docs/                 Documentation + icons/
  public/               Static assets (demo.db + OCR generated at build)
  scripts/              db:build, ocr:sync
  src/                  React app, seed, db, OCR, integrations
  .github/workflows/    CI
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

Lockfile: `package-lock.json`. Prefer `npm ci` in CI.

## Troubleshooting

| Issue | Doc |
|-------|-----|
| Install / PWA / date | [setup-and-usage.md](setup-and-usage.md) |
| Seed / schema | [data.md](data.md) |
| Tests | [testing-and-configuration.md](testing-and-configuration.md) |
| Build / CI | [build-test-and-ci.md](build-test-and-ci.md) |
| Mandata stubs | [mandata.md](mandata.md) |
| Security | [SECURITY.md](SECURITY.md) |
| Known issues | [known-issues.md](known-issues.md) |
| Contributing | [CONTRIBUTING.md](../CONTRIBUTING.md) |

<a id="nav-security-notes"></a>

## Security notes

See **[SECURITY.md#nav-security-notes](SECURITY.md#nav-security-notes)**.
