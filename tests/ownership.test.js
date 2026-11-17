import test from "node:test";
import assert from "node:assert/strict";
import { createGameState, resolveAction, validateGameState, migrateGameState } from "../js/simulation-core.js";
import { getFinanceSummary, validateFinance } from "../js/finance.js";
import { getOwnershipPortfolio, validateOwnership } from "../js/ownership.js";
import { createExport, parseImport } from "../js/persistence.js";
import { renderBusinessesView } from "../js/views.js";

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

test("Phase 10 initializes a separate ownership subsystem and global investor cash accounts", () => {
  const state = makeGame();
  assert.deepEqual(state.ownership.companies, []);
  assert.equal(state.finance.accounts.some(item => item.id === "privateEquity"), true);
  assert.equal(state.finance.accounts.some(item => item.id === "shareholderLoans"), true);
  assert.equal(state.ownership.investorAccounts.length, 4);
  assert.equal(state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor, 25000000);
  assert.equal(validateOwnership(state.ownership, state.finance).valid, true);
  assert.equal(validateGameState(state).valid, true);
});

test("investor cash is shared across companies and cannot be reused", () => {
  let state = found(makeGame());
  const firstCompanyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_FOUND_COMPANY", name: "Northstar Services", sector: "Technology", amountMinor: 50000, shares: 100000 });
  const secondCompanyId = state.ownership.companies[1].id;
  const wallet = state.ownership.investorAccounts.find(item => item.investorId === "mira-chen");
  wallet.cashMinor = 25000;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId: firstCompanyId, investorId: "mira-chen", shares: 20000 });
  assert.equal(state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor, 5000);
  const before = structuredClone(state);
  const rejected = resolveAction(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId: secondCompanyId, investorId: "mira-chen", shares: 10000 });
  assert.equal(rejected.ok, false);
  assert.match(rejected.reason, /available cash/i);
  assert.deepEqual(rejected.state, before);
  assert.equal(validateGameState(state).valid, true);
});

test("repeated share issues accumulate investor cost basis and debit the same wallet", () => {
  let state = found(makeGame());
  const companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 10000 });
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 5000 });
  const company = state.ownership.companies[0];
  const holding = company.shareholders.find(item => item.id === "mira-chen");
  const wallet = state.ownership.investorAccounts.find(item => item.investorId === "mira-chen");
  assert.equal(holding.shares, 15000);
  assert.equal(holding.costBasisMinor, 15000);
  assert.equal(wallet.cashMinor, 25000000 - 15000);
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
  state = act(state, { type: "OWNERSHIP_CREATE_RESOLUTION", companyId: state.ownership.companies[0].id, title: "Approve a second service line", resolutionType: "CAPITAL_EXPANSION", amountMinor: 10000 });
  const restored = parseImport(createExport(state));
  assert.deepEqual(restored.ownership, state.ownership);
  assert.deepEqual(restored.finance, state.finance);
  assert.equal(validateGameState(restored).valid, true);
});

test("company double-entry ledger reconciles ownership cash and equity movements", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  const company = () => state.ownership.companies.find(item => item.id === companyId);
  const assertLedger = () => {
    const c = company();
    assert.ok(c.ledger.length >= 1);
    for (const entry of c.ledger) assert.equal(entry.lines.reduce((sum, line) => sum + line.debitMinor, 0), entry.lines.reduce((sum, line) => sum + line.creditMinor, 0));
    const account = id => c.ledgerAccounts.find(item => item.id === id).balanceMinor;
    assert.equal(account("cash"), c.cashMinor);
    assert.equal(account("shareCapital"), c.paidInCapitalMinor);
    assert.equal(account("shareholderLoans"), c.loanBalanceMinor);
    assert.equal(account("retainedEarnings"), c.retainedEarningsMinor);
    assert.equal(validateOwnership(state.ownership, state.finance).valid, true);
  };
  assertLedger();
  state = act(state, { type: "ADVANCE_TURN" }); assertLedger();
  state = act(state, { type: "OWNERSHIP_CONTRIBUTE_CAPITAL", companyId, amountMinor: 25000 }); assertLedger();
  state = act(state, { type: "OWNERSHIP_TAKE_LOAN", companyId, amountMinor: 12000 }); assertLedger();
  state = act(state, { type: "OWNERSHIP_REPAY_LOAN", companyId, amountMinor: 5000 }); assertLedger();
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 1000 }); assertLedger();
  state = act(state, { type: "OWNERSHIP_BUYBACK_SHARES", companyId, shares: 100 }); assertLedger();
  state = act(state, { type: "ADVANCE_TURN" });
  const dividend = Math.max(1, Math.floor(company().retainedEarningsMinor / 10));
  state = act(state, { type: "OWNERSHIP_PROPOSE_DIVIDEND", companyId, amountMinor: dividend });
  const resolutionId = company().resolutions[0].id;
  state = act(state, { type: "OWNERSHIP_VOTE", companyId, resolutionId, vote: "for" });
  state = act(state, { type: "OWNERSHIP_CLOSE_VOTE", companyId, resolutionId });
  assertLedger();
});

