# Aurel — World Atlas & Geography Bible

**Project:** NetWorth / MOSAIC  
**Revision:** 1.0  
**Status:** Initial fictional geography baseline

## 1. World identity

Aurel is a fictional, interconnected world designed to support a persistent life-and-economy simulation. Geography is intentionally built around economic relationships: navigable seas, natural harbors, river basins, agricultural plains, mineral belts, energy regions, and transport chokepoints.

The map is original and must not trace Earth's continents or reproduce real national borders.

## 2. Global composition

Aurel has four major continental regions and one important island arc:

1. **Eldoria** — temperate western continent; finance, manufacturing, research, dense urban corridors.
2. **Sundara** — warm southern/equatorial continent; agriculture, fisheries, minerals, renewable energy, fast-growing cities.
3. **Veyra** — eastern continental landmass; advanced manufacturing, technology, dense population, major ports.
4. **Northreach** — northern high-latitude continent; forests, minerals, freshwater, energy, sparse settlements.
5. **The Pelagic Isles** — central-southern archipelago; shipping, fisheries, tourism, transshipment, maritime services.

A broad central ocean, the **Aurelian Sea**, connects the main trade lanes. The **Meridian Passage** is the key maritime corridor between Eldoria and Sundara. The **Eastern Gate** links the Aurelian Sea to Veyra's major ports.

## 3. Geographic landmarks

- **Crownspine Range:** high mountain chain in northern Eldoria; minerals, hydroelectric potential, difficult overland transport.
- **Sundara Rift:** elevated volcanic and mineral belt running through eastern Sundara.
- **Greenwake Basin:** fertile river basin in central Sundara; food production and inland shipping.
- **Northreach Taiga:** extensive northern forest and freshwater region.
- **Veyran Highlands:** mineral-rich interior uplands feeding eastern manufacturing cities.
- **Pelagic Arc:** volcanic island chain with deep-water ports and fisheries.
- **Lake Orin:** major freshwater lake in western Veyra, supporting inland trade and agriculture.
- **The Blue Current:** major ocean current shaping fisheries and shipping routes.

## 4. Administrative regions and starter cities

The initial map contains 12 major regions. These are broad simulation regions, not necessarily sovereign countries; governance and political boundaries can be expanded later.

| Region | Continent | Character | Main resources / strengths | Major city |
|---|---|---|---|---|
| Westmark | Eldoria | Mature financial and service economy | Finance, education, services | Asterfall |
| Crownlands | Eldoria | Mountainous industrial and energy region | Copper, iron, hydro power | Highridge |
| Meridian Coast | Eldoria | Coastal trade and mixed industry | Port services, manufacturing, finance | Meridian |
| Greenwake | Sundara | Fertile river and agricultural basin | Grain, fruit, timber, freshwater | Sao Aurora |
| Sunvale | Sundara | Dry interior and solar belt | Solar power, lithium, livestock | Solenne |
| Riftmarch | Sundara | Volcanic highlands and mineral belt | Nickel, copper, geothermal energy | Kitala |
| Veyran Core | Veyra | Dense technology and manufacturing corridor | Electronics, machinery, research | Euron |
| Eastreach | Veyra | Major eastern coast and export ports | Shipping, steel, consumer goods | Port Serein |
| Orin Basin | Veyra | Lake and river trade region | Freshwater, agriculture, logistics | Lakehaven |
| Northwood | Northreach | Forest and freshwater region | Timber, pulp, hydro power | Borealis |
| Frostholm | Northreach | Cold northern mineral frontier | Rare earths, iron, gas | Skeld |
| Pelagic Isles | Pelagic Isles | Maritime services and tourism | Fisheries, tourism, transshipment | Nacre Bay |

## 5. Meridian — starter city

Meridian is a major port city on the western edge of the Meridian Coast region, facing the Aurelian Sea. It is the player's starting location and the first fully simulated city.

Its economy is diversified but uneven:
- Port logistics and warehousing.
- Financial and professional services.
- Light manufacturing and food processing.
- Retail, hospitality, and local services.
- Residential construction and urban redevelopment.

