# MOSAIC — Visual Production Roadmap

## Phase 0 — Visual discovery and style lock

**Goal:** Confirm the visual language before creating a large asset library.

Deliverables:
- Moodboard with 2–3 compatible visual directions.
- Isometric grid, camera angle, object scale, and light direction specification.
- World and UI color tokens.
- Typography and icon rules.
- One mini-scene art test (street, home, shop, office, trees, props, three people).
- Review checklist for readability at desktop and mobile sizes.

**Exit criteria:** The scene reads clearly at normal zoom; assets share one perspective and lighting system; the UI remains legible over the scene.

## Phase 1 — Starter city kit

**Goal:** Build the minimum reusable environment kit for Meridian.

Deliverables:
- Ground, sidewalk, road, intersection, and plaza tiles.
- Starter residential building, convenience shop, and office.
- Trees, lamps, signs, benches, bins, and a few vehicles.
- Selection outlines, map markers, and building interaction states.
- One assembled street block.

**Exit criteria:** A small city block can be assembled from reusable pieces without bespoke redraws.

## Phase 2 — Character kit

**Goal:** Give the city visible human activity.

Deliverables:
- Player avatar base and customization variants.
- Three to five NPC archetypes.
- Casual and work outfits.
- Idle and walk animation tests.
- NPC name / role / status UI treatment.

**Exit criteria:** Characters are distinguishable at the intended map zoom and can be reused across different jobs and neighborhoods.

## Phase 3 — Gameplay-specific visual feedback

**Goal:** Make simulation events visible in the world and interface.

Deliverables:
- Work shift and workplace feedback.
- Shopping / delivery / inventory feedback.
- Business open/closed states.
- Building upgrade and ownership states.
- Household needs and health alerts.
- Market shortage, price increase, and crisis indicators.
- News and notification cards.

**Exit criteria:** Key events can be understood without reading a long log entry.

## Phase 4 — Economy and city expansion assets

**Goal:** Support deeper economic systems.

Deliverables:
- Bank, market, café, clinic, school, workshop, warehouse, transport, civic buildings.
- Additional vehicles, goods props, storefront signs, and business branding.
- More character outfits and job-specific props.
- District visual themes and environmental variations.

**Exit criteria:** New gameplay systems can be represented by recombining the existing visual kit plus a small number of new assets.

## Phase 5 — Polish and optimization

**Goal:** Prepare a consistent, performant asset pipeline.

Deliverables:
- Optimized PNG/WebP/SVG runtime exports.
- Sprite atlases where useful.
- Lazy loading and fallback placeholders.
- Reduced-motion and accessibility review.
- Mobile performance and memory budget.
- Asset manifest validation and unused-asset audit.

**Exit criteria:** No major missing assets, no inconsistent style, and acceptable load/render performance on mid-range mobile devices.

## Recommended first production task

Create the **Meridian Street Block Art Test** before drawing dozens of assets. It is the fastest way to validate the art style, scale, palette, and technical pipeline. Only after approval should we commission or generate the full building, prop, and character sets.