test("negotiated transfers settle between current holders and reconcile player cash and cost basis", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  const beforeCash = state.finance.accounts.find(item => item.id === "cash").balanceMinor;
  const investorCashBefore = state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor;
  state = act(state, { type: "OWNERSHIP_TRANSFER_SHARES", companyId, sellerId: "player", buyerId: "mira-chen", shares: 5000, pricePerShareMinor: 4 });
  let company = state.ownership.companies[0];
  assert.equal(state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor, investorCashBefore - 20000);
  assert.equal(company.shareholders.find(item => item.id === "player").shares, 95000);
  assert.equal(company.shareholders.find(item => item.id === "mira-chen").shares, 25000);
  assert.equal(state.finance.accounts.find(item => item.id === "cash").balanceMinor, beforeCash + 20000);
  assert.equal(validateGameState(state).valid, true);
  state = act(state, { type: "OWNERSHIP_TRANSFER_SHARES", companyId, sellerId: "mira-chen", buyerId: "player", shares: 2000, pricePerShareMinor: 4 });
  company = state.ownership.companies[0];
  assert.equal(state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor, investorCashBefore - 12000);
  assert.equal(company.shareholders.find(item => item.id === "player").shares, 97000);
  assert.equal(company.shareholders.find(item => item.id === "mira-chen").shares, 23000);
  assert.equal(validateGameState(state).valid, true);
});

test("board election uses share-weighted votes and assigns a fixed director term", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  state = act(state, { type: "OWNERSHIP_OPEN_BOARD_ELECTION", companyId, termTurns: 8 });
  const electionId = state.ownership.companies[0].elections[0].id;
  state = act(state, { type: "OWNERSHIP_VOTE_BOARD_ELECTION", companyId, electionId, candidateId: "mira-chen" });
  state = act(state, { type: "OWNERSHIP_CLOSE_BOARD_ELECTION", companyId, electionId });
  const director = state.ownership.companies[0].board.find(item => item.seat === "Director");
  assert.equal(director.holderId, "mira-chen");
  assert.equal(director.termEndsAtTurn, state.calendar.turn + 8);
  assert.equal(state.ownership.companies[0].elections[0].status, "closed");
  assert.equal(validateGameState(state).valid, true);
});

test("approved capital expansion transfers cash into a capital asset with balanced journal entries", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_CREATE_RESOLUTION", companyId, title: "Purchase production equipment", resolutionType: "CAPITAL_EXPANSION", amountMinor: 10000 });
  const resolutionId = state.ownership.companies[0].resolutions[0].id;
  state = act(state, { type: "OWNERSHIP_VOTE", companyId, resolutionId, vote: "for" });
  state = act(state, { type: "OWNERSHIP_CLOSE_VOTE", companyId, resolutionId });
  const company = state.ownership.companies[0];
  assert.equal(company.capitalAssetsMinor, 10000);
  assert.equal(company.cashMinor, 40000);
  assert.equal(company.ledger[0].kind, "CAPITAL_EXPANSION");
  assert.equal(validateGameState(state).valid, true);
});

