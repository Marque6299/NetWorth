#!/usr/bin/env node
/**
 * Validate Aurel's structured world data.
 * Run: node scripts/validate-world-data.js
 */
const fs = require("node:fs");
const path = require("node:path");
const file = path.join(__dirname, "..", "data", "world", "aurel-world.json");
const world = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const ids = (items, label) => {
  const seen = new Set();
  for (const item of items || []) {
    if (!item.id) errors.push(label + " entry is missing an id");
    else if (seen.has(item.id)) errors.push(label + " has duplicate id: " + item.id);
    else seen.add(item.id);
  }
  return seen;
};
const continents = ids(world.geography?.continents, "continents");
const regions = ids(world.regions, "regions");
const cities = ids(world.cities, "cities");
const resources = ids(world.resources, "resources");
const routes = ids(world.routes, "routes");
const sites = ids(world.resourceSites, "resource sites");
for (const region of world.regions || []) {
  if (!continents.has(region.continentId)) errors.push("Region " + region.id + " references missing continent " + region.continentId);
}
for (const city of world.cities || []) {
  if (!regions.has(city.regionId)) errors.push("City " + city.id + " references missing region " + city.regionId);
  if (!Number.isFinite(city.anchor?.x) || !Number.isFinite(city.anchor?.y)) errors.push("City " + city.id + " has invalid coordinates");
  if (city.stats && (!Number.isFinite(city.stats.population) || !Number.isFinite(city.stats.gdpLU))) errors.push("City " + city.id + " has invalid stats");
  for (const industry of city.industries || []) {
    if (!Number.isFinite(industry.share) || industry.share < 0 || industry.share > 100) errors.push("City " + city.id + " has invalid industry share");
  }
}
for (const route of world.routes || []) {
  if (!cities.has(route.from)) errors.push("Route " + route.id + " has missing origin city " + route.from);
  if (!cities.has(route.to)) errors.push("Route " + route.id + " has missing destination city " + route.to);
  if (route.controlPoint && (!Number.isFinite(route.controlPoint.x) || !Number.isFinite(route.controlPoint.y))) errors.push("Route " + route.id + " has invalid control point");
}
for (const site of world.resourceSites || []) {
  if (!regions.has(site.regionId)) errors.push("Resource site " + site.id + " references missing region " + site.regionId);
  if (!Number.isFinite(site.anchor?.x) || !Number.isFinite(site.anchor?.y)) errors.push("Resource site " + site.id + " has invalid coordinates");
  for (const resourceId of site.resourceIds || []) if (!resources.has(resourceId)) errors.push("Resource site " + site.id + " references missing resource " + resourceId);
}
const starters = (world.cities || []).filter(city => city.isStarter);
if (starters.length !== 1) errors.push("Expected exactly one starter city; found " + starters.length);
if (errors.length) {
  console.error("Aurel world data validation failed:");
  errors.forEach(error => console.error(" - " + error));
  process.exitCode = 1;
} else {
  console.log("Aurel world data is valid: " + cities.size + " cities, " + regions.size + " regions, " + routes.size + " routes, " + sites.size + " resource sites.");
}
