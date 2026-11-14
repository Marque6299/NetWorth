# MOSAIC — Visual Production Roadmap

## Phase 0 — World-map visual lock

**Goal:** Confirm the top-down map language and navigation hierarchy before creating a large asset library.

Deliverables:
- Top-down fictional world map style anchor.
- World geography and biome palette.
- Map projection and camera behavior specification.
- Zoom hierarchy: World → Region → City → District / Property.
- City, resource, route, event, and ownership marker family.
- Management HUD and map-layer control mockup.
- Desktop and mobile readability review.

**Exit criteria:** The map reads as a true top-down orthographic view; geography and markers remain clear at multiple scales; the HUD does not overwhelm the map.

## Phase 1 — World geography foundation

**Goal:** Build the first navigable map of Aurel.

Deliverables:
- Ocean, coast, landmass, island, river, mountain, and biome layers.
- Region/province boundaries.
- Major road, rail, shipping, and trade corridors.
- World and region map labels.
- Meridian starter-city marker and selected-location state.
- Pan, zoom, recenter, and search interactions.

**Exit criteria:** Aurel can be explored as a coherent world map, with location markers anchored to stable geographic coordinates.

## Phase 2 — Economic and simulation overlays

**Goal:** Make the map communicate the living economy.

Deliverables:
- Population and urbanization overlay.
- GDP / prosperity / employment overlays.
- Resource nodes and production regions.
- Infrastructure and logistics overlays.
- Player ownership and business markers.
- Regional risk, crisis, and event markers.
- Layer legend, filters, and selected-entity panels.

**Exit criteria:** The player can understand where economic activity occurs and inspect the causes of regional differences.

## Phase 3 — City and district detail

**Goal:** Let players zoom from strategy to local management.

Deliverables:
- City boundaries and district footprints.
- Road hierarchy and zoning/land-use colors.
- Residential, commercial, industrial, civic, and mixed-use markers.
- Property and business lots.
- Optional stylized character/building sprites for selected close-up locations.

**Exit criteria:** City-level information is detailed enough for property and business decisions without replacing the world map as the primary navigation surface.

## Phase 4 — Gameplay feedback and world events

**Goal:** Make simulation changes visible geographically.

Deliverables:
- New construction and upgrades.
- Business open/closed and production states.
- Supply shortages and price changes.
- Traffic, shipping, and logistics disruption.
- Natural disasters, political events, and regional crises.
- News, notifications, and route alerts.

**Exit criteria:** Important simulation events can be located and understood from the map.

## Phase 5 — Polish and optimization

**Goal:** Prepare a consistent, performant map asset pipeline.

Deliverables:
- Tile/chunk or vector-layer optimization.
- Level-of-detail and marker clustering.
- Lazy loading and caching.
- Reduced-motion and accessibility review.
- Mobile pan/zoom performance review.
- Asset manifest validation and unused-asset audit.

**Exit criteria:** Smooth navigation and acceptable load/render performance on mid-range mobile devices.

## Recommended first production task

Create the **Aurel World Map Art Test** and a minimal interactive map canvas before producing detailed building or character assets. The old Meridian Street Block concept is superseded as the primary view; it can later inform an optional close-up city/district view.