test("elected director seats expire at the end of their fixed term", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_OPEN_BOARD_ELECTION", companyId, termTurns: 4 });
  const electionId = state.ownership.companies[0].elections[0].id;
  state = act(state, { type: "OWNERSHIP_VOTE_BOARD_ELECTION", companyId, electionId, candidateId: "player" });
  state = act(state, { type: "OWNERSHIP_CLOSE_BOARD_ELECTION", companyId, electionId });
  assert.ok(state.ownership.companies[0].board.some(item => item.seat === "Director" && item.holderId === "player"));
  for (let i = 0; i < 4; i++) state = act(state, { type: "ADVANCE_TURN" });
  assert.equal(state.ownership.companies[0].board.some(item => item.seat === "Director"), false);
  assert.equal(validateGameState(state).valid, true);
});
test("approved executive appointment resolution changes the company executive register", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  state = act(state, { type: "OWNERSHIP_CREATE_RESOLUTION", companyId, title: "Appoint Mira as operations chief", resolutionType: "EXECUTIVE_APPOINTMENT", role: "COO", candidateId: "mira-chen" });
  const resolutionId = state.ownership.companies[0].resolutions[0].id;
  state = act(state, { type: "OWNERSHIP_VOTE", companyId, resolutionId, vote: "for" });
  state = act(state, { type: "OWNERSHIP_CLOSE_VOTE", companyId, resolutionId });
  assert.equal(state.ownership.companies[0].executives.find(item => item.role === "COO").holderId, "mira-chen");
  assert.equal(validateGameState(state).valid, true);
});
test("schema v9 ownership saves gain a balanced opening company ledger during migration", () => {
  let old = found(makeGame());
  old.schemaVersion = 9;
  old.simulationVersion = "0.10.0";
  delete old.ownership.investorAccounts;
  for (const company of old.ownership.companies) {
    delete company.ledger;
    delete company.ledgerAccounts;
    delete company.ledgerSequence;
  }
  const migrated = migrateGameState(old);
  const company = migrated.ownership.companies[0];
  assert.equal(migrated.schemaVersion, 11);
  assert.equal(company.ledger.length, 1);
  assert.equal(company.ledger[0].kind, "OPENING_BALANCE");
  assert.equal(validateGameState(migrated).valid, true);
});

test("schema v8 saves migrate to schema v10 with an empty ownership subsystem", () => {
  const old = makeGame();
  old.schemaVersion = 8;
  old.simulationVersion = "0.9.0";
  delete old.ownership;
  old.finance.accounts = old.finance.accounts.filter(item => !["privateEquity", "shareholderLoans"].includes(item.id));
  const migrated = migrateGameState(old);
  assert.equal(migrated.schemaVersion, 11);
  assert.deepEqual(migrated.ownership.companies, []);
  assert.equal(validateGameState(migrated).valid, true);
});

test("Businesses workspace exposes company formation, ownership portfolio and acquisition controls", () => {
  const fresh = renderBusinessesView(makeGame());
  for (const label of ["OWNERSHIP PORTFOLIO / PHASE 10", "Found your own company", "Acquire an established company", "OWNERSHIP_ACQUIRE_TARGET", "data-ownership-form"]) assert.ok(fresh.includes(label), label);
  let companyState = found(makeGame()), companyId = companyState.ownership.companies[0].id;
  companyState = act(companyState, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  companyState = act(companyState, { type: "OWNERSHIP_APPOINT_DIRECTOR", companyId, candidateId: "mira-chen", seat: "Director" });
  const owned = renderBusinessesView(companyState);
  for (const label of ["OWNERSHIP_SELL_SHARES", "OWNERSHIP_TRANSFER_SHARES", "OWNERSHIP_OPEN_BOARD_ELECTION", "Company journal", "OWNERSHIP_APPOINT_DIRECTOR", "OWNERSHIP_REMOVE_DIRECTOR", "OWNERSHIP_PROPOSE_DIVIDEND"]) assert.ok(owned.includes(label), label);
  companyState = act(companyState, { type: "OWNERSHIP_OPEN_BOARD_ELECTION", companyId, termTurns: 8 });
  assert.ok(renderBusinessesView(companyState).includes("OWNERSHIP_VOTE_BOARD_ELECTION"));
});

test("minority acquisition records the actual stake and leaves the seller on the cap table", () => {
  let state = makeGame("independent");
  state = act(state, { type: "RECORD_INCOME", amountMinor: 2000000, category: "business-income", description: "Sale of an inherited asset" });
  state = act(state, { type: "OWNERSHIP_ACQUIRE_TARGET", targetId: "cobalt-digital-works", ownershipBps: 2500 });
  const company = state.ownership.companies[0];
  assert.equal(company.shareholders.find(item => item.id === "player").shares, 25000);
  assert.equal(company.shareholders.find(item => item.id === "seller-cobalt-digital-works").shares, 75000);
  assert.equal(state.ownership.acquisitionHistory[0].ownershipBps, 2500);
  assert.equal(state.finance.accounts.find(item => item.id === "privateEquity").balanceMinor, 462500);
  assert.equal(validateGameState(state).valid, true);
});

test("secondary share sales debit the investor wallet and realize gain in household Finance", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  const investorCashBefore = state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor;
  state = act(state, { type: "OWNERSHIP_SELL_SHARES", companyId, buyerId: "mira-chen", shares: 10000, pricePerShareMinor: 3 });
  const company = state.ownership.companies[0];
  assert.equal(company.shareholders.find(item => item.id === "player").shares, 90000);
  assert.equal(company.shareholders.find(item => item.id === "mira-chen").shares, 10000);
  assert.equal(company.outstandingShares, 100000);
  assert.equal(state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor, investorCashBefore - 30000);
  assert.equal(state.finance.accounts.find(item => item.id === "privateEquity").balanceMinor, 45000);
  assert.equal(state.finance.ledger.at(-1).kind, "EQUITY_SECONDARY_SALE");
  assert.equal(validateGameState(state).valid, true);
});

