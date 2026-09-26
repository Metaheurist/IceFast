# IceFast documentation

Open-source warehouse companion for cold-chain floor, dispatch, and yard temps. It replaces paper inbound/outbound sheets and WhatsApp groups (notes, holds, part-load temps) with a tablet/desktop board. A TMS such as **Mandata Enterprise** can stay the traffic-office system of record; this app does not call Mandata by default.

| Doc | What it covers |
| --- | --- |
| [Overview](overview.md) | What the app is, who uses it, what it does not do |
| [Getting started](getting-started.md) | Install, run, PWA, date override |
| [Views](views.md) | Floor, Dispatch, Temps, Scan |
| [Data and seed](data.md) | `demo.db`, generators, schema, fictional-data rules |
| [Mandata handshake](mandata.md) | Stub DTOs, goods vs reefer, rollout checks |
| [Architecture](architecture.md) | Source map, shared state, scripts, tests |
| [Testing](testing.md) | Vitest commands, suite map, seed rules |
| [Contributing](../CONTRIBUTING.md) | Tests, PR expectations, seed rules |

Start with `npm install` then `npm run dev`. Full commands are in [getting started](getting-started.md).
