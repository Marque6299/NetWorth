# MOSAIC Simulation Architecture — Phase 2 Foundation

## Purpose

The simulation engine is the authoritative source of game outcomes. Screens and map components may request actions and display results, but they must not calculate financial truth themselves.

## Current module boundaries

| Module | Responsibility | Must not do |
|---|---|---|
| `money.js` | Integer minor-unit arithmetic, parsing and display formatting | Store currency as floating-point amounts |
| `ledger.js` | Accounts, balanced postings, balances, audit history and reversals | Read or manipulate the DOM |
| `state.js` | Versioned root save structure and stable namespaces | Contain transient UI presentation state |
| `clock.js` | Pause/resume and deterministic tick/date advancement | Run gameplay systems in an implicit order |

## Currency and precision

The world currency is Luma (LU). The simulation foundation defines 100 minor units per LU (two decimal places). All authoritative amounts are safe integers in minor units. For example, LU 12.34 is stored as 1234.

The money parser accepts decimal values with no more than two fractional digits. It rejects locale separators and excess precision instead of silently rounding. Display formatting is separate from arithmetic.

## Double-entry conventions

Every posted transaction has at least two entries. Each entry has:
- An account identifier.
- A side: `debit` or `credit`.
- A strictly positive integer amount in minor units.
- The account currency.

For each transaction:

`sum(debits) = sum(credits)`

A transaction is validated in full before it is appended. A failed transaction must not change account balances, transaction history or transaction-ID state.

Account normal-balance conventions:

| Account type | Normal balance |
|---|---|
| Asset | Debit |
| Expense | Debit |
| Liability | Credit |
| Equity | Credit |
| Income | Credit |

Balances are returned from the account's normal-balance perspective. A negative balance is permitted and remains visible; the ledger does not silently clamp it to zero.

The current implementation deliberately rejects mixed-currency entries in a single transaction. Foreign-exchange support will require explicit exchange-rate and clearing-account design rather than mixing currencies inside one posting.

## Reversals and auditability

Posted transactions are immutable. Corrections are made by posting a new transaction with debit and credit sides reversed. Reversal records retain a reference to the original transaction and a dedicated `reversalOf` identifier. The same original transaction cannot be reversed twice through the ledger API.

## Save-state structure

A new save has a schema version, save identifier, simulation clock, player slot, household/entity namespaces, ledger namespace, world progression namespace and future-system namespaces. UI state is intentionally excluded so presentation changes do not corrupt simulation saves.

The state schema is an initial contract, not yet a complete persistence format. Serialization, migrations, checksums and replay logs remain future Phase 2 work.

## Determinism boundary

The clock advances only when the state is not paused. It increments an integer tick and advances the calendar date after the configured number of ticks per day. The random seed and random-call counter are reserved in state, but a seeded PRNG and formal system tick ordering are not yet implemented.

## Tests

Run:

`npm test`

Tests currently cover:
- Money parsing, formatting, arithmetic and currency mismatch.
- Balanced posting and account normal balances.
- Atomic rejection of unbalanced transactions.
- Duplicate transaction identifiers and one-time reversals.
- Initial save-state shape.
- Paused and running simulation clock behavior.

## Explicit non-goals for this milestone

This foundation does not yet implement player wallets, household income/expenses, payroll, businesses, loans, interest, taxes, investments, market pricing, or UI financial dashboards. Those systems must be built on top of this ledger after the remaining accounting and persistence contracts are tested.
