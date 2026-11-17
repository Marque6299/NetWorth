import test from "node:test";
import assert from "node:assert/strict";
import { createGameState, resolveAction, validateGameState, migrateGameState } from "../js/simulation-core.js";
import { getFinanceSummary, validateFinance } from "../js/finance.js";
import { getOwnershipPortfolio, validateOwnership } from "../js/ownership.js";
import { createExport, parseImport } from "../js/persistence.js";

const makeGame = (profileId = "early-career", seed = "phase-ten") => {
  const result = resolveAction(createGameState({ seed }), { type: "CREATE_CHARACTER", name: "Alex Morgan", age: 29, profileId });
  assert.equal(result.ok, true, result.reason);
  return result.state;
};
const act = (state, action) => {
  const result = resolveAction(state, action);
  assert.equal(result.ok, true, result.reason);
  return result.state;
};
const found = state => act(state, { type: "OWNERSHIP_FOUND_COMPANY", name: "Meridian Data Studio", sector: "Technology", amountMinor: 50000, shares: 100000, description: "Analytics and workflow services." });

test("Phase 10 initializes a separate ownership subsystem and household investment accounts", () => {
  const state = makeGame();
  assert.deepEqual(state.ownership.companies, []);
  assert.equal(state.finance.accounts.some(item => item.id === "privateEquity"), true);
  assert.equal(state.finance.accounts.some(item => item.id === "shareholderLoans"), true);
  assert.equal(validateOwnership(state.ownership, state.finance).valid, true);
  assert.equal(validateGameState(state).valid, true);
});

test("founding a company exchanges household cash for a private-equity asset and founder shares", () => {
  const state = makeGame(), cashBefore = getFinanceSummary(state.finance).cash;
  const created = found(state), company = created.ownership.companies[0];
  assert.equal(company.name, "Meridian Data Studio");
  assert.equal(company.shareholders[0].shares, 100000);
  assert.equal(company.issuedShares, company.outstandingShares);
  assert.equal(getFinanceSummary(created.finance).cash, cashBefore - 50000);
  assert.equal(created.finance.accounts.find(item => item.id === "privateEquity").balanceMinor, 50000);
  assert.equal(company.cashMinor, 50000);
  assert.equal(validateFinance(created.finance).valid, true);
  assert.equal(validateGameState(created).valid, true);
});

test("invalid founding requests are rejected without mutating the source save", () => {
  const state = makeGame(), before = structuredClone(state);
  const invalid = resolveAction(state, { type: "OWNERSHIP_FOUND_COMPANY", name: "X", sector: "Technology", amountMinor: 50000, shares: 100000 });
  assert.equal(invalid.ok, false);
  assert.deepEqual(state, before);
  const unaffordable = resolveAction(state, { type: "OWNERSHIP_FOUND_COMPANY", name: "Too Expensive Ltd", sector: "Technology", amountMinor: 99999999, shares: 100000 });
  assert.equal(unaffordable.ok, false);
  assert.deepEqual(state, before);
});

test("weekly company operations create retained earnings and raise estimated equity value", () => {
  let state = found(makeGame()), company = state.ownership.companies[0], before = company.estimatedValueMinor;
  state = act(state, { type: "ADVANCE_TURN" });
  company = state.ownership.companies[0];
  assert.ok(company.cumulativeProfitMinor > 0);
  assert.ok(company.cashMinor > 50000);
  assert.ok(company.estimatedValueMinor > before);
  assert.equal(validateGameState(state).valid, true);
});

test("additional capital issues shares and reconciles household cost basis", () => {
  let state = found(makeGame());
  state = act(state, { type: "OWNERSHIP_CONTRIBUTE_CAPITAL", companyId: state.ownership.companies[0].id, amountMinor: 25000 });
  const company = state.ownership.companies[0];
  assert.ok(company.outstandingShares > 100000);
  assert.equal(company.paidInCapitalMinor, 75000);
  assert.equal(state.finance.accounts.find(item => item.id === "privateEquity").balanceMinor, 75000);
  assert.equal(validateGameState(state).valid, true);
});

test("shareholder loans remain separate from equity and are repaid to household cash", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_TAKE_LOAN", companyId, amountMinor: 12000 });
  assert.equal(state.ownership.companies[0].loanBalanceMinor, 12000);
  assert.equal(state.finance.accounts.find(item => item.id === "shareholderLoans").balanceMinor, 12000);
  state = act(state, { type: "OWNERSHIP_REPAY_LOAN", companyId, amountMinor: 5000 });
  assert.equal(state.ownership.companies[0].loanBalanceMinor, 7000);
  assert.equal(state.finance.accounts.find(item => item.id === "shareholderLoans").balanceMinor, 7000);
  assert.equal(validateGameState(state).valid, true);
});

