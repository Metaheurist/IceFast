# Build, test, and CI

## Local

```bash
npm install
npm test
npm run test:coverage
npm run build
npm run preview
```

| Script | Role |
| --- | --- |
| `db:build` | Write `public/demo.db` from seed generators |
| `ocr:sync` | Vendor Tesseract assets into `public/ocr` |
| `predev` / `prebuild` / `pretest` | Rebuild hooks before vite / vitest |

## GitHub Actions

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

| Event | Jobs |
|-------|------|
| Pull request → `main` | Unit tests, Gitleaks, `npm audit`, production build |
| Push → `main` | Same |
| `workflow_dispatch` | Same |

1. **Unit tests** - Node 22, `npm ci`, `npm test`
2. **Secret scan & dependency check** - Gitleaks + `npm audit --audit-level=high`
3. **Build** - `npm run build`

Runs on **ubuntu-24.04**. Gitleaks allowlists `README.md`, `CHANGELOG.md`, and `docs/` (see [`.gitleaks.toml`](../.gitleaks.toml)). Commits with `[skip ci]` skip the push workflow.

Permissions: `contents: read`. No publish job.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Seed name failures | Keep fictional customers; [data.md](data.md) |
| OCR missing locally | `npm run ocr:sync` or `npm run dev` |
| `demo.db` missing | `npm run db:build` |
| npm audit fails in CI | Upgrade or pin fixed versions |
| Gitleaks false positive in docs | Paths under `docs/` are allowlisted |
