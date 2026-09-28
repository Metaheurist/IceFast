# IceFast documentation

Local-first cold-chain warehouse PWA: Floor, Dispatch, Temps, and on-device sheet Scan. State is in-browser; seed is fictional SQLite. Mandata handshake modules are stubs (no HTTP).

| Doc | Contents |
| --- | --- |
| [Security](SECURITY.md) | Seed rules, CI audit/Gitleaks, no secrets in-repo |
| [App overview](app-and-features.md) | Views and source files |
| [Views](views.md) | Floor / Dispatch / Temps / Scan behaviour, with screenshots |
| [Installation & usage](setup-and-usage.md) | Install, scripts, PWA, `DEMO_LOAD_DATE` |
| [Testing & configuration](testing-and-configuration.md) | Vitest commands and suite map |
| [Build, test & CI](build-test-and-ci.md) | Scripts and GitHub Actions |
| [Architecture](architecture.md) | Source map, `AppContext`, PWA cache |
| [Data and seed](data.md) | Generators, schema, fictional-data tests |
| [Mandata handshake](mandata.md) | Stub DTO writers and shapes |
| [Project reference](project-reference.md) | Tree and dependencies |
| [Known issues](known-issues.md) | Demo persistence, OCR, PWA, seed caveats |
| [Changelog](CHANGELOG.md) | Release notes |
| [About](about-and-support.md) | Repo links and license |
| [Contributing](../CONTRIBUTING.md) | Tests, PRs, seed rules |

```bash
npm install
npm run dev
```
