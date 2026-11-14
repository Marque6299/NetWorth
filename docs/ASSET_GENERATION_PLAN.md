# Meridian Street Block — First Asset Generation Plan

**Project:** NetWorth / MOSAIC  
**Milestone:** Visual Prototype 01  
**Status:** Approved production plan  
**Direction:** 2D isometric / stylized characters / hybrid city + management UI

## 1. Production strategy

Generate assets in controlled batches, not as one giant image. The scene must be assembled from reusable transparent assets so buildings can be selected, replaced, upgraded, animated, and reused across the city.

Use a single approved style reference throughout the generation process. Every new asset must match:
- Isometric projection and ground-plane grid.
- Upper-left key light and lower-right shadow direction.
- World palette and material treatment.
- Relative scale and visual detail density.
- Transparent background requirements.

**Important:** AI-generated images are visual source material, not production-ready game assets by default. Review, clean, crop, optimize, and test each export before adding it to the runtime asset folder.

## 2. Generation order

### Batch 0 — Style anchor and calibration sheet
**Purpose:** Lock visual language and scale before producing individual assets.

Generate:
1. A small isometric street-block concept image showing the intended final composition.
2. A palette/material reference sheet.
3. A perspective calibration sheet showing a ground tile, one cube/building mass, one tree, and one human character on the same isometric grid.

Deliverables:
- `art-source/concepts/meridian-style-anchor.png`
- `art-source/concepts/meridian-palette-reference.png`
- `art-source/concepts/isometric-scale-calibration.png`

Approval gate:
- Perspective is consistent.
- The city looks modern, fictional, warm, and believable.
- Character scale is compatible with doorways and street furniture.
- The scene is not too detailed for browser gameplay.

### Batch 1 — Modular environment foundation
**Purpose:** Establish a reusable ground plane.

Generate separate transparent assets:
- Grass tile.
- Sidewalk straight / corner / T-junction.
- Road straight / corner / T-junction / crossroad.
- Pedestrian crossing.
- Curb and driveway transition.
- Small paved plaza tile.

Deliverables under `assets/world/tiles/` and `assets/world/roads/`.

Acceptance:
- Edges align when placed on the grid.
- No baked-in perspective mismatch.
- Repeated tiles do not create obvious visual seams.
- Road markings connect correctly across variants.

### Batch 2 — Three hero buildings
**Purpose:** Create the visual identity of the first block.

Generate in this order:
1. Meridian Court — residential anchor.
2. Meridian Essentials — recognizable convenience shop with exact storefront wording.
3. Meridian Exchange — modest office / workplace.

For each building, request:
- One full isometric exterior sprite with transparent background.
- One ground-plane footprint / placement guide as a separate non-runtime reference.
- One clean front/side detail reference if the geometry needs refinement.

Do not bake roads, trees, people, shadows from neighboring objects, or UI into the building sprites. Use a consistent baseline and footprint.

### Batch 3 — Street props and vegetation
Generate:
- Three trees with distinct canopy sizes.
- Two shrubs/planters.
- Street lamp.
- Bench.
- Waste bin.
- Bus-stop sign.
- Street-name sign.
- Utility cabinet.
- Compact parked car.
- Delivery van.

Keep each prop isolated on transparent background. Create variants only after the base object is approved.

### Batch 4 — Character archetypes
Generate:
- Player avatar base.
- Office worker.
- Shopkeeper.
- Resident/commuter.

Start with static three-quarter/isometric standing poses. Confirm head/body proportions and foot pivot. Then create one idle loop and one walk-cycle test. Avoid generating all directions at once.

### Batch 5 — UI visual kit
Create:
- Wallet / cash.
- Net worth.
- Home / rent.
- Health / energy / hunger / hydration / hygiene / stress.
- Work / skills.
- Market / goods.
- Bank / savings / debt.
- Business / inventory.
- Investment / portfolio.
- News / alert / event.
- City / map / transport.

Use a coherent SVG icon family, consistent stroke weight, optical size, corner style, and semantic color rules. UI icons should remain legible at 20–24 px.

### Batch 6 — Scene assembly and hybrid UI mock
Assemble the approved sprites into one 1600×1000 concept composition, then test it inside the browser viewport.

Composition layers:
1. Ground and road tiles.
2. Building shadows.
3. Buildings.
4. Static props.
5. Vehicles.
6. NPCs and player.
7. Interaction markers / selection state.
8. UI overlay and context panel.

The assembled scene must use separate layers so objects can later become interactive game entities.

## 3. Prompt templates

