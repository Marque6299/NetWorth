# Networth — Capital & Consequence

Networth is a turn-based financial life simulation, economic strategy and business management game. You begin as an ordinary individual and work toward financial stability, investment success, business ownership and potentially a wider economic enterprise.

This repository contains **Phase 1 — Core Shell**: a responsive browser interface, shared UI components and navigable placeholder workspaces. The simulation systems are intentionally not implemented in this phase.

## Phase 1 scope

The interface includes all nine planned workspaces:

- **Overview** — financial command center and empty dashboard states.
- **Personal** — character dossier, calendar and well-being placeholders.
- **Finance** — accounts, budgets, cash flow, debt and savings placeholders.
- **Markets** — instrument directory, research, orders and holdings placeholders.
- **Businesses** — company directory, business operations and ownership placeholders.
- **Assets** — asset portfolio, property and collectibles placeholders.
- **Network** — people, company relationships and ownership-network placeholders.
- **News** — news feed, economic events and cause-and-effect placeholders.
- **Reports** — financial statements, performance and forecast placeholders.

The design uses dashboards, directories, profiles, terminals, reports and relationship networks. There is no world map, geographic exploration, travel progression or multi-region unlock system.

## Run locally

Requirements: Node.js 18 or newer. There are no runtime dependencies to install.

```bash
npm run dev
```

Open `http://127.0.0.1:4173`.

## Validate

```bash
npm test
npm run check
```

The tests validate the nine-workspace navigation, route handling, placeholder content, reusable components and HTML escaping.

## Technical boundaries

- Browser-first responsive interface.
- HTML, CSS and native JavaScript ES modules; no framework or third-party runtime dependency.
- Presentation is separate from the future simulation rules.
- No game clock, seeded simulation, character creation, ledger, market engine, business logic or persistence is active in Phase 1.
- The empty states are deliberate; the interface does not display invented player balances or fabricated market data.

## Project documents

The Phase 1 implementation record and acceptance gate are in [`docs/PHASE_1_CORE_SHELL.md`](docs/PHASE_1_CORE_SHELL.md). The sequential implementation roadmap is in [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md).

## Current status

**Phase 1 — Core Shell: implemented.** All nine workspaces are reachable and display intentional empty states. The automated acceptance checks run with `npm test` and `npm run check`.
