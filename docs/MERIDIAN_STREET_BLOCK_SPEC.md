# Meridian Street Block — Art & Scene Specification

**Project:** NetWorth / MOSAIC  
**Milestone:** Visual Prototype 01  
**Status:** Locked direction; production specification  
**Revision:** 1.0

## 1. Locked visual decisions

| Decision | Locked choice |
|---|---|
| World perspective | 2D isometric |
| Character style | Stylized, expressive, human-scale 2D characters |
| Gameplay presentation | Hybrid: interactive city scene + management dashboard |
| World | Aurel |
| Starter city | Meridian |
| Currency | Luma (LU) |
| Art mood | Warm, grounded, contemporary, optimistic without looking childish |

These are the approved baseline choices for the first visual prototype. Changes should be treated as an art-direction revision, not made asset-by-asset.

## 2. Scene objective

Create one compact, recognizable city block that proves the visual language and technical pipeline. It should communicate three parts of the player's life:
- **Home:** where the player lives and manages personal needs.
- **Commerce:** where residents buy everyday goods and where a microbusiness can operate.
- **Work:** where residents earn income and participate in the local economy.

The block is a visual foundation, not a fully simulated city map. Gameplay systems remain authoritative in JavaScript; the scene only visualizes entities and exposes interaction targets.

## 3. Scene composition

### 3.1 Recommended layout

Use a compact diamond-shaped isometric block on a consistent grid. The camera looks from the south-east-facing screen edge toward the north-west horizon (a conventional 2:1 isometric projection). Keep the three primary buildings separated enough that their silhouettes and clickable footprints are unambiguous.

Suggested screen composition:
- **Rear / upper-left:** small office building, slightly taller than the other structures.
- **Rear / upper-right:** apartment building, the player's residential anchor.
- **Front / lower-center:** Meridian Essentials convenience shop, the most visually recognizable storefront.
- **Foreground edges:** road, sidewalk, crossing, street lamps, trees, bench, waste bin, signpost, and one parked delivery vehicle.
- **Open central pavement:** pedestrian circulation and a clear player/NPC staging area.

Avoid a dense city skyline in the first test. The block must remain readable at normal game zoom.

### 3.2 Building requirements

**A. Player residence — Meridian Court**
- Low-rise apartment building, approximately 3–4 visible floors.
- Warm off-white plaster, muted teal or sage accents, terracotta details.
- Repeating windows and balconies; one distinct entrance.
- No legible real-world brands or copied architectural landmarks.
- Optional rooftop water tank / utility detail to establish a lived-in setting.
- Must support visual states later: player-owned/rented, vacant, occupied, selected.

**B. Convenience store — Meridian Essentials**
- Single- or two-storey compact corner shop.
- Clearly visible storefront, awning, entrance, display windows, and a signboard.
- Brand palette: deep teal, warm cream, and restrained amber.
- Store name must be spelled exactly: “MERIDIAN ESSENTIALS”.
- Keep product labels abstract; avoid tiny fake text.
- Must support later states: open, closed, player-owned, shortage, sale/promotion.

**C. Workplace — Meridian Exchange**
- Modern modest office building, approximately 4–5 visible floors.
- Blue-grey glass, pale concrete, restrained green accent.
- Ground-floor lobby and entrance; subtle office signage.
- Avoid looking like a bank or luxury corporate tower.
- Must support later states: hiring, active shift, closed, business activity.

## 4. Isometric geometry and camera rules

Use a true, consistent 2:1 isometric basis:
- One world-grid unit projects to approximately 64 px horizontally and 32 px vertically for the initial reference scale.
- Orthogonal world axes project at approximately +26.565° and -26.565° from horizontal.
- All building bases, sidewalks, props, and characters align to the same projected grid.
- Buildings use a shared ground-plane footprint convention.
- Character feet and object contact points align to the ground plane.
- The visual ground contact / pivot is the bottom-center of each character or prop footprint.
- Sort draw order by ground-plane Y/depth, not by sprite top edge.

The 64×32 unit is a starting design unit, not a requirement that every delivered image be exactly that size. Render assets at a larger source scale and downsample consistently.

### Camera framing
- Fixed isometric camera for the first milestone.
- Show the complete block with a small margin around its edges.
- No perspective convergence, camera roll, or mixed orthographic angles.
- Keep important interactive building entrances visible.
- Reserve a calm margin for UI overlays.

## 5. Environment kit

### Ground and road
Produce seamless modular pieces:
- Grass / planted ground.
- Sidewalk straight, corner, and T-junction pieces.
- Asphalt road straight, corner, T-junction, and crossroad.
- Painted pedestrian crossing.
- Curb transitions and driveway entrance.
- Small plaza / paved open-space tile.

### Props
First pass:
- 3 tree silhouettes (small, medium, broad canopy).
- 2 shrub/planter variants.
- 1 street lamp.
- 1 bench.
- 1 public waste bin.
- 1 bus-stop or route sign.
- 1 street-name sign.
- 1 small utility cabinet.
- 1 parked compact car.
- 1 delivery van.
- 1–2 simple pedestrians' street props (e.g. bollards, bike rack).

