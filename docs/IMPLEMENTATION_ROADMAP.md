# NetWorth / MOSAIC — Implementation Roadmap

**Baseline date:** 2026-11-15  
**Repository:** `Marque6299/NetWorth`  
**Game:** MOSAIC — Life, Capital & Consequence  
**World:** Aurel · **Starter city:** Meridian · **Currency:** Luma (LU)

This roadmap tracks the path from repository initialization to the intended full simulation. Status is based on committed repository artifacts, not planned work.

## Current implementation snapshot

| Workstream | Status | Evidence / remaining work |
|---|---|---|
| Repository and project identity | Complete | Initial repository and README |
| Visual direction | Complete | Top-down world-map direction locked |
| Aurel geography and atlas | Initial implementation | Five continents, 12 regions and 12 cities |
| World-map prototype | Implemented | SVG map, city selection, pan, zoom and search |
| Structured route data | Implemented in this milestone | Route control points now live in world JSON |
| Structured resource sites | Implemented in this milestone | Resource-site records now drive map markers |
| City inspector profile | Initial implementation | City metrics and industry profile loaded from JSON |
| World-data validation | Initial implementation | Node validation script |
| City/district map | Not started | Meridian districts are named but not spatially modeled |
| Player and household simulation | Not started | No player entity, household, needs or life state |
| Accounting and financial engine | Not started | No ledger, accounts, transaction posting or balance checks |
| Employment and labor market | Not started | No jobs, wages, hiring or unemployment simulation |
| Business simulation | Not started | No operating businesses, inventory, production or cash flow |
| Banking and credit | Not started | No deposits, loans, interest or repayment schedules |
| Markets and trade simulation | Not started | Corridors are visual only; no goods flow or price formation |
| Government and taxation | Not started | No fiscal accounts, tax rules or public services |
| Macro-economy and events | Not started | No time-stepped inflation, growth, recession or event engine |
| Persistence and save/load | Not started | No durable game state or migration strategy |
| Full gameplay and progression | Not started | No playable loop, goals, onboarding or progression |
| Release readiness | Not started | No automated test suite, accessibility/performance gates or release build |

## Roadmap from repository start to planned final version

### Phase 0 — Project initialization and design lock
**Status: Complete**

- Initialize NetWorth repository and project identity.
- Establish MOSAIC as the game identity.
- Define browser-first delivery.
- Create initial visual direction, asset register and production roadmap.
- Replace the original street-block-first concept with the top-down world map.

**Exit criteria:** project identity, target presentation and initial documentation are consistent.

### Phase 1 — Aurel world and map foundation
**Status: In progress**

- Establish fictional geography, continents, regions and cities.
- Build world-map navigation and city inspection.
- Move route geometry, resource sites and city industry profiles into structured data.
- Validate references and coordinate records.
- Complete region and city zoom levels.
- Add proper map layers, legends, clustering and keyboard/touch behavior.

**Exit criteria:** map content is data-driven, validated and navigable across world, region and city scales.

### Phase 2 — Simulation architecture and accounting core
**Status: Complete · Core contracts and automated verification implemented**

- [x] Define a versioned canonical game-state root and stable save identifier (schema v2).
- [x] Define simulation tick, pause state, deterministic date advancement and stable system phase ordering.
- [x] Implement integer-minor-unit money utilities for LU (100 minor units per LU), including safe-integer overflow rejection.
- [x] Implement a domain-only double-entry ledger with asset, liability, equity, income and expense accounts.
- [x] Validate complete transactions before posting; reject unbalanced, mixed-currency, duplicate-ID, invalid-account and invalid-reversal entries atomically.
- [x] Add account hierarchy validation, normal-balance calculations, per-currency trial balance and transaction audit history.
- [x] Support explicit immutable reversals and ledger snapshot export/import with replay validation.
- [x] Add deterministic seeded random draws with explicit random-call counters.
- [x] Add a deterministic simulation scheduler with fixed phases, stable system ordering and ordered future-event processing.
- [x] Add a scheduled-event replay journal that reproduces a run from a known baseline.
- [x] Add versioned JSON save serialization, schema v1-to-v2 migration and corruption-detection checksum.
- [x] Add automated tests for money, transfers, purchases, income, expenses, debt, hierarchy, reconciliation, reversals, snapshots, migrations, checksums, PRNG, tick ordering, events and replay.
- [x] Keep simulation modules independent of DOM and rendering code.

**Exit criteria met:** financial transactions are integer-based, balanced, auditable and reversible; account balances reconcile through a trial balance; the scheduler has explicit deterministic ordering; seeded randomness and scheduled-event replay are defined; and saves have versioned serialization and migration handling.

**Boundary:** the replay journal records scheduled simulation events and requires deterministic system/event handlers. It is not a server-side anti-cheat system or a cryptographic proof of execution. The save checksum detects accidental corruption; it is not a security signature. Future multiplayer/server-authoritative requirements would need a trusted execution and signing model.

### Phase 3 — Player, household and life simulation
**Status: Initial foundation implemented · Scenario and household lifecycle**

