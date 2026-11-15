# MOSAIC Simulation Architecture — Phase 2

## Purpose and authority

The simulation engine is the authoritative source of game outcomes. Screens and map components may request actions and display results, but they must not calculate financial truth themselves. Domain modules must remain usable in Node tests without a browser or DOM.

## Module map

| Module | Responsibility |
|---|---|
| `money.js` | Integer-minor-unit money creation, parsing, arithmetic and formatting |
| `ledger.js` | Account chart, balanced posting, balances, trial balance, reversals and ledger snapshots |
| `state.js` | Canonical versioned root state for a save |
| `clock.js` | Simple pause/resume and tick/date utility |
| `random.js` | Stateless deterministic random draws with explicit state progression |
| `engine.js` | Ordered system phases, event registration, scheduling and tick execution |
| `replay.js` | Event-schedule journal and deterministic replay from a baseline |
| `persistence.js` | Save envelope, canonical serialization, checksum and schema migration |
| `index.js` | Public module exports |

## Currency and precision

The world currency is Luma (LU). The simulation foundation defines 100 minor units per LU (two decimal places). LU is a game currency code, not an ISO 4217 currency. Other three-letter uppercase currency codes may be represented for future testing/integration, but one transaction cannot mix currencies.

All authoritative amounts are safe integers in minor units. For example, LU 12.34 is stored as 1234. Parsing rejects excess decimal places, separators, non-finite values and amounts outside safe-integer precision. Arithmetic throws on overflow rather than silently losing precision. Display formatting is separate from arithmetic.

## Double-entry accounting

Every posted transaction has at least two entries. Each entry contains an account identifier, a debit/credit side and a strictly positive integer amount in minor units. The account determines the entry currency.

For every transaction:

`sum(debits) = sum(credits)`

The full transaction is validated before it is appended. Failed posting must not alter balances, history or transaction-ID state.

Normal-balance conventions:

| Account type | Normal balance |
|---|---|
| Asset | Debit |
| Expense | Debit |
| Liability | Credit |
| Equity | Credit |
| Income | Credit |

Balances are returned from the account's normal-balance perspective. Negative balances remain visible; they are not clamped to zero. Account hierarchy requires an existing parent and matching currency. The current model uses parent-child grouping, not automatic roll-up posting: parent balances are not implicitly summed from child balances.

The ledger rejects mixed-currency transactions. Foreign exchange will require explicit exchange rates, gain/loss treatment and clearing-account postings.

### Reconciliation and reversals

The trial balance converts each account's normal balance into debit/credit columns and reports totals per currency. A correctly posted ledger must have equal debit and credit totals in each currency.

Posted transactions are immutable. Corrections use a new transaction with exact inverse entries, a reference to the original transaction and a dedicated `reversalOf` identifier. The ledger validates the inverse and prevents a second reversal of the same original transaction.

Ledger snapshots serialize account definitions and ordered transaction history. Restoring a snapshot rebuilds the ledger by replaying every posting through the same validations; malformed or unbalanced history is rejected.

## Determinism and tick order

The simulation state stores integer tick and current date, pause flag and ticks-per-day, seed and random-call counter, and event sequence counter.

Random draws are stateless functions of the seed and call counter. Each draw returns both the value and updated counter; callers must store the updated state. This makes random progression explicit and reproducible. System handlers must not use `Math.random()`, wall-clock time or unrecorded external inputs for authoritative decisions.

The scheduler executes a tick in this order:
1. Increment tick and advance the simulation date when the configured day boundary is reached.
2. Process due scheduled events ordered by target tick, priority, then insertion sequence.
3. Execute registered systems ordered by phase, numeric order, then stable system ID.

System phases are: world, household, employment, business, markets, government and finalize. Event handlers and system updates must return the next state object. They should be deterministic and avoid hidden side effects.

## Replay contract

A replay log stores a known initial state and the ordered schedule operations that were issued from it. Replaying requires the same registered event handlers and deterministic system implementations. The replay engine re-schedules events at the same simulation tick and advances to the requested target tick.

The current replay log covers scheduled events. It does not yet capture arbitrary user commands, external API responses, nondeterministic browser inputs or code-version hashes. Those must be added before long-term cross-version replay or authoritative multiplayer use.

## Save format and migration

Saves use a JSON envelope containing format identifier and version, canonicalized game state, and an FNV-1a checksum of the canonical state payload.

The loader verifies the checksum before migration. Schema v1 migrates to schema v2 by adding the deterministic event sequence counter and ensuring the event queue exists. Unknown schemas and malformed saves are rejected.

The checksum is for accidental-corruption detection only. It is not cryptographic authentication, encryption or anti-cheat protection. Do not store secrets in browser saves.

## Tests and commands

Use Node.js 18 or newer:

`npm test`

`npm run validate:world`

The test suite covers money precision and overflow; purchases, sales/receivables, expenses, loan proceeds and principal repayments; account hierarchy; atomic rejection; reversals; trial-balance reconciliation; ledger snapshots; save migration and corruption detection; deterministic random draws; event ordering; paused ticks; and replay.

## Deferred systems

Phase 2 does not implement player wallets, payroll rules, household budgets, business operations, interest accrual, taxation, investment valuation, market pricing or UI financial dashboards. These systems must post financial effects through the ledger and run through the deterministic scheduler in later phases.
