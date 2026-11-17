# Networth — Capital & Consequence

Networth is a turn-based financial life simulation, economic strategy and business management game. You begin as an ordinary individual and work toward financial stability, investment success, business ownership and potentially a wider economic enterprise.

This repository currently contains **Phase 1 — Core Shell** and **Phase 2 — Simulation Core**. The simulation foundation is active, while character progression and financial/economic systems remain scheduled for later phases.

## Workspaces

- **Overview** — financial command center and simulation controls.
- **Personal** — character dossier, calendar and well-being placeholders (Phase 3).
- **Finance** — accounts, budgets, cash flow, debt and savings placeholders (Phase 4).
- **Markets** — instrument directory, research, orders and holdings placeholders (Phase 7).
- **Businesses** — company directory, business operations and ownership placeholders (Phases 9–10).
- **Assets** — asset portfolio, property and collectibles placeholders (Phase 8).
- **Network** — people, company relationships and ownership-network placeholders.
- **News** — news feed, economic events and cause-and-effect placeholders (Phase 11).
- **Reports** — financial statements, performance and forecast placeholders.

The design uses dashboards, directories, profiles, terminals, reports and relationship networks. There is no world map, geographic exploration, travel progression or multi-region unlock system.

## Phase 2 simulation features

- Seven-day in-game turn clock, independent of real-world time.
- Seed normalization and deterministic pseudo-random draws.
- Central action validation/resolution; invalid actions do not mutate state.
- Turn and month-boundary event log.
- Three IndexedDB save slots stored locally in the current browser profile.
- Versioned save validation and an integrity checksum for accidental-corruption detection.
- JSON backup export and validated import.

Month-boundary entries are calendar markers only. No financial settlement is performed until the finance systems are implemented. Character creation, jobs, banking, credit, trading, property and business systems are not yet active.

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

## Technical boundaries

- Browser-first responsive interface.
- HTML, CSS and native JavaScript ES modules; no framework or third-party runtime dependency.
- Local saves use IndexedDB; saves do not sync across devices.
- Export JSON backups before clearing browser site data or moving to another device.
- The checksum is for accidental corruption detection, not cryptographic security.
- The empty states remain deliberate; no fabricated player balances, prices or news are shown.

## Project documents

- [Phase 1 — Core Shell](docs/PHASE_1_CORE_SHELL.md)
- [Phase 2 — Simulation Core](docs/PHASE_2_SIMULATION_CORE.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)

## Current status

**Phase 1 — implemented. Phase 2 — implemented pending user acceptance.** Later phases remain gated by the roadmap.