- [x] Add three integrated, data-driven starting scenarios combining cash, employment, household members, liabilities, housing and living costs.
- [x] Create a balanced opening financial position through the Phase 2 double-entry ledger.
- [x] Add household budget projection and ledger-backed monthly income/obligation settlement.
- [x] Track debt principal reduction and prevent duplicate or out-of-order monthly settlement.
- [x] Add automated tests for scenario integrity, opening reconciliation, net worth, budget, settlement and unemployment cash shortfall.
- [ ] Add player needs, wellbeing, skills, career progression and richer life events.
- [ ] Add payroll funding, interest, taxes, benefits, multiple earners and full asset valuation.

**Exit criteria:** initial scenario, household and monthly cash flow foundations are implemented and tested. Full life progression remains in progress.

### Phase 4 — City, property and NPC foundation
**Status: Not started**

- Meridian city boundary and seven district footprints.
- Land parcels and property records.
- Residential, commercial, industrial and civic zoning.
- NPC households, workers, owners and consumers.
- Population, migration and demographic updates.
- Property ownership, rent, occupancy and valuation.
- Local infrastructure and public services.

**Exit criteria:** Meridian contains a functioning population and property environment rather than static markers.

### Phase 5 — Employment and business economy
**Status: Not started**

- Employer and employee entities.
- Job roles, skills, vacancies, wages and payroll.
- Business registration and ownership.
- Startup capital, operating costs and revenue.
- Inventory, inputs, production and sales.
- Pricing, competition and demand.
- Business profitability, liquidity and failure.
- Supplier and customer relationships.

**Exit criteria:** households earn wages, businesses produce and sell goods/services, and money flows through the shared ledger.

### Phase 6 — Banking, credit, investment and real estate
**Status: Not started**

- Bank accounts and deposit products.
- Lending, underwriting, interest and amortization.
- Creditworthiness and default.
- Investments, returns, volatility and portfolio accounting.
- Property acquisition, mortgage, rent and maintenance.
- Asset valuation and realized/unrealized gains.

**Exit criteria:** financial institutions and asset markets operate using the same accounting foundation.

### Phase 7 — Markets, logistics and intercity trade
**Status: Not started**

- Goods and commodity definitions.
- Regional production and consumption.
- Inventory and stock constraints.
- Trade route capacity, cost and travel time.
- Freight, shipping, tariffs and customs.
- Supply/demand price formation.
- Route disruption and shortages.

**Exit criteria:** Aurel's cities and regions exchange goods through simulated networks, not just decorative route lines.

### Phase 8 — Government and public economy
**Status: Not started**

- Administrative entities and public budgets.
- Income, corporate, property and consumption taxes.
- Public payroll and procurement.
- Infrastructure investment and maintenance.
- Public services and benefits.
- Regulation, subsidies and policy changes.
- Government debt and fiscal sustainability.

**Exit criteria:** government actions have measurable and traceable effects on households and businesses.

### Phase 9 — Macroeconomics, geopolitics and world events
**Status: Not started**

- Inflation and purchasing power.
- Economic growth, unemployment and recessions.
- Interest-rate and monetary policy.
- Business cycles and confidence.
- International trade shocks.
- Energy, food and commodity shocks.
- Natural disasters, political instability and conflict.
- Fraud, legal disputes and financial crises.

**Exit criteria:** macroeconomic events propagate through the economy and create understandable consequences.

### Phase 10 — Family, inheritance and long-term legacy
**Status: Not started**

- Family obligations and shared finances.
- Dependents and life-stage transitions.
- Estate planning and inheritance.
- Asset transfers and succession.
- Wealth preservation and intergenerational outcomes.
- Long-term goals and legacy scoring.

**Exit criteria:** the simulation supports long-horizon financial and family decisions.

### Phase 11 — Complete gameplay, progression and presentation
**Status: Not started**

- Player onboarding and tutorial.
- Objectives, milestones and optional challenges.
- Simulation speed and pause controls.
- News, alerts, notifications and event explanations.
- Finance, life, business, property and market dashboards.
- Accessibility, localization and responsive UI.
- Save slots, autosave and recovery.
- Balance, pacing and difficulty options.

**Exit criteria:** a new player can start, understand, play, save, resume and complete meaningful long-term goals.

### Phase 12 — Expansion, optimization and release
**Status: Not started**

- Expand beyond Meridian to the other Aurel cities.
- Add regional and international governance depth.
- Optimize simulation ticks, rendering and storage.
- Add deterministic replay and regression testing.
- Add content/data migration and backup recovery.
- Security, privacy and browser compatibility review.
- Performance gates for mid-range mobile devices.
- Release packaging, documentation and versioning.

**Exit criteria:** a stable, maintainable browser game with a persistent world and extensible simulation.

## Implementation principles

1. **One source of truth:** world and simulation data must not be duplicated in HTML or rendering code.
2. **Ledger-first finance:** every money movement must be traceable and balanced.
3. **Deterministic simulation:** same state, inputs and random seed should reproduce the same outcomes.
4. **Data-driven world:** cities, regions, resources, routes, properties and businesses must be records, not hardcoded visual elements.
5. **UI is not the engine:** rendering must display simulation state, never invent or mutate economic truth.
6. **Depth before breadth:** make Meridian work end-to-end before activating every world region.
7. **Test each dependency:** a phase cannot be called complete because its screens exist; its exit criteria and validation tests must pass.

## Immediate next milestone

After the world-map data foundation, implement **Phase 2 — Simulation Architecture and Accounting Core**. Do not add business, banking or household gameplay until the ledger and transaction invariants are tested.
