# Build, test, and CI

## Local

```bash
npm install
npm test                  # Vitest unit tests (rebuilds demo.db first)
npm run test:coverage     # unit tests + coverage
npm run bench             # Vitest benchmarks
npm run test:e2e:install  # one-off: Playwright Chromium + system deps
npm run build             # production build (rebuilds demo.db + OCR)
npm run test:e2e          # Playwright against `vite preview` of dist/
```

| Script | Role |
| --- | --- |
| `db:build` | Write `public/demo.db` from seed generators |
| `ocr:sync` | Vendor Tesseract assets into `public/ocr` |
| `predev` / `prebuild` / `pretest` | Rebuild hooks before vite / vitest |
| `bench` | `vitest bench --run` over `src/**/*.bench.js` |
| `test:e2e` | `playwright test` (config: `playwright.config.js`, specs: `e2e/`) |

`npm run test:e2e` needs a prior `npm run build`; Playwright starts `vite preview` on port 4173.

## GitHub Actions

Four workflows under [`.github/workflows/`](../.github/workflows/). All run on push and pull request to `main`, plus `workflow_dispatch`. Commits with `[skip ci]` skip push runs.

| Workflow | File | Jobs |
| --- | --- | --- |
| Unit tests | `unit-tests.yml` | Vitest with coverage; summary table + `coverage` artifact |
| Security | `security.yml` | Gitleaks, `npm audit` (fail on high+), `npm audit signatures`, dependency review (PRs), CodeQL `security-extended` |
| Benchmarks | `benchmark.yml` | `vitest bench`; results table in job summary + `bench-results-<sha>` artifact |
| Playwright | `e2e.yml` | `npm run build`, then Playwright on desktop + tablet Chromium; `playwright-report` artifact |

Security also runs weekly (Monday 06:17 UTC) so new advisories surface without a code change.

Dependabot ([`.github/dependabot.yml`](../.github/dependabot.yml)) opens weekly grouped PRs for npm and GitHub Actions.

Runners: **ubuntu-24.04**, Node 22. Default permissions `contents: read`; CodeQL adds `security-events: write`, dependency review adds `pull-requests: write`.

Gitleaks allowlists `README.md`, `CHANGELOG.md`, and `docs/` ([`.gitleaks.toml`](../.gitleaks.toml)). Dependency review fails on high+ severity and on GPL-3.0 / AGPL-3.0 licences.

## Benchmarks

| File | Covers |
| --- | --- |
| `src/data.bench.js` | `filterTrailers`, `countMatchingJobs`, `extractSheetTokens`, `matchLoadsFromSheetText`, `trailerTotals`, `normalizeTrailers` |
| `src/seed/seed.bench.js` | `generateDemoDay`, `generateYardDay`, handshake DTO writers |

Benchmarks report only; they do not fail on regressions. Compare runs via the uploaded JSON artifacts. `scripts/bench-summary.mjs` renders the JSON as Markdown.

## Playwright

`e2e/app.spec.js` covers Floor load from `demo.db`, search, status cycle, Floor note → Dispatch feed, Temps banner/columns, and Scan demo sample. Projects: `chromium-desktop`, `chromium-tablet` (Galaxy Tab S4). Service workers are blocked in tests so each run reads fresh assets.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Seed name failures | Keep fictional customers; [data.md](data.md) |
| OCR missing locally | `npm run ocr:sync` or `npm run dev` |
| `demo.db` missing | `npm run db:build` |
| npm audit fails in CI | `npm audit fix`, or upgrade / pin fixed versions |
| Playwright: browser missing | `npm run test:e2e:install` |
| Playwright: port 4173 in use | Stop the other `vite preview`; local runs reuse an existing server |
| Gitleaks false positive in docs | Paths under `docs/` are allowlisted |