Props must have transparent backgrounds, consistent top-left lighting, and clear ground contact shadows.

## 6. Character specification

Create three initial NPC archetypes plus a player placeholder:
1. **Office worker:** smart-casual outfit, shoulder bag or ID lanyard.
2. **Shopkeeper:** apron or store workwear, friendly stance.
3. **Resident / commuter:** casual outfit, backpack or tote.
4. **Player avatar:** neutral base outfit, distinct accent color, no fixed occupation.

### Style rules
- Stylized proportions, readable head/body silhouette, simplified facial features.
- Avoid extreme chibi proportions; characters must fit a grounded city simulation.
- Use clear outfit color blocking and small role props.
- Skin, hair, and clothing variants should be swappable layers where feasible.
- Do not encode personality or economic status solely through skin tone, body shape, or clothing price.

### Animation scope for art test
Only create:
- One idle pose / subtle idle loop for each archetype.
- One walk cycle test for one character.
- Optional shopkeeper counter pose as a static illustration.

Do not produce full directional animation sets until scale and readability are approved.

## 7. Color, materials, and lighting

### World palette
- Roads: charcoal slate / blue-grey, not pure black.
- Sidewalks: warm neutral concrete.
- Buildings: warm cream, pale stone, muted teal, sage, dusty terracotta.
- Vegetation: several natural greens with restrained saturation.
- Accent colors: amber for commerce/activity, cyan for information, coral for alerts.

### Lighting
- One consistent soft key light from upper-left.
- Gentle ambient occlusion under buildings and props.
- Shadows fall consistently toward lower-right.
- Avoid hard black outlines; use value contrast and subtle edge definition.
- No strong bloom, glossy plastic, or photorealistic reflections.

### UI semantic colors
- Positive: mint/green.
- Neutral/information: blue/cyan.
- Warning/volatility: amber.
- Negative/loss/crisis: coral/red.
- Long-term asset / special: restrained violet or gold.

Every semantic color must also be paired with a label, icon, shape, or direction indicator.

## 8. Hybrid gameplay layout

The city is the main visual anchor, but the game remains a management simulation.

### Desktop target
- Top status bar: date, time controls, cash, net worth, alerts.
- Main center/left: isometric city viewport.
- Right contextual panel: selected building, NPC, job, or business.
- Bottom or left navigation: Life, Work, Finance, Market, Business, Investments, World.
- Optional compact event ticker below the top status strip.

### Mobile target
- City scene occupies the upper portion of the screen.
- Essential cash/date/time indicators remain visible.
- Context panel becomes a bottom sheet.
- Navigation becomes a compact bottom bar or scrollable tab row.
- Avoid putting critical controls over building entrances or character interaction points.

### Interaction states
Every interactive entity should have:
- Default state.
- Hover/focus state (desktop).
- Selected state.
- Disabled/unavailable state.
- Alert state where relevant.

Selection should use a ground-plane outline, subtle glow, or marker—not a large opaque rectangle that hides the artwork.

## 9. Asset technical delivery rules

### Runtime formats
- SVG for interface icons, logos, and simple vector UI elements.
- Transparent PNG for initial character/building/prop sprites.
- WebP for large static scene illustrations or backgrounds when transparency/quality requirements permit.
- Keep editable source separately; export optimized runtime files into `assets/`.

### Initial reference canvas
- Scene mockup: 1600×1000 px, transparent or layered background where practical.
- Building/prop sprites: export at 2× intended in-game display scale.
- Character sprites: consistent frame box and baseline; exact frame size to be locked after the first character test.
- UI icons: 24, 32, and 48 px display variants or scalable SVG.

### Naming
Use lowercase kebab-case and stable IDs:
- `env-road-straight-01.png`
- `bld-meridian-court-base-01.png`
- `bld-meridian-essentials-front-01.png`
- `bld-meridian-exchange-base-01.png`
- `chr-office-worker-idle-01.png`
- `prop-streetlamp-01.png`
- `ui-icon-wallet.svg`

Each asset must have a manifest entry with source, license, dimensions, intended display scale, pivot/anchor, and approval status.

## 10. Composition and readability acceptance checklist

The art test is approved only when:
- All three buildings are distinguishable at normal zoom.
- Store sign reads clearly and is spelled correctly.
- Building entrances are visible and not blocked by props or UI.
- Character feet align with the ground plane.
- Road, sidewalk, and plaza tiles connect without visible seams.
- Lighting direction is consistent across all assets.
- No asset uses a conflicting isometric angle.
- Selection states do not obscure the selected object.
- The scene remains readable at desktop and mobile viewport sizes.
- The scene is visually coherent without relying on text labels to explain every object.

## 11. Explicit exclusions for this milestone

Do not create yet:
- Full city map or multiple districts.
- Interior building scenes.
- Large crowds or hundreds of NPC sprites.
- Full 8-direction walk cycles.
- Detailed vehicle traffic simulation.
- Weather, day/night, seasons, or disaster effects.
- High-detail corporate towers or landmark buildings.
- Final UI redesign across every screen.

These are later content expansions. The objective here is a high-quality reusable foundation.