test("shareholders can be appointed to and removed from the board", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  state = act(state, { type: "OWNERSHIP_APPOINT_DIRECTOR", companyId, candidateId: "mira-chen", seat: "Director" });
  assert.equal(state.ownership.companies[0].board.some(item => item.holderId === "mira-chen" && item.seat === "Director"), true);
  state = act(state, { type: "OWNERSHIP_REMOVE_DIRECTOR", companyId, candidateId: "mira-chen" });
  assert.equal(state.ownership.companies[0].board.some(item => item.holderId === "mira-chen" && item.seat === "Director"), false);
  assert.equal(validateGameState(state).valid, true);
});

test("non-player shareholders cast deterministic votes and receive pro-rata dividends", () => {
  let state = found(makeGame()), companyId = state.ownership.companies[0].id;
  state = act(state, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  state = act(state, { type: "ADVANCE_TURN" });
  const retained = state.ownership.companies[0].retainedEarningsMinor;
  const investorCashBefore = state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor;
  const amountMinor = Math.max(1, Math.floor(retained / 10));
  state = act(state, { type: "OWNERSHIP_PROPOSE_DIVIDEND", companyId, amountMinor });
  const resolutionId = state.ownership.companies[0].resolutions[0].id;
  state = act(state, { type: "OWNERSHIP_VOTE", companyId, resolutionId, vote: "for" });
  state = act(state, { type: "OWNERSHIP_CLOSE_VOTE", companyId, resolutionId });
  const resolution = state.ownership.companies[0].resolutions[0];
  assert.equal(resolution.status, "passed");
  assert.equal(resolution.votes.some(item => item.shareholderId === "mira-chen" && item.automatic), true);
  const investorReceipt = state.ownership.companies[0].shareholders.find(item => item.id === "mira-chen").lastDividendMinor;
  assert.ok(investorReceipt > 0);
  assert.equal(state.ownership.investorAccounts.find(item => item.investorId === "mira-chen").cashMinor, investorCashBefore + investorReceipt);
  assert.equal(state.ownership.companies[0].transactions.length > 0, true);
  assert.equal(validateGameState(state).valid, true);
});


test("schema v10 saves migrate investor cash from portfolio holdings without reusing company-local wallets", () => {
  let old = found(makeGame());
  const companyId = old.ownership.companies[0].id;
  old = act(old, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 20000 });
  old.ownership.companies[0].shareholders.find(item => item.id === "mira-chen").lastDividendMinor = 1500;
  old.schemaVersion = 10;
  old.simulationVersion = "0.10.1";
  delete old.ownership.investorAccounts;
  for (const company of old.ownership.companies) {
    for (const holder of company.shareholders) delete holder.cashMinor;
  }
  const migrated = migrateGameState(old);
  const wallet = migrated.ownership.investorAccounts.find(item => item.investorId === "mira-chen");
  assert.equal(migrated.schemaVersion, 11);
  assert.equal(wallet.initialCashMinor, 25000000);
  assert.equal(wallet.cashMinor, 25000000 - 20000 + 1500);
  assert.equal("cashMinor" in migrated.ownership.companies[0].shareholders.find(item => item.id === "mira-chen"), false);
  assert.equal(validateGameState(migrated).valid, true);
});
