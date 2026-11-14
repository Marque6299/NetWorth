# MOSAIC / NetWorth — Art Direction

**Status:** Locked baseline 2.0 — top-down world map  
**Purpose:** Define the visual identity and production rules for the world-map-first game presentation.

## 1. Locked visual decisions

- **Primary perspective:** 2D top-down / orthographic world map. No isometric street scene as the default gameplay view.
- **Characters:** Stylized 2D characters, used as map-scale markers and in optional close-up location views.
- **Gameplay presentation:** World map + management dashboard.
- **Primary navigation hierarchy:** World → Region → City → District → Property / business.
- **World:** Aurel.
- **Starter city:** Meridian.
- **Currency:** Luma (LU).

The previous Meridian Street Block concept is superseded as the primary visual direction. It may be reused later as an optional close-up city/district view, but it is not the main game camera.

## 2. Core visual concept

MOSAIC is a persistent life-and-economy sandbox viewed through a navigable map of Aurel. The player can inspect regions, cities, economic activity, resources, transport links, ownership, and events from a broad strategic view, then zoom into progressively more detailed local maps.

The world map is the main playable surface—not a decorative background. Locations, routes, borders, markets, resource nodes, and events should be represented as distinct interactive layers.

### Visual pillars

- **Strategic readability:** geography and economic relationships are understandable at a glance.
- **Living world:** cities, ports, farms, industrial zones, transport corridors, and natural resources suggest a connected society.
- **Economic clarity:** overlays communicate population, prosperity, employment, prices, ownership, supply chains, and risk.
- **Progressive detail:** zooming reveals more detail without changing the visual language.
- **Expandable geography:** new regions and cities can be added without redesigning the entire map.
- **Modular rendering:** map terrain, roads, labels, markers, routes, and UI remain separate layers.

## 3. Map art style

- True top-down / orthographic projection; avoid tilted perspective and isometric building faces.
- Stylized, polished strategy-simulation map with readable landforms and coastlines.
- Clean regional shapes, controlled texture, and clear biome differentiation.
- Subtle relief shading is acceptable, but must not make the camera appear oblique.
- Cities are indicated by compact skyline/settlement symbols at world zoom; detailed buildings appear only at city/district zoom.
- Roads, railways, shipping lanes, and trade corridors use consistent line styles.
- Water, terrain, borders, and overlays must remain distinguishable at multiple zoom levels.
- Use a fictional geography; do not trace a real-world map.

**Avoid:** street-level scenes as the default, isometric building clusters, photorealistic satellite imagery, excessive labels, noisy terrain textures, and decorative details that compete with map information.

## 4. World identity and geography

| Element | Direction |
|---|---|
| World | Aurel |
| Starter city | Meridian |
| Currency | Luma (LU) |
| Geography | Fictional continents, island chains, inland seas, rivers, mountain ranges, and coastlines |
| Climate | Multiple readable climate/biome zones |
| City mood | Growing regional economy with mixed urban, rural, coastal, and industrial areas |
| Brand tone | Thoughtful, grounded, approachable, systems-oriented |

The world map should be designed for gameplay systems: resource distribution, population centers, trade routes, infrastructure, government, regional events, and economic shocks.

## 5. Color language

### Base map palette
- Ocean: deep blue and teal, with restrained bathymetric variation.
- Lowlands: varied greens and muted agricultural tones.
- Forests: deeper layered greens.
- Arid regions: sand, ochre, and muted rust.
- Mountains: slate, stone, and cool grey.
- Snow / highlands: pale cool neutrals.
- Urban areas: restrained warm grey and sandstone settlement footprints.

### Strategic overlay palette
- Growth / positive: mint or green.
- Information / selected: cyan or blue.
- Warning / volatility: amber.
- Negative / loss / crisis: coral-red.
- Ownership / player assets: violet or gold accent.
- Neutral infrastructure: pale blue-grey.

Never rely on color alone. Pair overlays with patterns, labels, icons, outlines, or directional indicators.

## 6. Camera, zoom, and navigation

The map uses a true top-down orthographic camera.

### Zoom hierarchy
1. **World zoom:** continents, oceans, major regions, international routes, macroeconomic events.
2. **Region zoom:** countries/provinces, major cities, resource areas, ports, rail and highway corridors.
3. **City zoom:** city boundaries, districts, major roads, services, commercial and residential zones.
4. **District/property zoom:** individual lots, businesses, homes, infrastructure, and local interactions.

The transition between zoom levels should be intentional:
- Labels and markers appear/disappear by scale.
- Generalized roads become detailed networks.
- City markers expand into district footprints.
- Economic overlays retain meaning and update aggregation level.
- Avoid abrupt changes in geography or marker placement.

Support pan, zoom, recenter, selected-location focus, and a minimap/overview control. On mobile, provide touch pan and pinch zoom with large tap targets.

## 7. Characters and settlement symbols

At world and region zoom, do not render individual walking characters. Use compact symbols for settlements, institutions, and events. At city/district zoom, stylized 2D characters may appear as small readable figures or activity markers. Detailed character sprites are reserved for optional close-up interactions and should not dictate the world map camera.

## 8. UI direction

Use a polished management dashboard framing the world map:
- Top status bar: date, simulation speed, cash, net worth, alerts.
- Main canvas: interactive world map.
- Side panel: selected region, city, route, resource, property, or event.
- Map layer controls: economy, population, employment, infrastructure, ownership, resources, risk, political boundaries.
- Bottom navigation: World, Life, Finance, Markets, Businesses, Real Estate, Research, Family.
- Search / go-to control for finding cities, companies, resources, and owned assets.
- Optional event ticker and compact market snapshot.

The map must remain visually dominant. Panels should be collapsible and must not permanently obscure critical map areas. On mobile, use collapsible drawers and bottom sheets.

## 9. Asset technical standards

- Map base: layered SVG or tiled raster/Canvas assets; choose based on scale and performance tests.
- Terrain textures: optimized WebP/PNG tiles where needed.
- Roads, borders, routes, selection outlines, and labels: vector layers where practical.
- City and resource markers: SVG preferred.
- UI icons: SVG.
- Optional close-up characters/buildings: transparent PNG/WebP sprites.
- Keep editable sources in `art-source/` and optimized runtime assets in `assets/`.
- Maintain an asset manifest with dimensions, projection, zoom range, anchor, source, license, and approval status.

## 10. Accessibility and performance

- Keep labels legible at supported zoom levels.
- Provide non-color cues for all data overlays.
- Support reduced motion.
- Avoid loading the entire world as one oversized bitmap.
- Use level-of-detail, tile/chunk loading, and layer visibility rules.
- Keep first-load assets small for mobile networks.
- Provide fallback markers and map tiles if optional art fails to load.

## 11. First visual validation milestone

Create a top-down world-map concept and a functional map prototype containing:
1. Fictional continents, coastlines, rivers, mountain ranges, and biome zones.
2. Several regions and a handful of major settlement markers.
3. Meridian as the clearly highlighted starter city.
4. Roads, rail, shipping lanes, and trade routes.
5. A small number of resource nodes and economic event markers.
6. A management HUD with a selected-location panel and map-layer controls.

Approve geography readability, zoom hierarchy, marker language, palette, and UI density before producing detailed city or property art.
