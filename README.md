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

## Documentation

- [Art direction](docs/ART_DIRECTION.md)
- [World map specification](docs/WORLD_MAP_VIEW_SPEC.md)
- [Aurel world atlas](docs/AUREL_WORLD_ATLAS.md)
- [World map asset plan](docs/ASSET_GENERATION_PLAN.md)
- [Asset register](docs/ASSET_REGISTER.md)
- [Visual production roadmap](docs/VISUAL_ROADMAP.md)

## Run locally

Serve the repository root with a static server (fetching the JSON data requires HTTP):
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`.

The map data is stored in `data/world/aurel-world.json`. The SVG geography is currently a hand-authored prototype illustration; replace/refine its landmass paths as the approved art direction develops.

All in-game names, companies, prices, and financial data are fictional. No real money is used.