Meridian should feel prosperous enough to offer opportunity but not so wealthy that progression is meaningless. It has established commercial districts, older residential neighborhoods, a working waterfront, a growing technology quarter, and lower-income outer districts.

Suggested city districts for later city-level map work:
- **Old Quay:** historic port, warehouses, wholesale markets.
- **Civic Center:** government, courts, public services.
- **Exchange Quarter:** finance, offices, professional services.
- **Northbank:** established residential neighborhoods and schools.
- **Southworks:** light industry, workshops, logistics yards.
- **New Meridian:** new housing, retail, technology offices, construction sites.
- **Harborfront:** passenger terminal, hotels, restaurants, maritime services.

## 6. Trade network

The initial global economy should be connected by a small number of legible trunk routes:

- **Meridian–Asterfall Corridor:** financial services, manufactured goods, professional labor.
- **Meridian–Sao Aurora Line:** food, timber, agricultural inputs, processed goods.
- **Meridian–Port Serein Route:** electronics, machinery, consumer goods.
- **Meridian–Nacre Bay Route:** shipping services, fish, tourism, transshipment.
- **Highridge–Euron Rail & Sea Link:** metals, machinery, industrial components.
- **Borealis–Crownlands Resource Route:** timber, minerals, energy equipment.
- **Sunvale–Riftmarch Energy Link:** solar power equipment, batteries, mineral inputs.

Routes are conceptual trade corridors at world-map scale. Actual shipments, costs, capacity, travel times, disruptions, and tariffs belong to simulation data.

## 7. Resource geography

| Resource | Primary regions | Economic role |
|---|---|---|
| Grain and staple crops | Greenwake, Orin Basin | Food supply and commodity markets |
| Fruit and specialty crops | Greenwake, Pelagic Isles | Consumer goods and exports |
| Timber | Northwood, Greenwake | Construction, paper, furniture |
| Copper and iron | Crownlands, Riftmarch, Veyran Highlands | Infrastructure and manufacturing |
| Nickel and battery minerals | Riftmarch, Sunvale | Batteries, electronics, energy storage |
| Rare earths | Frostholm, Veyran Highlands | Electronics and advanced manufacturing |
| Oil and natural gas | Offshore eastern Veyra, Frostholm shelf | Energy and petrochemicals |
| Solar and geothermal | Sunvale, Riftmarch | Electricity generation |
| Fisheries | Pelagic Isles, Blue Current, Meridian Coast | Food and exports |
| Freshwater / hydro | Northreach, Crownspine, Orin Basin | Agriculture, cities, power |

## 8. World-map coordinate convention

Use a normalized 1000 × 600 logical map plane. Coordinates are illustrative anchors for the first map prototype, not GIS coordinates.

- Origin (0,0) is the top-left.
- X increases east; Y increases south.
- Keep all geography and entity positions in normalized logical coordinates.
- Convert normalized positions to screen coordinates through the map camera transform.
- Do not hardcode screen pixels for city or resource markers.
- Coastlines and landmass silhouettes are art geometry; cities and other entities are separate structured data.

## 9. Map hierarchy

- **World:** continents, major regions, ocean routes, major cities, global events.
- **Region:** administrative boundaries, smaller settlements, roads, rail, ports, resource zones.
- **City:** city boundary, named districts, land use, transport and institutions.
- **District/property:** lots, buildings, homes, businesses, ownership and upgrades.

The player should be able to return to the world view from every level without losing the selected entity.

## 10. Design constraints

- Geography must support future expansion; do not make all regions equally developed.
- Resource distribution should create interdependence rather than make every region self-sufficient.
- Chokepoints should create meaningful but avoidable logistical risk.
- Avoid one region monopolizing every high-value resource.
- Political borders should be visually separate from physical geography.
- The initial game can simulate only a subset of cities and commodities; the atlas defines expansion space, not a requirement to implement everything at once.

## 11. Canonical naming

Use these names consistently in game data, documentation, map labels, and generated art:
- World: Aurel
- Central sea: Aurelian Sea
- Key passage: Meridian Passage
- Eastern maritime corridor: Eastern Gate
- Starter region: Meridian Coast
- Starter city: Meridian
- Starter currency: Luma (LU)
