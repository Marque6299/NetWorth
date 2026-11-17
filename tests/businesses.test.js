import test from "node:test";
import assert from "node:assert/strict";
import { createGameState, resolveAction, validateGameState, migrateGameState } from "../js/simulation-core.js";
import { getFinanceSummary, validateFinance } from "../js/finance.js";
import { BUSINESS_COMPANIES, BUSINESS_SUPPLIERS, getBusinessSummary, validateBusinesses } from "../js/businesses.js";
import { createExport, parseImport } from "../js/persistence.js";

const makeGame = (profileId = "career-switcher", seed = "business-phase-nine") => {
  const result = resolveAction(createGameState({ seed }), { type: "CREATE_CHARACTER", name: "Casey Morgan", age: 30, profileId });
  assert.equal(result.ok, true, result.reason);
  return result.state;
};
const act = (state, action) => {
  const result = resolveAction(state, action);
  assert.equal(result.ok, true, result.reason);
  return result.state;
};
const startMandate = (state, companyId = "meridian-essentials") => act(state, { type: "BUSINESS_ACCEPT_MANDATE", companyId });

test("Phase 9 initializes a company directory and business operation state without player ownership", () => {
  const state = makeGame();
  assert.equal(BUSINESS_COMPANIES.length, 5);
  assert.equal(BUSINESS_SUPPLIERS.length, 3);
  assert.equal(state.businesses.mandate, null);
  assert.equal(validateBusinesses(state.businesses, state.finance).valid, true);
  assert.equal(validateGameState(state).valid, true);
});

test("accepting an operating mandate creates independently funded branch books", () => {
  const state = makeGame();
  const householdCash = getFinanceSummary(state.finance).cash;
  const active = startMandate(state);
  const summary = getBusinessSummary(active.businesses);
  assert.equal(active.businesses.mandate.companyId, "meridian-essentials");
  assert.ok(summary.cashMinor > 0);
  assert.ok(summary.inventoryMinor > 0);
  assert.equal(summary.revenueMinor, 0);
  assert.equal(getFinanceSummary(active.finance).cash, householdCash);
  assert.equal(active.finance.accounts.some(item => item.id === "businessAssets"), false);
  assert.equal(validateBusinesses(active.businesses, active.finance).valid, true);
  assert.equal(validateGameState(active).valid, true);
});

test("weekly operations generate sales, consume inventory, pay branch obligations and credit manager pay to household income", () => {
  let state = startMandate(makeGame());
  const beforeCash = getFinanceSummary(state.finance).cash;
  state = act(state, { type: "ADVANCE_TURN" });
  const summary = getBusinessSummary(state.businesses);
  assert.ok(summary.revenueMinor > 0);
  assert.ok(summary.totalUnitsSold > 0);
  assert.ok(summary.inventoryMinor < 172250);
  assert.ok(getFinanceSummary(state.finance).cash > beforeCash);
  assert.equal(state.finance.ledger.some(item => item.kind === "BUSINESS_MANAGER_PAY"), true);
  assert.equal(state.businesses.mandate.history.length, 1);
  assert.equal(validateFinance(state.finance).valid, true);
  assert.equal(validateBusinesses(state.businesses, state.finance).valid, true);
  assert.equal(validateGameState(state).valid, true);
});

test("pricing and staffing controls are validated and affect the active branch", () => {
  let state = startMandate(makeGame());
  const product = state.businesses.mandate.products[0];
  state = act(state, { type: "BUSINESS_SET_PRICE", productId: product.id, priceMinor: product.basePriceMinor + 200 });
  state = act(state, { type: "BUSINESS_SET_STAFFING", staffCount: 5 });
  assert.equal(state.businesses.mandate.products[0].priceMinor, product.basePriceMinor + 200);
  assert.equal(state.businesses.mandate.staffCount, 5);
  assert.equal(validateGameState(state).valid, true);
});

test("supplier purchasing reserves cash in transit and reconciles stock on delivery", () => {
  let state = startMandate(makeGame());
  const product = state.businesses.mandate.products[0];
  const cashBefore = getBusinessSummary(state.businesses).cashMinor;
  state = act(state, { type: "BUSINESS_ORDER_INVENTORY", productId: product.id, supplierId: "metro-wholesale", units: 10 });
  assert.equal(getBusinessSummary(state.businesses).cashMinor < cashBefore, true);
  assert.ok(getBusinessSummary(state.businesses).transitMinor > 0);
  assert.equal(state.businesses.mandate.purchaseOrders[0].status, "pending");
  assert.equal(validateGameState(state).valid, true);
  state = act(state, { type: "ADVANCE_TURN" });
  state = act(state, { type: "ADVANCE_TURN" });
  assert.equal(state.businesses.mandate.purchaseOrders[0].status, "delivered");
  assert.equal(getBusinessSummary(state.businesses).transitMinor, 0);
  assert.equal(validateGameState(state).valid, true);
});

