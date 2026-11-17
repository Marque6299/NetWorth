import test from "node:test";
import assert from "node:assert/strict";
import { createGameState, resolveAction, validateGameState, migrateGameState } from "../js/simulation-core.js";
import { validateFinance, getFinanceSummary } from "../js/finance.js";
import { validateBanking } from "../js/banking.js";
import { getAssetPortfolio, validateAssets } from "../js/assets.js";
import { createExport, parseImport } from "../js/persistence.js";

const makeGame = (profileId = "career-switcher", seed = "assets-phase-eight") => {
  const result = resolveAction(createGameState({ seed }), { type: "CREATE_CHARACTER", name: "Casey Morgan", age: 30, profileId });
  assert.equal(result.ok, true, result.reason);
  return result.state;
};
const act = (state, action) => {
  const result = resolveAction(state, action);
  assert.equal(result.ok, true, result.reason);
  return result.state;
};

test("Phase 8 initializes property and collectible catalogues and reconciled asset accounts", () => {
  const state = makeGame();
  assert.equal(state.assets.properties.length, 0);
  assert.equal(state.assets.collectibles.length, 0);
  assert.equal(validateAssets(state.assets, state.finance, state.banking).valid, true);
  assert.equal(validateGameState(state).valid, true);
});

test("property acquisition records down payment, mortgage liability and closing cost", () => {
  const state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "rental", downPaymentBps: 2000 });
  const property = state.assets.properties[0];
  const mortgage = state.banking.loans.find(item => item.id === property.mortgageId);
  assert.equal(property.name, "Harborview Starter Studio");
  assert.equal(mortgage.type, "mortgage");
  assert.equal(mortgage.principalMinor, 760000);
  assert.equal(state.finance.accounts.find(item => item.id === "propertyAssets").balanceMinor, property.marketValueMinor);
  assert.equal(state.finance.ledger.some(item => item.kind === "PROPERTY_CLOSING_COST"), true);
  assert.equal(validateFinance(state.finance).valid, true);
  assert.equal(validateBanking(state.banking, state.finance).valid, true);
  assert.equal(validateGameState(state).valid, true);
});

test("weekly property operations post rental income, upkeep and mortgage service", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "rental" });
  const cashBefore = getFinanceSummary(state.finance).cash;
  state = act(state, { type: "ADVANCE_TURN" });
  assert.equal(state.finance.ledger.some(item => item.kind === "PROPERTY_RENT"), true);
  assert.equal(state.finance.ledger.some(item => item.kind === "PROPERTY_UPKEEP"), true);
  assert.equal(state.finance.ledger.some(item => item.kind === "LOAN_PAYMENT"), true);
  assert.ok(getFinanceSummary(state.finance).cash > cashBefore - 10000);
  assert.equal(validateGameState(state).valid, true);
});

test("property sale realizes valuation, selling costs and fully settles its mortgage", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "owner-occupied" });
  const property = state.assets.properties[0];
  const mortgage = state.banking.loans.find(item => item.id === property.mortgageId);
  state = act(state, { type: "ASSET_SELL_PROPERTY", propertyId: property.id });
  assert.equal(state.assets.properties.length, 0);
  assert.equal(mortgage.status, "active"); // the original pre-action state is immutable
  const settled = state.banking.loans.find(item => item.id === property.mortgageId);
  assert.equal(settled.status, "paid");
  assert.equal(settled.principalMinor, 0);
  assert.equal(state.finance.accounts.find(item => item.id === "propertyAssets").balanceMinor, 0);
  assert.equal(state.finance.ledger.some(item => item.kind === "MORTGAGE_SETTLEMENT"), true);
  assert.equal(validateGameState(state).valid, true);
});

test("collectible purchases and sales preserve the subledger and apply a liquidity discount", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_COLLECTIBLE", catalogId: "collectible-camera" });
  const holding = state.assets.collectibles[0];
  assert.equal(state.finance.accounts.find(item => item.id === "collectibleAssets").balanceMinor, holding.marketValueMinor);
  const cashAfterPurchase = getFinanceSummary(state.finance).cash;
  state = act(state, { type: "ASSET_SELL_COLLECTIBLE", collectibleId: holding.id });
  assert.equal(state.assets.collectibles.length, 0);
  assert.equal(state.finance.accounts.find(item => item.id === "collectibleAssets").balanceMinor, 0);
  assert.ok(getFinanceSummary(state.finance).cash < cashAfterPurchase + holding.marketValueMinor);
  assert.equal(validateGameState(state).valid, true);
});

