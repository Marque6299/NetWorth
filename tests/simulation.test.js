import test from "node:test";
import assert from "node:assert/strict";
import { createMoney, parseMoney, addMoney, formatMoney } from "../js/simulation/money.js";
import { Ledger } from "../js/simulation/ledger.js";
import { createInitialGameState } from "../js/simulation/state.js";
import { createSimulationClock } from "../js/simulation/clock.js";

test("money uses integer minor units and rejects excess precision", () => {
  assert.deepEqual(parseMoney("125.40"), { minorUnits: 12540, currency: "LU" });
  assert.equal(formatMoney(addMoney(parseMoney("1.10"), parseMoney("2.25"))), "LU 3.35");
  assert.throws(() => parseMoney("1.234"), RangeError);
  assert.throws(() => addMoney(createMoney(100, "LU"), createMoney(100, "USD")), RangeError);
});

test("ledger posts balanced transactions and calculates normal balances", () => {
  const ledger = new Ledger();
  ledger.createAccount({ id: "cash", name: "Cash", type: "asset" });
  ledger.createAccount({ id: "capital", name: "Owner Capital", type: "equity" });
  ledger.postTransaction({
    id: "opening-001", date: "0001-01-01", description: "Opening capital",
    entries: [
      { accountId: "cash", side: "debit", amountMinor: 100000 },
      { accountId: "capital", side: "credit", amountMinor: 100000 }
    ]
  });
  assert.equal(ledger.getBalance("cash").minorUnits, 100000);
  assert.equal(ledger.getBalance("capital").minorUnits, 100000);
  assert.equal(ledger.getTransactions().length, 1);
});

test("ledger rejects invalid transactions atomically", () => {
  const ledger = new Ledger();
  ledger.createAccount({ id: "cash", name: "Cash", type: "asset" });
  ledger.createAccount({ id: "equity", name: "Equity", type: "equity" });
  assert.throws(() => ledger.postTransaction({
    id: "bad", date: "0001-01-01", description: "Unbalanced",
    entries: [
      { accountId: "cash", side: "debit", amountMinor: 500 },
      { accountId: "equity", side: "credit", amountMinor: 400 }
    ]
  }), /Unbalanced/);
  assert.equal(ledger.getTransactions().length, 0);
  assert.equal(ledger.getBalance("cash").minorUnits, 0);
});

test("ledger prevents duplicate ids and supports reversals", () => {
  const ledger = new Ledger();
  ledger.createAccount({ id: "cash", name: "Cash", type: "asset" });
  ledger.createAccount({ id: "equity", name: "Equity", type: "equity" });
  ledger.postTransaction({ id: "opening", date: "0001-01-01", description: "Opening", entries: [
    { accountId: "cash", side: "debit", amountMinor: 900 },
    { accountId: "equity", side: "credit", amountMinor: 900 }
  ] });
  assert.throws(() => ledger.postTransaction({ id: "opening", date: "0001-01-01", description: "Duplicate", entries: [] }), /Duplicate/);
  ledger.reverseTransaction("opening", { id: "reverse-opening", date: "0001-01-02" });
  assert.equal(ledger.getBalance("cash").minorUnits, 0);
  assert.equal(ledger.getBalance("equity").minorUnits, 0);
  assert.throws(() => ledger.reverseTransaction("opening", { id: "reverse-again", date: "0001-01-03" }), /already reversed/);
});

test("initial save has stable namespaces and excludes presentation state", () => {
  const state = createInitialGameState({ saveId: "save-test", seed: 42 });
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.world.activeCityId, "meridian");
  assert.deepEqual(state.ledger.transactions, []);
  assert.equal(state.simulation.seed, 42);
  assert.equal("ui" in state, false);
});

test("simulation clock pauses and advances deterministically", () => {
  const initial = { date: "0001-01-01", tick: 0, ticksPerDay: 2, paused: true };
  const clock = createSimulationClock(initial);
  assert.equal(clock.advance().tick, 0);
  const running = clock.resume(initial);
  const tick1 = clock.advance(running);
  assert.equal(tick1.date, "0001-01-01");
  const tick2 = clock.advance(tick1);
  assert.equal(tick2.date, "0001-01-02");
  assert.equal(tick2.tick, 2);
});