test("marketing campaigns debit company cash and temporarily increase demand", () => {
  let state = startMandate(makeGame());
  const cash = getBusinessSummary(state.businesses).cashMinor;
  state = act(state, { type: "BUSINESS_MARKETING_CAMPAIGN", amountMinor: 25000 });
  assert.equal(getBusinessSummary(state.businesses).cashMinor, cash - 25000);
  assert.equal(state.businesses.mandate.marketingUntilTurn, state.calendar.turn + 4);
  assert.equal(state.businesses.mandate.marketingBoostBps, 2500);
  assert.equal(validateGameState(state).valid, true);
});

test("lower side-work allocation reduces manager performance compared with a committed schedule", () => {
  let low = startMandate(makeGame("career-switcher", "business-sidework"));
  let high = structuredClone(low);
  low = act(low, { type: "SET_TIME_ALLOCATION", allocation: { ...low.life.timeAllocation, sideWork: 0, work: 40, study: 10, rest: 14, family: 10, networking: 6, research: 6, recreation: 16, studyFocus: "financialLiteracy" } });
  high = act(high, { type: "SET_TIME_ALLOCATION", allocation: { ...high.life.timeAllocation, sideWork: 12, work: 38, study: 10, rest: 14, family: 10, networking: 6, research: 6, recreation: 16, studyFocus: "financialLiteracy" } });
  low = act(low, { type: "ADVANCE_TURN" });
  high = act(high, { type: "ADVANCE_TURN" });
  assert.ok(high.businesses.mandate.managerScore > low.businesses.mandate.managerScore);
});

test("ending an operating mandate archives performance and preserves the personal balance sheet", () => {
  let state = startMandate(makeGame());
  state = act(state, { type: "ADVANCE_TURN" });
  const cash = getFinanceSummary(state.finance).cash;
  state = act(state, { type: "BUSINESS_END_MANDATE" });
  assert.equal(state.businesses.mandate, null);
  assert.equal(state.businesses.history.length, 1);
  assert.equal(getFinanceSummary(state.finance).cash, cash);
  assert.equal(validateGameState(state).valid, true);
  state = startMandate(state, "brightline-commerce");
  assert.equal(state.businesses.mandate.companyId, "brightline-commerce");
});

test("invalid company decisions do not partially mutate game state", () => {
  const state = makeGame("early-career"), before = structuredClone(state);
  const locked = resolveAction(state, { type: "BUSINESS_ACCEPT_MANDATE", companyId: "aster-industrial" });
  assert.equal(locked.ok, false);
  assert.deepEqual(state, before);
  const invalidCompany = resolveAction(state, { type: "BUSINESS_ACCEPT_MANDATE", companyId: "missing-company" });
  assert.equal(invalidCompany.ok, false);
  assert.deepEqual(state, before);
});

test("same seed and decisions produce the same weekly business outcome", () => {
  let a = startMandate(makeGame("career-switcher", "business-repeat"));
  let b = startMandate(makeGame("career-switcher", "business-repeat"));
  a = act(a, { type: "BUSINESS_MARKETING_CAMPAIGN", amountMinor: 12000 });
  b = act(b, { type: "BUSINESS_MARKETING_CAMPAIGN", amountMinor: 12000 });
  for (let i = 0; i < 8; i++) {
    a = act(a, { type: "ADVANCE_TURN" });
    b = act(b, { type: "ADVANCE_TURN" });
  }
  assert.deepEqual(a.businesses, b.businesses);
  assert.deepEqual(a.finance.ledger, b.finance.ledger);
});

test("business state and manager compensation survive JSON export and import", () => {
  let state = startMandate(makeGame());
  for (let i = 0; i < 3; i++) state = act(state, { type: "ADVANCE_TURN" });
  const restored = parseImport(createExport(state));
  assert.deepEqual(restored.businesses, state.businesses);
  assert.deepEqual(restored.finance, state.finance);
  assert.equal(validateGameState(restored).valid, true);
});

test("schema v7 saves migrate to schema v10 with an empty business subsystem", () => {
  const old = makeGame();
  old.schemaVersion = 7;
  old.simulationVersion = "0.8.0";
  delete old.businesses;
  const migrated = migrateGameState(old);
  assert.equal(migrated.schemaVersion, 10);
  assert.equal(migrated.businesses.mandate, null);
  assert.deepEqual(migrated.assets, old.assets);
  assert.equal(validateGameState(migrated).valid, true);
});

test("branch cash never becomes negative when sales stop and operating obligations accumulate", () => {
  let state = startMandate(makeGame());
  for (let i = 0; i < 75; i++) state = act(state, { type: "ADVANCE_TURN" });
  const summary = getBusinessSummary(state.businesses);
  assert.ok(summary.payablesMinor > 0);
  assert.ok(summary.cashMinor >= 0);
  assert.ok(state.businesses.mandate.payables.length > 0);
  assert.equal(validateGameState(state).valid, true);
});
