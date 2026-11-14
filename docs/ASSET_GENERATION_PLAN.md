# Aurel World Map — First Asset Generation Plan

**Project:** NetWorth / MOSAIC  
**Milestone:** Visual Prototype 02  
**Direction:** Top-down orthographic world map / stylized 2D markers / management dashboard

## 1. Production strategy

Generate the world map as a visual style anchor, then separate its visual vocabulary into modular layers. Do not use one flattened generated image as the final interactive map. Geography may begin as a single reference image, but labels, routes, markers, overlays, selection states, and simulation values must be rendered independently.

Every asset must match:
- True top-down orthographic view.
- Fictional geography and consistent world proportions.
- Agreed terrain palette and texture density.
- Marker size and visual language at each zoom level.
- UI semantic colors and accessibility rules.

## 2. Generation order

### Batch 0 — World-map style anchor
Create:
1. Aurel world map concept, without UI.
2. Terrain/biome palette sheet.
3. Map symbol and route style sheet.
4. One zoom comparison: world, region, city.

Deliverables:
- `art-source/concepts/aurel-world-style-anchor.png`
- `art-source/concepts/aurel-terrain-palette.png`
- `art-source/concepts/aurel-map-symbols.png`
- `art-source/concepts/aurel-zoom-hierarchy.png`

Approval gate:
- Clearly top-down, not tilted or isometric.
- Fictional, coherent landmasses and coastlines.
- Readable at desktop and mobile scale.
- Calm enough to support data overlays.

### Batch 1 — Base geography
Create layered terrain references:
- Ocean and coastal shallows.
- Main landmasses and islands.
- Rivers, lakes, and wetlands.
- Mountain chains and highlands.
- Forest, grassland, agricultural, arid, and cold biomes.

Keep borders, labels, cities, routes, and data overlays out of the base terrain artwork.

### Batch 2 — Map marker family
Create consistent symbols for:
- Capital, major city, town, village.
- Port, airport, rail hub, highway interchange.
- Farm, mine, energy site, industrial zone.
- Market, bank, university, government institution.
- Player-owned home, property, business, company.
- News, crisis, opportunity, mission.

Prefer clean SVGs with variants for selected, inactive, alert, and player-owned states.

### Batch 3 — Transport and trade routes
Create style references for:
- Major highway and local road.
- Railway and freight corridor.
- Shipping lane.
- Air route.
- Trade flow direction and disruption states.

Routes should be rendered as vector paths from data, not baked into terrain art.

### Batch 4 — City and district detail
Create a top-down city map reference with:
- City boundary and district footprints.
- Main roads, secondary roads, rail, and waterways.
- Land-use regions: residential, commercial, industrial, civic, green space.
- Named districts and a few notable locations.

Detailed building sprites are optional and belong to a later close-up layer, not the world map.

### Batch 5 — Management UI kit
Create SVG icon family for:
- Wallet, cash, net worth, debt, savings.
- Population, employment, GDP, inflation.
- Resources, logistics, transport.
- Home, property, business, market, bank.
- Research, family, health, education.
- News, alert, opportunity, crisis.
- World, region, city, district, map layers.

### Batch 6 — Interactive map assembly
Build the map with separate layers:
1. Ocean and base terrain.
2. Biome and relief details.
3. Rivers and lakes.
4. Administrative boundaries.
5. Roads, rail, shipping, and trade routes.
6. Cities and points of interest.
7. Resource and event markers.
8. Economic/population/ownership overlays.
9. Selection, hover, and route highlights.
10. HUD and inspector panels.

## 3. Prompt templates

### A. Aurel world-map style anchor
"Create an original fictional world map for a polished top-down strategy and life-economy simulation game. Strict orthographic overhead view, like a beautifully illustrated strategy-game atlas. Show several distinctive continents, archipelagos, mountain chains, river basins, lakes, varied coastlines, forests, grasslands, agricultural plains, arid zones, and cold northern terrain. Use a refined, readable terrain palette: deep blue and teal oceans, layered natural greens, muted ochres and sandstone deserts, slate mountain ranges, pale cool highlands. Subtle relief shading is allowed but the camera must remain perfectly top-down; no visible building side faces, no isometric perspective, no tilted horizon, no satellite-photo realism. Fictional geography, balanced negative space for future city markers and route overlays. No labels, no UI, no icons, no borders, no text. Crisp, cohesive, moderately detailed game map art."

### B. Terrain/biome sheet
"Create a top-down orthographic terrain reference sheet for a fictional strategy simulation world. Show clearly separated samples of ocean, coast, beach, river, lake, grassland, forest, farmland, wetland, desert, rocky highlands, and snowy mountain terrain. Consistent overhead camera, cohesive painterly/vector-like texture, controlled detail, no perspective, no labels, no text, no UI."

### C. Map marker family
"Create a cohesive set of simple, legible top-down strategy-game map symbols for [MARKER TYPES]. Each symbol must have a clear silhouette, consistent line weight, balanced negative space, and variants for selected and alert states. Flat vector/SVG-friendly design, transparent background, no words, no emoji, no perspective, no drop-shadow clutter. Designed to remain readable at small map sizes."

### D. Route style sheet
"Create a clean vector-style map route design reference for a top-down strategy simulation: major highway, secondary road, railway, shipping lane, air route, active trade flow, and disrupted route. Show each as a separate sample with distinct line weight, dash pattern, and direction treatment. No geographic background, no labels, no UI, no perspective."

### E. City/district zoom reference
"Create a strictly top-down orthographic map of a fictional modern city for a strategy life-and-economy simulation. Show a clear city boundary, named-district placeholder areas without text, a hierarchy of roads, a rail line, a river, residential/commercial/industrial/civic/green land-use zones, and a few major institutions as simple top-down symbols. No isometric buildings, no visible vertical facades, no oblique camera, no street-level view, no UI text. Clean readable map design."

## 4. Asset manifest and file hygiene

Register every accepted asset in `assets/manifest/asset-manifest.json` (or CSV during early production).

Suggested fields:
- `id`
- `name`
- `category`
- `source`
- `license`
- `sourceFile`
- `runtimeFile`
- `width`, `height`
- `projection` (top-down-orthographic, vector, or UI)
- `minZoom`, `maxZoom`
- `anchor`
- `status`
- `notes`

Rules:
- Keep original generated sources in `art-source/`.
- Keep optimized runtime assets in `assets/`.
- Do not overwrite approved source versions.
- Store prompts and reference IDs alongside source.
- Keep labels, routes, markers, and dynamic overlays separate from terrain.
- Record license/source for every external asset.
- Never add unchecked art to runtime.

## 5. Technical validation

Before accepting:
- Confirm top-down projection (no oblique camera).
- Check that no text or UI has been baked into base geography.
- Confirm alpha transparency for isolated markers.
- Check small-size readability.
- Verify line and symbol contrast over all biome colors.
- Test overlays in both light and dark regions.
- Confirm marker anchors and normalized map coordinates.
- Optimize and test at desktop and mobile sizes.

## 6. First milestone completion criteria

- One approved Aurel world map base.
- A coherent terrain/biome palette.
- A marker set for cities, transport, resources, ownership, and events.
- A route style family.
- Meridian selected in a sample management HUD.
- A demonstrated world-to-region-to-city zoom hierarchy.
- A functional map prototype that renders interactive data separately from the base art.
