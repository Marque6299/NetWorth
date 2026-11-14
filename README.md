# NetWorth — MOSAIC Life & Economy Sandbox

NetWorth is the development repository for **MOSAIC**, an original browser-based life, finance, and economy simulation.

## Current prototype

The initial playable vertical slice is built with vanilla HTML, CSS, and JavaScript. It includes personal needs, employment, a goods market, banking, loans, equities, a starter microbusiness, basic NPC household behavior, macroeconomic indicators, news, and local save/export.

## Project identity

- **Game:** MOSAIC
- **Repository / working project name:** NetWorth
- **World:** Aurel
- **Starter city:** Meridian
- **Currency:** Luma (LU)
- **Visual direction:** Stylized 2D isometric city simulation paired with a readable management dashboard
- **Platform target:** Browser-first, responsive desktop and mobile web

## Documentation

- [Art direction](docs/ART_DIRECTION.md)
- [Asset register](docs/ASSET_REGISTER.md)
- [Visual production roadmap](docs/VISUAL_ROADMAP.md)

## Development principles

1. Keep the economy simulation deterministic and authoritative in code; visuals must never determine financial outcomes.
2. Prefer reusable modular assets over one-off illustrations.
3. Establish a coherent visual language before mass-producing assets.
4. Use original fictional brands, signage, characters, architecture, and UI.
5. Optimize for browser performance, responsive layouts, and graceful fallback when optional assets fail to load.

## Running the prototype

Open `index.html` in a modern browser, or serve the project folder with a local static server such as `python -m http.server 8080`.

All in-game names, companies, prices, and financial data are fictional. No real money is used.
