# Aurel World Map — Visual & Interaction Specification

**Project:** NetWorth / MOSAIC  
**Milestone:** Visual Prototype 02  
**Status:** New primary view specification  
**Revision:** 1.0

## 1. Purpose

The primary gameplay surface is a navigable top-down map of Aurel. It must support the game's broad simulation scope: population, cities, employment, resources, trade, infrastructure, property, business ownership, regional economics, politics, and world events.

This is not a decorative map image. It is a layered interactive surface whose entities are backed by simulation data.

## 2. Locked presentation decisions

| Decision | Locked choice |
|---|---|
| Camera | True top-down / orthographic |
| Default view | Full world map |
| Characters | Stylized 2D; mostly abstracted at world scale |
| Main presentation | World map + management dashboard |
| Navigation | World → Region → City → District → Property |
| World | Aurel |
| Starter city | Meridian |
| Currency | Luma (LU) |

Do not use isometric street blocks as the default view. The previous street-block specification is retained only as a possible future close-up reference.

## 3. Geography and composition

Design an original fictional world, not a direct copy of Earth. It should include:
- 3–5 major landmasses with distinctive coastlines.
- An archipelago and several smaller islands.
- Mountain chains and highlands.
- Major river basins and inland lakes.
- Temperate, tropical, arid, and cold regions.
- Several navigable coastal areas and natural harbors.
- Space for 12–20 major cities and many smaller settlements as the world expands.

The initial playable prototype should populate only a subset. Avoid filling every region with labels or markers.

## 4. Zoom levels and content

### Level 1 — World
Show:
- Continents, oceans, major biomes.
- Major city/region markers.
- International shipping and trade routes.
- Resource/event markers of global significance.
- Macro indicators and selected world events.

Hide:
- Individual buildings, streets, people, and small businesses.

### Level 2 — Region
Show:
- Region/province boundaries.
- Major cities and smaller settlements.
- Highways, railways, ports, airports, shipping lanes.
- Resource extraction and production areas.
- Regional economic overlays and event markers.

### Level 3 — City
Show:
- City boundary and named districts.
- Road network and transport nodes.
- Land-use zones and major institutions.
- Business clusters and real-estate activity.
- City-level population and economic indicators.

### Level 4 — District / property
Show:
- Individual lots and properties.
- Homes, businesses, civic services, and infrastructure.
- Ownership, rent, value, occupancy, and upgrade states.
- Optional stylized characters and selected building illustrations.

## 5. Map layers

Layers must be independently switchable and have a clear legend.

Initial layers:
1. **Base geography:** terrain, water, rivers, coastline, elevation.
2. **Political / administrative:** world regions and city boundaries.
3. **Settlements:** cities, towns, villages.
4. **Transport:** roads, rail, ports, airports, shipping routes.
5. **Economy:** GDP, prosperity, employment, inflation, cost of living.
6. **Population:** density, growth, migration.
7. **Resources:** agriculture, energy, minerals, timber, fisheries.
8. **Ownership:** player homes, properties, businesses, infrastructure stakes.
9. **Risk / events:** disasters, conflict, instability, shortages, disruptions.

Only a few overlays should be visible at once. Base geography remains visible beneath all thematic overlays.

## 6. Marker system

Create a consistent family of map symbols:
- Capital / major city / town / village.
- Port / airport / rail hub / highway interchange.
- Farm / mine / energy site / industrial zone.
- Market / bank / university / government institution.
- Player-owned property / business / company.
- News / crisis / opportunity / active mission.

Markers must scale by zoom level, cluster when crowded, and avoid overlapping important labels. Selected markers get a clear outline or halo plus a persistent side-panel summary. Do not use emoji as the final marker art.

## 7. Routes and networks

- Road and rail networks use distinct line weights and patterns.
- Shipping routes are curved or segmented dashed lines over water.
- Trade corridors show direction only when a flow overlay is enabled.
- Active player routes are highlighted without hiding other networks.
- Disrupted routes use warning patterns and a linked event marker.
- Routes must connect to valid ports, stations, cities, and production nodes.

## 8. Meridian starter location

Meridian is the first city the player can inspect and develop. At world zoom it appears as a prominent settlement marker, with a compact information card when selected.

Suggested initial information:
- Population and growth.
- GDP / economic output.
- Unemployment.
- Cost of living / inflation.
- Dominant industries.
- Infrastructure quality.
- Regional links and nearby resources.

Selecting Meridian transitions to its region/city view, not directly into a street-level scene. The first city view should be a top-down district map with named neighborhoods and land-use areas.

## 9. HUD and layout

### Desktop
- **Top bar:** date, simulation speed, cash, net worth, alerts.
- **Main canvas:** world map, occupying the majority of available space.
- **Left or right inspector:** selected location/entity and its key metrics.
- **Map controls:** layer toggle, legend, zoom, recenter, search.
- **Bottom navigation:** World, Life, Finance, Markets, Businesses, Real Estate, Research, Family.
- **Optional ticker:** concise news and economic events.

### Mobile
- Map fills the main screen.
- Compact top strip for date, speed, and cash.
- Inspector opens as a bottom sheet.
- Layer controls live in a collapsible drawer.
- Large touch targets for map markers.
- Pan and pinch zoom must not conflict with tapping markers.

## 10. Interaction requirements

- Pan by drag / touch.
- Zoom by wheel, buttons, or pinch.
- Recenter to world / selected location.
- Search and jump to a city, region, business, or asset.
- Select markers and routes to open context panels.
- Toggle map layers and filters.
- Cluster dense markers and expand them on zoom.
- Preserve selected entity when opening/closing panels.
- Provide keyboard navigation and visible focus states where practical.

## 11. Technical architecture guidance

Keep simulation data separate from visual rendering.

Suggested entity records:
- Stable entity ID.
- Entity type and parent region/city.
- Geographic coordinates in the fictional world coordinate system.
- Current simulation metrics.
- Ownership / status.
- Visibility rules by zoom level.
- Marker/icon key.

Rendering should use layered vector or Canvas drawing for map features and DOM/SVG overlays for interactive markers and panels. Do not bake dynamic values, labels, routes, or selection states into a single background image.

Use normalized world coordinates so the world can be resized and rendered at different viewport sizes. The initial implementation can use a deliberately bounded fictional map coordinate plane; a geospatial library is not required for the first prototype.

## 12. First art-generation batch

1. Aurel world-map style anchor (no UI text).
2. Clean base geography map with land, water, mountains, rivers, and biomes.
3. Map symbol family for cities, ports, resources, and events.
4. Route style sheet for roads, rail, shipping, and trade.
5. HUD mockup showing Meridian selected.
6. Region/city zoom example to demonstrate progressive detail.

Keep all source art separate from interactive map layers.

## 13. Acceptance criteria

- The view reads immediately as top-down, not isometric or tilted.
- The map contains coherent fictional geography.
- Meridian is easy to find and identify.
- Cities, resources, routes, and events have distinct visual languages.
- Overlays remain readable and do not obscure base geography.
- Zoom levels reveal appropriate detail without abrupt visual jumps.
- The map remains the dominant interface element on desktop and mobile.
- All interactive map elements can be rendered from structured data.