test("new share issue brings in an investor and dilutes founder voting power", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  const company = state.ownership.companies[0];
  assert.equal(company.shareholders.find(item => item.id === "mira-chen").shares, 20000);
  assert.equal(company.outstandingShares, 120000);
  assert.equal(company.shareholders.find(item => item.id === "player").shares / company.outstandingShares, 100000 / 120000);
  assert.equal(validateGameState(state).valid, true);
});

test("shareholder dividend proposal requires a vote and pays only after approval", () => {
  let state = found(makeGame());
  state = act(state, { type: "ADVANCE_TURN" });
  const company = state.ownership.companies[0], companyId = company.id, dividend = Math.floor(company.retainedEarningsMinor / 2);
  assert.ok(dividend > 0);
  state = act(state, { type: "OWNERSHIP_PROPOSE_DIVIDEND", companyId, amountMinor: dividend });
  const resolutionId = state.ownership.companies[0].resolutions[0].id;
  const cashBefore = getFinanceSummary(state.finance).cash;
  state = act(state, { type: "OWNERSHIP_VOTE", companyId, resolutionId, vote: "for" });
  state = act(state, { type: "OWNERSHIP_CLOSE_VOTE", companyId, resolutionId });
  assert.equal(state.ownership.companies[0].resolutions[0].status, "passed");
  assert.equal(state.ownership.companies[0].retainedEarningsMinor, company.retainedEarningsMinor - dividend);
  assert.ok(getFinanceSummary(state.finance).cash > cashBefore);
  assert.equal(state.finance.ledger.at(-1).kind, "COMPANY_DIVIDEND");
  assert.equal(validateGameState(state).valid, true);
});

test("company buyback realizes gain or loss and reduces founder shares and cost basis", () => {
  let state = found(makeGame());
  state = act(state, { type: "ADVANCE_TURN" });
  const companyId = state.ownership.companies[0].id, sharesBefore = state.ownership.companies[0].shareholders[0].shares;
  state = act(state, { type: "OWNERSHIP_BUYBACK_SHARES", companyId, shares: 1000 });
  assert.equal(state.ownership.companies[0].shareholders[0].shares, sharesBefore - 1000);
  assert.equal(state.finance.ledger.at(-1).kind, "EQUITY_BUYBACK");
  assert.equal(validateGameState(state).valid, true);
});

test("acquisition purchases 100 percent of a listed target and posts the purchase as an investment", () => {
  let state = makeGame("independent");
  state = act(state, { type: "RECORD_INCOME", amountMinor: 2000000, category: "business-income", description: "Sale of an inherited asset" });
  state = act(state, { type: "OWNERSHIP_ACQUIRE_TARGET", targetId: "cobalt-digital-works" });
  const company = state.ownership.companies[0];
  assert.equal(company.name, "Cobalt Digital Works");
  assert.equal(company.acquired, true);
  assert.equal(company.shareholders[0].shares, company.outstandingShares);
  assert.equal(state.finance.accounts.find(item => item.id === "privateEquity").balanceMinor, 1850000);
  assert.equal(validateGameState(state).valid, true);
});

test("company ownership and governance records survive JSON export and import", () => {
  let state = found(makeGame());
  state = act(state, { type: "OWNERSHIP_CREATE_RESOLUTION", companyId: state.ownership.companies[0].id, title: "Approve a second service line", resolutionType: "CAPITAL_EXPANSION" });
  const restored = parseImport(createExport(state));
  assert.deepEqual(restored.ownership, state.ownership);
  assert.deepEqual(restored.finance, state.finance);
  assert.equal(validateGameState(restored).valid, true);
});

test("schema v8 saves migrate to schema v9 with an empty ownership subsystem", () => {
  const old = found(makeGame());
  old.schemaVersion = 8;
  old.simulationVersion = "0.9.0";
  delete old.ownership;
  old.finance.accounts = old.finance.accounts.filter(item => !["privateEquity", "shareholderLoans"].includes(item.id));
  const migrated = migrateGameState(old);
  assert.equal(migrated.schemaVersion, 9);
  assert.deepEqual(migrated.ownership.companies, []);
  assert.equal(validateGameState(migrated).valid, true);
});
