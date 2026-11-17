# Networth — Capital & Consequence

Networth is a turn-based financial life simulation, economic strategy and business management game. Players begin as ordinary individuals with different backgrounds, resources, obligations and opportunities. Through work, education, saving, borrowing, investing, entrepreneurship, acquisitions and relationships, they pursue financial independence and may continue into building a business and investment empire.

This repository currently contains **Phase 1 — Core Shell**, **Phase 2 — Simulation Core** and **Phase 3 — Character & Life**. Household finance and the wider economy remain scheduled for later phases.

## Workspaces

- **Overview** — financial command center and simulation controls.
- **Personal** — character dossier, starting circumstances, skills, time allocation, well-being and goals.
- **Finance** — accounts, budgets, cash flow, debt and savings placeholders (Phase 4).
- **Markets** — instrument directory, research, orders and holdings placeholders (Phase 7).
- **Businesses** — company directory, business operations and ownership placeholders (Phases 9–10).
- **Assets** — asset portfolio, property and collectibles placeholders (Phase 8).
- **Network** — people, company relationships and ownership-network placeholders.
- **News** — news feed, economic events and cause-and-effect placeholders (Phase 11).
- **Reports** — financial statements, performance and forecast placeholders.

The design uses dashboards, directories, profiles, terminals, reports and relationship networks. There is no world map, geographic exploration, travel progression or multi-region unlock system.

## Phase 2 — Simulation core

- Seven-day in-game turn clock, independent of real-world time.
- Seed normalization and deterministic pseudo-random draws.
- Central action validation/resolution; invalid actions do not mutate state.
- Turn and month-boundary event log.
- Three IndexedDB save slots stored locally in the current browser profile.
- Versioned save validation and integrity checksum.
- JSON backup export and validated import.

## Phase 3 — Character & life

- Four distinct starting backgrounds: Early-Career Graduate, Career Switcher, Family Provider and Independent Specialist.
- Each profile has different education, experience, employment context, capital/debt/expense context, dependents, skills, well-being, reputation and contacts.
- Character dossier with age, background, skills, well-being and starting circumstances.
- Weekly time planner with 112 waking hours across work, study, rest, family, networking, research, side work and recreation.
- Deterministic well-being updates for health, energy, stress and happiness on turn advancement.
- Skill development through study focus, research, networking and side work.
- Measurable goals for skills, well-being and turn milestones, including lower-is-better stress goals.
- Schema v1 → v2 migration for Phase 2 local saves and JSON backups.

Starting capital, debt and monthly expenses are **scenario context only** in Phase 3; they are not account balances or ledger entries. The authoritative household financial model is introduced in Phase 4. Employment, compensation and job outcomes remain Phase 5.

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

GitHub Actions runs the same tests and syntax checks on pushes and pull requests to `main`.

## Technical boundaries

- Browser-first responsive interface.
- HTML, CSS and native JavaScript ES modules; no framework or third-party runtime dependency.
- Local saves use IndexedDB; saves do not sync across devices.
- Export JSON backups before clearing browser site data or moving to another device.
- The checksum detects accidental corruption; it is not cryptographic security.
- No fabricated financial balances, market prices or news are presented.

## Project documents

- [Phase 1 — Core Shell](docs/PHASE_1_CORE_SHELL.md)
- [Phase 2 — Simulation Core](docs/PHASE_2_SIMULATION_CORE.md)
- [Phase 3 — Character & Life](docs/PHASE_3_CHARACTER_AND_LIFE.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)

## Current status

**Phases 1–3 are implemented. Phase 3 is awaiting user acceptance.** Later phases remain gated by the roadmap.
