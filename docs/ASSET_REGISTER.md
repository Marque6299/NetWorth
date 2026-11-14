# MOSAIC — Asset Register

**Status:** Planning inventory; no final art assets approved yet.  
**Rule:** Each asset should have an owner, status, source, runtime format, dimensions, and usage notes before it is treated as production-ready.

## Priority legend

- **P0:** Required to establish the visual prototype.
- **P1:** Required for the first playable city scene.
- **P2:** Needed to broaden gameplay and content.
- **P3:** Later polish / expansion.

## 1. World and environment

| ID | Asset | Priority | Initial quantity | Notes |
|---|---|---:|---:|---|
| ENV-001 | Isometric ground tile set | P0 | 1 set | Grass, pavement, road, sidewalk, plaza |
| ENV-002 | Road intersections and corners | P0 | 1 set | Straight, corner, T-junction, crossroad |
| ENV-003 | Residential building | P0 | 1 | Starter home/apartment exterior |
| ENV-004 | Convenience shop | P0 | 1 | Meridian Essentials placeholder |
| ENV-005 | Office/workplace | P1 | 1 | Employment location |
| ENV-006 | Trees and shrubs | P0 | 1 set | Several silhouettes and sizes |
| ENV-007 | Street props | P1 | 1 set | Lamp, bench, bin, sign, hydrant, bus stop |
| ENV-008 | Vehicles | P2 | 1 set | Parked car, delivery van, bus |
| ENV-009 | Water/coast/park pieces | P2 | 1 set | City expansion kit |
| ENV-010 | Distant skyline backdrop | P2 | 1 | Depth and city scale |

## 2. Buildings and businesses

| ID | Asset | Priority | Initial quantity | Notes |
|---|---|---:|---:|---|
| BLD-001 | Small apartment block | P0 | 1 | Player housing context |
| BLD-002 | Local grocery/convenience store | P0 | 1 | First player business |
| BLD-003 | Small office | P1 | 1 | Job location |
| BLD-004 | Bank branch | P1 | 1 | Banking interaction |
| BLD-005 | Market stalls | P1 | 2–3 | Goods market |
| BLD-006 | Café / food outlet | P2 | 1 | Food economy |
| BLD-007 | Workshop / light industry | P2 | 1 | Production chain |
| BLD-008 | Clinic | P2 | 1 | Health services |
| BLD-009 | School / training center | P2 | 1 | Education |
| BLD-010 | Civic / government building | P3 | 1 | Policy and public services |

## 3. Characters and animation

| ID | Asset | Priority | Initial quantity | Notes |
|---|---|---:|---:|---|
| CHR-001 | Player avatar base | P0 | 1 | Modular appearance baseline |
| CHR-002 | NPC body silhouettes | P0 | 3 | Body/build variety |
| CHR-003 | Hair styles | P1 | 6 | Reusable overlays |
| CHR-004 | Casual clothing | P0 | 4 sets | Everyday residents |
| CHR-005 | Work clothing | P1 | 4 sets | Retail, office, service, trades |
| CHR-006 | Idle animation | P0 | 1 loop | Validate frame count and timing |
| CHR-007 | Walk cycle | P1 | 1 loop | Four/eight direction decision later |
| CHR-008 | Work / interact poses | P2 | 3 poses | Shop, desk, manual work |
| CHR-009 | Emotion / status portraits | P2 | 6 | Happy, tired, stressed, worried, etc. |

## 4. UI and information graphics

| ID | Asset | Priority | Initial quantity | Notes |
|---|---|---:|---:|---|
| UI-001 | Core icon family | P0 | 20–30 | Needs, money, work, home, market, business |
| UI-002 | Resource / needs icons | P0 | 6–8 | Health, energy, hunger, hydration, hygiene, stress |
| UI-003 | Currency and payment marks | P0 | 2–3 | Luma mark and transaction symbols |
| UI-004 | Building category markers | P0 | 8 | Home, shop, office, bank, civic, etc. |
| UI-005 | Alert / event icon family | P1 | 10 | News, crisis, opportunity, warning |
| UI-006 | Charts and graph styling | P0 | 1 system | Reusable line/bar/area styles |
| UI-007 | Modal and context panel patterns | P0 | 1 system | Selected entity details |
| UI-008 | Brand marks / fictional company logos | P1 | 6 | Start with core Meridian firms |
| UI-009 | Map pins and selection states | P0 | 1 system | Hover, selected, unavailable |
| UI-010 | Empty states and tutorial illustrations | P2 | 4 | Friendly onboarding |

## 5. Audio (later milestone)

| ID | Asset | Priority | Initial quantity | Notes |
|---|---|---:|---:|---|
| AUD-001 | Ambient city loop | P2 | 1 | Optional, subtle |
| AUD-002 | UI interaction sounds | P2 | 6 | Click, confirm, warning, error |
| AUD-003 | Market / business ambience | P3 | 2 | Contextual loops |
| AUD-004 | Music themes | P3 | 2–3 | Calm city / pressure / achievement |

## 6. Asset folder convention

Suggested runtime layout:

```text
assets/
  world/
    tiles/
    roads/
    buildings/
    props/
    vehicles/
    backgrounds/
  characters/
    player/
    npc/
    spritesheets/
    portraits/
  ui/
    icons/
    logos/
    illustrations/
    charts/
  audio/
    music/
    ambience/
    sfx/
  fonts/
  manifest/
```

Editable source files should live separately under `art-source/` or in an external source project, not mixed with optimized runtime assets.

## 7. Asset metadata template

For each asset, record:
- Asset ID
- Human-readable name
- File path
- Category
- Source / creator / license
- Runtime format
- Pixel dimensions
- Intended display size
- Isometric footprint (if applicable)
- Pivot / anchor point
- Animation frame size and frame count (if applicable)
- Transparent background (yes/no)
- Optimization status
- Approval status
- Dependencies / variants

## 8. Licensing and provenance

Use original commissioned/generated art, properly licensed asset packs, or public-domain assets with verified terms. Record the source and license for every third-party asset. Do not use ripped assets, recognizable copyrighted game characters, or unlicensed fonts/music.
