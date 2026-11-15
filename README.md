# NetWorth — MOSAIC Life & Economy Sandbox

NetWorth is the development repository for **MOSAIC**, an original browser-based life, finance, and economy simulation.

## Current world-map prototype

The current browser prototype introduces **Aurel**, a fictional world rendered in a top-down strategic map view. It includes:
- Layered illustrated world geography.
- 12 major city markers with Meridian highlighted as the starter city.
- Trade-route and resource-zone layers.
- City inspector with starter economic indicators.
- Search, pan, zoom, recenter, and map-layer toggles.
- Responsive desktop and mobile management-dashboard layout.

## Project identity

- **Game:** MOSAIC
- **Repository / working project name:** NetWorth
- **World:** Aurel
- **Starter city:** Meridian
- **Currency:** Luma (LU)
- **Visual direction:** Top-down orthographic world map + stylized 2D markers + management dashboard
- **Platform target:** Browser-first, responsive desktop and mobile web

## Simulation foundation (Phase 2)

The first simulation-core modules are available under `js/simulation/`:
- `money.js` — LU values represented as integer minor units (1 LU = 100 minor units).
- `ledger.js` — double-entry accounts, atomic balanced posting, balances, history and reversals.
- `state.js` — versioned root save-state structure, separated from presentation state.
- `clock.js` — pause/resume and deterministic tick/date advancement.
- `random.js` — seeded deterministic random draws with explicit counter state.
- `engine.js` — ordered simulation phases and scheduled event processing.
- `replay.js` — reproducible scheduled-event replay from a baseline save.
- `persistence.js` — versioned save serialization, migration and corruption checksum.

The ledger also supports account hierarchy, trial-balance reconciliation, explicit reversals and validated snapshot restore. The current save schema is v2.

Run the automated tests with Node.js 18 or newer:

```bash
npm test
```

Run world-data validation with:

```bash
npm run validate:world
```

See [Simulation Architecture](docs/SIMULATION_ARCHITECTURE.md) for accounting conventions and current boundaries.

## Documentation

- [Art direction](docs/ART_DIRECTION.md)
- [World map specification](docs/WORLD_MAP_VIEW_SPEC.md)
- [Aurel world atlas](docs/AUREL_WORLD_ATLAS.md)
- [World map asset plan](docs/ASSET_GENERATION_PLAN.md)
- [Asset register](docs/ASSET_REGISTER.md)
- [Visual production roadmap](docs/VISUAL_ROADMAP.md)

## Implementation roadmap

- [End-to-end implementation roadmap and status](docs/IMPLEMENTATION_ROADMAP.md)

Validate the structured Aurel world data before committing world-data changes:

```bash
node scripts/validate-world-data.js
```

## Run locally

Serve the repository root with a static server (fetching the JSON data requires HTTP):
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`.

The map data is stored in `data/world/aurel-world.json`. The SVG geography is currently a hand-authored prototype illustration; replace/refine its landmass paths as the approved art direction develops.

All in-game names, companies, prices, and financial data are fictional. No real money is used.
