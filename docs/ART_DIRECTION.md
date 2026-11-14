# MOSAIC / NetWorth — Initial Art Direction

**Status:** Locked baseline 1.0 — approved visual direction  
**Purpose:** Define the visual identity and production rules before creating final game art.

## 1. Locked visual decisions

- **Perspective:** 2D isometric.
- **Characters:** Stylized 2D characters.
- **Gameplay presentation:** Hybrid city viewport + management dashboard.
- **First scene:** Meridian Street Block.

See [Meridian Street Block Specification](MERIDIAN_STREET_BLOCK_SPEC.md) and [First Asset Generation Plan](ASSET_GENERATION_PLAN.md) for production details.

## 2. Core visual concept

A **stylized 2D isometric life-and-economy simulation**. The player should feel that they are building a life inside a living city, while the interface makes money, needs, work, businesses, and economic cause-and-effect easy to understand.

The target is a warm, believable, slightly optimistic modern city—not a hyper-realistic financial terminal and not a childish cartoon.

### Visual pillars

- **Readable at a glance:** important resources, prices, needs, and alerts must be immediately understandable.
- **Lived-in city:** streets, homes, shops, workplaces, transit, parks, and public services should imply a connected society.
- **Human scale:** NPCs and businesses should feel like part of a community, not just spreadsheet rows.
- **Economic clarity:** positive, negative, warning, and neutral states use consistent colors and iconography.
- **Expandable production:** buildings, people, props, and UI elements should be modular and recombinable.

## 3. Recommended art style

- 2D isometric / 3-quarter top-down perspective for the city layer.
- Clean geometric silhouettes with subtly softened corners.
- Moderately simplified forms; avoid excessive micro-detail.
- Soft ambient shadows and restrained highlights.
- Painted or vector-like surfaces with a small amount of texture.
- Consistent light direction (top-left) and consistent isometric grid.
- Characters use readable silhouettes, clear clothing palettes, and simple expressive poses.

**Avoid:** photorealism, heavy pixel-art constraints, extreme outlines, noisy textures, tiny unreadable signage, and mixing unrelated asset styles.

## 4. World identity

| Element | Direction |
|---|---|
| World | Aurel |
| Starter city | Meridian |
| Currency | Luma (LU) |
| City mood | Growing regional city; modern mixed-use center with older neighborhoods |
| Architecture | Contemporary mid-rise blocks, low-rise homes, local retail, civic buildings, light industrial sites |
| Environment | Tropical/coastal influence may be explored, but should remain fictional and not copy a real city |
| Brand tone | Thoughtful, grounded, approachable, systems-oriented |

## 5. Color language

Use the existing dark management UI as a temporary prototype baseline, but establish separate palettes for the world map and interface.

### World palette (starting proposal)

- Deep slate / blue-grey for roads, shadows, and structural contrast.
- Warm concrete, sandstone, muted terracotta, and pale plaster for buildings.
- Sage, deep green, and turquoise for vegetation and water.
- Controlled accents of amber, coral, and cyan for signs, vehicles, and points of interest.

### UI semantic colors

- Positive / growth: mint or green.
- Information / neutral: blue.
- Caution / volatility: amber.
- Negative / loss / crisis: coral-red.
- Premium / long-term assets: restrained violet or gold.

Do not rely on color alone: pair states with labels, icons, arrows, or patterns for accessibility.

## 6. Camera and world presentation

- Fixed isometric camera for the first city scene.
- Modular tile or chunk-based map, with clear road and sidewalk hierarchy.
- Buildings occupy consistent footprints and snap to the same grid.
- Camera pan and zoom can be considered after the first static scene is validated.
- Keep the active play area visually calm; reserve high-detail backgrounds for non-interactive distant scenery.

## 7. Character direction

Create a small reusable character system rather than unique art for every NPC.

Initial modular parts:
- Body / base silhouette
- Skin-tone variants
- Hair styles
- Tops and bottoms
- Workwear / casual / formal outfit sets
- Accessories (bag, cap, glasses, tools)
- Idle, walk, work, shop, and conversation poses

Represent NPC identity primarily through silhouette, clothing, color grouping, role, and a small number of distinguishing features. Avoid making every character depend on bespoke portrait art.

## 8. UI direction

The existing dashboard can evolve into a more polished hybrid of:
- City view as the main visual anchor.
- Persistent top strip for date, cash, time controls, and alerts.
- Context panel for selected person, building, business, or market.
- Bottom or side navigation for Life, Work, Finance, Market, Business, Investments, and World.
- Charts and tables for economic information, with plain-language explanations.

Keep financial data dense but legible. Use progressive disclosure: show the key decision first, with detailed breakdowns one click deeper.

## 9. Asset technical standards

Initial target standards (to validate in the first art test):
- World/building assets: transparent PNG or WebP; source files retained in SVG or layered format where possible.
- UI icons: SVG preferred.
- Character sprites: transparent PNG/WebP sprite sheets with documented frame dimensions and pivot points.
- UI illustrations: SVG or WebP.
- Texture atlases: only where batching or loading efficiency benefits.
- Use 2x source resolution for UI raster assets where practical.
- Define a naming convention and metadata for every reusable asset.

Do not commit large unoptimized source exports into the runtime asset directory. Keep editable source and optimized runtime output separate.

## 10. Accessibility and performance

- Maintain text contrast and readable type sizes.
- Never communicate status by color alone.
- Provide reduced-motion behavior for animated UI.
- Lazy-load non-critical scene art.
- Use sprite atlases or shared textures only when they improve loading and rendering.
- Provide placeholder/fallback visuals if an asset is missing.
- Keep the initial asset bundle small enough for a fast first load on mobile networks.

## 11. First art validation milestone

Before producing a full city, create one cohesive visual test containing:
1. One small isometric street block.
2. One residential building.
3. One convenience shop.
4. One office/workplace.
5. Three character variants.
6. A small set of trees, streetlights, road markings, and street props.
7. One UI mock showing the city with a selected building and player status.

Approve perspective, scale, palette, detail density, and readability before expanding the asset library.
