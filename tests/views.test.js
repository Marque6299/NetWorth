import test from "node:test";
import assert from "node:assert/strict";
import { renderOverview, renderSection, renderMarketsView, renderAssetsView, renderBusinessesView } from "../js/views.js";
import { createGameState, resolveAction } from "../js/simulation-core.js";
import { PAGE_IDS } from "../js/navigation.js";

test("Overview contains the welcome panel, blank snapshot and next-step navigation", () => {
  const html = renderOverview();
  for (const text of ["Every empire starts", "Available cash", "No active save", "Financial position", "Recent activity"]) assert.ok(html.includes(text), text);
  for (const id of ["personal", "finance", "markets"]) assert.ok(html.includes('data-route="' + id + '"'));
  assert.doesNotMatch(html, /LU\s*[\d,]+|\$\s*[\d,]+/);
});

test("each section shows modules, planned status and a deliberate empty state", () => {
  for (const id of PAGE_IDS.filter(item => item !== "overview")) {
    const html = renderSection(id);
    assert.match(html, /WORKSPACE MODULES/);
    assert.match(html, /PLANNED/);
    assert.match(html, /No active data/);
    assert.match(html, /Phase 1 foundation/);
    assert.doesNotMatch(html, /undefined|null/);
  }
});

test("Markets workspace renders the instrument directory, order terminal and portfolio",()=>{
 let state=createGameState({seed:"market-view"});state=resolveAction(state,{type:"CREATE_CHARACTER",name:"Taylor Morgan",age:29,profileId:"early-career"}).state;
 const html=renderMarketsView(state);
 for(const text of ["Market instruments","ORDER TERMINAL","Portfolio holdings","Northstar Services","National Government 5Y","Bitcoin Index","Available cash"])assert.ok(html.includes(text),text);
 assert.match(html,/data-market-form/);assert.match(html,/data-market-watch/);
});

test("Assets workspace renders property and collectible catalogues and acquisition controls", () => {
  let state = createGameState({ seed: "asset-view" });
  state = resolveAction(state, { type: "CREATE_CHARACTER", name: "Taylor Morgan", age: 29, profileId: "career-switcher" }).state;
  const html = renderAssetsView(state);
  for (const text of ["Owned properties", "Available property listings", "Harborview Starter Studio", "Meridian Street Retail Suite", "Owned collectibles", "Vintage Rangefinder Camera", "Classic Collector Automobile", "PROPERTY MORTGAGES"]) assert.ok(html.includes(text), text);
  assert.match(html, /data-asset-form="ASSET_BUY_PROPERTY"/);
  assert.match(html, /data-asset-form="ASSET_BUY_COLLECTIBLE"/);
});

test("Business workspace renders an operating company directory for eligible profiles", () => {
  let state = createGameState({ seed: "business-directory-view" });
  state = resolveAction(state, { type: "CREATE_CHARACTER", name: "Taylor Morgan", age: 29, profileId: "career-switcher" }).state;
  const html = renderBusinessesView(state);
  for (const text of ["Run the operation", "Meridian Retail Group", "Brightline Commerce", "Cobalt Insights", "Northstar Services", "Aster Industrial"]) assert.ok(html.includes(text), text);
  assert.match(html, /data-business-accept="meridian-essentials"/);
});

test("Active Business workspace renders pricing, staffing, marketing, suppliers and performance controls", () => {
  let state = createGameState({ seed: "business-active-view" });
  state = resolveAction(state, { type: "CREATE_CHARACTER", name: "Taylor Morgan", age: 29, profileId: "career-switcher" }).state;
  state = resolveAction(state, { type: "BUSINESS_ACCEPT_MANDATE", companyId: "meridian-essentials" }).state;
  const html = renderBusinessesView(state);
  for (const text of ["Meridian Essentials Market", "Pricing and inventory", "Available suppliers", "Operating results", "BRANCH JOURNAL", "Operating mandate only"]) assert.ok(html.includes(text), text);
  assert.match(html, /data-business-form="BUSINESS_SET_PRICE"/);
  assert.match(html, /data-business-form="BUSINESS_ORDER_INVENTORY"/);
  assert.match(html, /data-business-form="BUSINESS_MARKETING_CAMPAIGN"/);
  assert.match(html, /data-business-action="BUSINESS_END_MANDATE"/);
});