### A. Isometric style anchor
"Create an original stylized 2D isometric environment concept for a modern fictional life-and-economy simulation game set in Meridian, city of Aurel. Show a compact mixed-use street block with a modest apartment building, a small corner convenience shop, a contemporary office, sidewalks, road markings, trees, street lamps, a bench, and a few small stylized pedestrians. Use a consistent 2:1 isometric projection, clean geometric silhouettes, softly rounded forms, restrained painted/vector-like surface detail, warm cream and sandstone architecture, muted teal and sage accents, slate-blue roads, natural green vegetation, subtle amber shop accents, soft upper-left lighting and gentle shadows cast lower-right. Grounded, welcoming, modern, believable, not childish, not photorealistic, not pixel art. Clear readable composition, moderate detail, no UI, no logos except fictional shop signage. This is a style reference, not a final game screenshot."

### B. Isolated building sprite
"Create one original [BUILDING NAME] for a stylized 2D isometric city simulation game. True consistent 2:1 isometric projection, three-quarter isometric view, complete building fully inside frame, transparent background, no ground tile, no road, no trees, no people, no neighboring objects, no UI, soft upper-left lighting, gentle shadow directly beneath the building, clean readable silhouette, warm modern fictional city architecture, restrained detail. Align the building to a clear ground-plane footprint with a bottom-center placement anchor. Match the approved Meridian style reference. Do not crop the roof or base."

### C. Isolated prop sprite
"Create one [PROP] as a reusable game sprite for the approved stylized 2D isometric Meridian city art style. Consistent 2:1 isometric projection, transparent background, object fully visible, no environment, no people, no text unless specifically requested, soft upper-left light, subtle lower-right contact shadow, clean silhouette, moderate detail, bottom-center ground contact anchor. Match the approved style reference and scale."

### D. Stylized character sprite
"Create one full-body stylized human character for a modern 2D isometric life simulation game. Character role: [ROLE]. Outfit: [OUTFIT]. Pose: [POSE]. Three-quarter isometric orientation matching the approved 2:1 city projection, entire body visible, feet clearly visible and aligned to a common baseline, transparent background, no props unless specified, no text, simplified expressive face, grounded human proportions, clean color blocking, soft upper-left light. Character must read clearly at small in-game size and match the approved Meridian style reference."

### E. UI icon
"Create a clean original vector-style UI icon representing [CONCEPT] for a polished dark management simulation interface. Simple distinctive silhouette, consistent medium stroke, rounded joins, balanced negative space, legible at 24 px, centered, no text, no gradients, no background, SVG-friendly geometry. Use [SEMANTIC COLOR] only as a restrained accent; icon must remain understandable in monochrome."

## 4. Asset manifest and file hygiene

Every accepted asset must be registered in `assets/manifest/asset-manifest.json` (or an equivalent CSV during early production).

Suggested fields:
```json
{
  "id": "bld-meridian-essentials-01",
  "name": "Meridian Essentials",
  "category": "building",
  "source": "generated-original",
  "license": "original project asset",
  "sourceFile": "art-source/buildings/meridian-essentials-v01.png",
  "runtimeFile": "assets/world/buildings/bld-meridian-essentials-01.webp",
  "width": 1024,
  "height": 1024,
  "anchor": "bottom-center",
  "worldFootprint": [3, 2],
  "status": "review",
  "notes": "Transparent background; sign spelling approved"
}
```

Rules:
- Never overwrite the approved source; increment version suffixes.
- Keep generated originals in `art-source/`.
- Keep optimized runtime exports in `assets/`.
- Record generation prompt and reference images alongside source.
- Record third-party licenses and creator/source for any external asset.
- Do not add an asset to runtime until its dimensions, transparency, anchor, and visual consistency are checked.

## 5. Technical validation

Before accepting any sprite:
- Check alpha transparency and remove unintended background halos.
- Check canvas bounds and ensure no cropped pixels.
- Verify the ground anchor and expected footprint.
- Check scale against a standard doorway and character.
- Confirm lighting direction and isometric angle.
- Export a compressed WebP/PNG runtime version.
- Test on the actual game background at 100%, 75%, and mobile scale.
- Verify that the asset does not obscure text, controls, or interaction targets.

## 6. First milestone completion criteria

The Meridian Street Block art test is complete when:
- The three buildings, ground kit, props, and four character bases are available as separate assets.
- The assembled scene looks cohesive and uses the approved perspective.
- The shop sign reads “MERIDIAN ESSENTIALS”.
- Characters fit the environment and have consistent ground pivots.
- The scene can be assembled and rearranged without repainting the entire image.
- At least one building can be selected and represented in the hybrid UI context panel.
- The scene loads as a local browser asset set without external runtime image dependencies.

## 7. Recommended first execution sequence

1. Generate and approve the style anchor.
2. Generate the isometric calibration sheet.
3. Generate Meridian Essentials as the first hero building (its storefront becomes the style and scale reference).
4. Generate Meridian Court and Meridian Exchange to match it.
5. Build the road/sidewalk tile kit.
6. Generate the first three NPC archetypes and player base.
7. Generate the prop set.
8. Assemble the scene and review it at desktop and mobile sizes.

Do not begin mass generation until steps 1–3 are approved. A strong first shop/building reference will reduce style drift across the rest of the asset library.
