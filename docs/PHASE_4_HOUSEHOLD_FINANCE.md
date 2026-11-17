# Phase 4 — Household Finance & Ledger

## Objective

Turn the Finance workspace into the authoritative household financial record. Opening profile circumstances become posted opening balances. Accounts, liabilities, budgets, cash flow, net worth and journal history are derived from a balanced double-entry ledger.

## Monetary model

- Internal amounts are integer minor units (100 units per displayed Credit). Floating-point arithmetic is not used for posted money.
- The display currency is the neutral in-game unit **Credits** (CREDITS), not PHP, USD or a claim about a real-world exchange rate.
- User-entered amounts accept up to two decimal places and are converted to integer minor units before action validation.
- The interface formats values with two decimal places.

## Opening balance conversion

When a character is created, Phase 3 profile context initializes:
- Cash asset equal to the profile's starting capital.
- Opening personal debt liability equal to the profile's starting debt.
- Opening net position equity as the balancing amount (which may be negative).
- A monthly household budget equal to the profile's monthly expense context.

This conversion happens once at character creation. The starting figures are not added again later. For an existing schema-v2 Phase 3 save, migration creates the same opening journal entry using the saved character's original starting context and current in-game date/turn. Existing life data, calendar, seed, event log and action count are preserved.

The monthly expense context is a budget/planning baseline only. It is not posted as an expense or automatically deducted.

## Chart of accounts

The initial chart contains:
- Cash (asset)
- Savings (asset)
- Investment holdings (asset valuation)
- Opening personal debt (liability)
- Opening net position (equity)
- Income (income)
- Household expenses (expense)
- Unrealized valuation changes (equity)

Accounts retain a displayed balance, and the validator independently recomputes every account balance from the complete journal to ensure reconciliation.

## Journal rules

Each posted journal entry has one or more debit and credit lines, and total debits must equal total credits. Journal entries are append-only through the available actions; this phase does not expose editing or deletion of posted entries. Corrections will use reversal entries in a later enhancement.

Accounting treatment:
- Income: debit cash, credit income.
- Expense: debit expense, credit cash.
- Transfer: debit destination asset, credit source asset. It is not income or expense.
- Borrowing: debit cash, credit loan liability. Loan proceeds are not income.
- Principal repayment: debit loan liability, credit cash. Principal is not an expense.
- Unrealized gain: debit investment asset, credit unrealized valuation equity. It does not increase cash.
- Unrealized loss: debit unrealized valuation equity, credit investment asset. It does not reduce cash.
- Budget updates change planning limits only; they do not create ledger transactions.

Interest accrual, scheduled repayment, fees, taxes, account opening/closing and reversal workflows are not yet implemented.

## Metrics

- Total assets = sum of asset account balances.
- Total liabilities = sum of liability account balances.
- Net worth = total assets − total liabilities.
- Liquid net worth = cash + savings − total liabilities.
- Recorded income and expenses are account balances in the journal.
- Recorded net cash flow = posted income − posted expenses. Transfers, borrowing, debt principal repayment and unrealized valuation changes are excluded.
- Budgets are monthly limits; no automatic spending or rollover is implied.

## Actions

- Record income.
- Record household expense (rejected if cash is insufficient).
- Transfer between cash and savings (rejected if source funds are insufficient).
- Record loan proceeds.
- Repay loan principal (cannot exceed recorded outstanding principal).
- Record unrealized investment gain or loss (loss cannot exceed recorded investment value).
- Create or update category budgets.

Every action is validated before copy-on-write state mutation. A rejected action leaves the source game state unchanged.

## Save schema and compatibility

The save schema is now version 3. Migration paths:
- Schema v1 → v2: add the Phase 3 life container.
- Schema v2 → v3: initialize finance as null for a save without a character, or create opening balances from the existing character's saved starting context.
- New JSON backups use schema v3. Schema v1 and v2 backups remain importable after checksum verification and validation.
- Finance data is validated on save and import. Every journal entry must balance and every account balance must reconcile to the journal.

## Acceptance tests

- Opening balances and profile monthly budget match the selected starting profile.
- Phase 3 schema-v2 saves migrate without losing character, goals, calendar or event history.
- Every posted entry balances and account balances reconcile.
- Transfers do not change income, expenses, net worth or cash flow.
- Loan proceeds do not count as income; liabilities increase by the same amount as cash.
- Principal repayment reduces cash and liability equally and is not an expense.
- Unrealized gains/losses affect investment value and net worth, never cash or cash flow.
- Income and expense affect cash flow; net worth is assets minus liabilities.
- Overspending, excessive repayment, invalid transfers and malformed budgets are rejected without partial mutation.
- JSON export/import preserves Phase 4 data and schema migration behavior.

## Known limitations

- Employment income and payroll are now integrated by Phase 5; this phase defines the underlying household ledger.
- No bank products, interest rates, credit scoring, scheduled debt service or interest accrual; those belong to Phase 6.
- Investment valuation is a controlled manual simulation action until Phase 7 markets exist; it is not a live market price.
- Budgets are planning limits only; budget-versus-actual category reporting and recurring expense automation remain future work.
- No real-world currency conversion or exchange rates.
- IndexedDB load/save still requires browser acceptance testing. Automated tests validate state, migration and serialization contracts, not a live browser storage engine.
