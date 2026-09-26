# IceFast documentation

Open-source warehouse companion for cold-chain floor, dispatch, and yard temps. It replaces paper inbound/outbound sheets and WhatsApp groups (notes, holds, part-load temps) with a tablet/desktop board. A TMS such as **Mandata Enterprise** can stay the traffic-office system of record; this app does not call Mandata by default.

| Doc | What it covers |
| --- | --- |
| [Security](SECURITY.md) | Threat model, seed rules, reporting |
| [App overview & features](app-and-features.md) | Who it is for, Floor / Dispatch / Temps / Scan |
| [Views](views.md) | Per-view actions and UI detail |
| [Installation & usage](setup-and-usage.md) | Install, run, PWA, date override |
| [Getting started](getting-started.md) | Short command cheat sheet (same topic) |
| [Testing & configuration](testing-and-configuration.md) | Vitest commands, suite map, seed rules |
| [Build, test & CI](build-test-and-ci.md) | Scripts, GitHub Actions, gates |
| [Architecture](architecture.md) | Source map, shared state, scripts, PWA |
| [Data and seed](data.md) | `demo.db`, generators, schema, fictional-data rules |
| [Mandata handshake](mandata.md) | Stub DTOs, goods vs reefer, rollout checks |
| [Project reference](project-reference.md) | Tree and dependencies |
| [Known issues](known-issues.md) | OCR, PWA, demo refresh caveats |
| [Changelog](CHANGELOG.md) | Release notes |
| [Roadmap](next-phase-development-plan.md) | Next phase plan |
| [About & support](about-and-support.md) | Links and support |
| [Overview](overview.md) | Compact product summary |
| [Contributing](../CONTRIBUTING.md) | Tests, PR expectations, seed rules |

Start with `npm install` then `npm run dev`. Full commands are in [installation & usage](setup-and-usage.md).
