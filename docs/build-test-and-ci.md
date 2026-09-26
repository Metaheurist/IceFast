# Build, test, and CI

Local scripts and GitHub Actions for IceFast.

## Local

```bash
npm install
npm test                 # unit tests (rebuilds demo.db first)
npm run test:coverage    # coverage
npm run build            # production Vite build (rebuilds DB + OCR)
npm run preview          # serve dist/
```

| Script | Role |
| --- | --- |
| `db:build` | Write `public/demo.db` from seed generators |
| `ocr:sync` | Vendor Tesseract assets into `public/ocr` |
| `predev` / `prebuild` / `pretest` | Hook those rebuilds before vite / vitest |

## CI/CD

Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

| Event | Jobs |
|-------|------|
| Pull request → `main` | Unit tests, secret scan, `npm audit`, production build |
| Push → `main` | Same gates |
| `workflow_dispatch` | Same gates |

```text
unit-tests  +  security-audit  +  build
        │              │            │
        └──────────────┴────────────┘
                       │
                 (all must pass)
```

### Jobs

1. **Unit tests** — Node 22, `npm ci`, `npm test` (Vitest).
2. **Secret scan & dependency check** — Gitleaks (working-tree scan) + `npm audit --audit-level=high`.
3. **Build** — `npm run build` to catch Vite/PWA packaging failures.

Linux jobs run on **ubuntu-24.04**. Gitleaks allowlists `README.md`, `CHANGELOG.md`, and `docs/` for badge/doc false positives (see [`.gitleaks.toml`](../.gitleaks.toml)).

Commits that include `[skip ci]` in the message skip the workflow on push.

### Permissions

Default `contents: read`. No release publish step yet (static PWA; no EXE matrix).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Tests fail on seed names | Keep fictional customers; see [data.md](data.md) |
| OCR missing locally | Run `npm run ocr:sync` (or `npm run dev`) |
| `demo.db` missing | Run `npm run db:build` |
| npm audit fails in CI | Upgrade or pin fixed package versions |
| Gitleaks false positive in docs | Path already allowlisted under `docs/` |