test("weekly asset valuations are deterministic and update unrealized equity rather than cash", () => {
  const setup = state => act(state, { type: "ASSET_BUY_COLLECTIBLE", catalogId: "collectible-watch" });
  let a = setup(makeGame("career-switcher", "same-asset-seed"));
  let b = setup(makeGame("career-switcher", "same-asset-seed"));
  const cash = getFinanceSummary(a.finance).cash;
  for (let i = 0; i < 8; i++) {
    a = act(a, { type: "ADVANCE_TURN" });
    b = act(b, { type: "ADVANCE_TURN" });
  }
  assert.deepEqual(a.assets, b.assets);
  assert.equal(a.finance.ledger.filter(item => item.kind.startsWith("COLLECTIBLE_UNREALIZED_")).length > 0, true);
  assert.equal(getFinanceSummary(a.finance).cash, cash);
  assert.equal(validateGameState(a).valid, true);
});

test("property use can switch between rental and owner-occupied without changing asset value", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "rental" });
  const property = state.assets.properties[0], value = property.marketValueMinor, ledgerCount = state.finance.ledger.length;
  state = act(state, { type: "ASSET_SET_PROPERTY_USE", propertyId: property.id, use: "owner-occupied" });
  assert.equal(state.assets.properties[0].use, "owner-occupied");
  assert.equal(state.assets.properties[0].marketValueMinor, value);
  assert.equal(state.finance.ledger.length, ledgerCount);
  assert.equal(validateGameState(state).valid, true);
});

test("invalid property or collectible actions do not partially mutate the game", () => {
  const state = makeGame("early-career"), before = structuredClone(state);
  const property = resolveAction(state, { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "rental", downPaymentBps: 2000 });
  assert.equal(property.ok, false);
  assert.deepEqual(state, before);
  const collectible = resolveAction(state, { type: "ASSET_BUY_COLLECTIBLE", catalogId: "not-a-real-item" });
  assert.equal(collectible.ok, false);
  assert.deepEqual(state, before);
});

test("asset portfolio summarizes property and collectible value separately", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "rental" });
  state = act(state, { type: "ASSET_BUY_COLLECTIBLE", catalogId: "collectible-camera" });
  const portfolio = getAssetPortfolio(state.assets);
  assert.equal(portfolio.propertyCount, 1);
  assert.equal(portfolio.collectibleCount, 1);
  assert.equal(portfolio.totalValue, portfolio.propertyValue + portfolio.collectibleValue);
  assert.equal(validateGameState(state).valid, true);
});

test("schema v6 saves migrate to schema v12 without losing earlier systems", () => {
  const old = makeGame();
  old.schemaVersion = 6;
  old.simulationVersion = "0.7.0";
  delete old.assets;
  const migrated = migrateGameState(old);
  assert.equal(migrated.schemaVersion, 12);
  assert.equal(migrated.assets.properties.length, 0);
  assert.equal(migrated.assets.collectibles.length, 0);
  assert.deepEqual(migrated.markets, old.markets);
  assert.deepEqual(migrated.banking, old.banking);
  assert.equal(validateGameState(migrated).valid, true);
});

test("property and collectible condition wears down periodically and can be restored", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "owner-occupied" });
  state = act(state, { type: "ASSET_BUY_COLLECTIBLE", catalogId: "collectible-camera" });
  for (let i = 0; i < 13; i++) state = act(state, { type: "ADVANCE_TURN" });
  const property = state.assets.properties[0], collectible = state.assets.collectibles[0];
  assert.equal(property.condition, 99);
  assert.equal(collectible.condition, 99);
  state = act(state, { type: "ASSET_MAINTAIN_PROPERTY", propertyId: property.id });
  state = act(state, { type: "ASSET_MAINTAIN_COLLECTIBLE", collectibleId: collectible.id });
  assert.ok(state.assets.properties[0].condition > 99);
  assert.ok(state.assets.collectibles[0].condition > 99);
  assert.equal(validateGameState(state).valid, true);
});

test("JSON export and import preserve property, collectible and mortgage state", () => {
  let state = act(makeGame(), { type: "ASSET_BUY_PROPERTY", listingId: "property-studio", use: "rental" });
  state = act(state, { type: "ASSET_BUY_COLLECTIBLE", catalogId: "collectible-camera" });
  for (let i = 0; i < 2; i++) state = act(state, { type: "ADVANCE_TURN" });
  const restored = parseImport(createExport(state));
  assert.deepEqual(restored.assets, state.assets);
  assert.deepEqual(restored.banking.loans, state.banking.loans);
  assert.equal(validateGameState(restored).valid, true);
});
