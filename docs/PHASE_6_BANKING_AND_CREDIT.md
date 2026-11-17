# Phase 6 — Banking & Credit

## Objective

Introduce financial institutions, deposit products, fixed deposits, lending, credit cards, credit scoring, interest and bank charges. All monetary effects post to the existing Phase 4 double-entry Finance ledger; banking records are a product subledger, not a second wallet.

## Institution directory

Five fictional institution categories are represented:

| Category | Institution | Positioning | Deposit APR | Loan APR | Weekly fee |
|---|---|---|---:|---:|---:|
| National | National Union Bank | Broad retail bank | 1.80% | 10.50% | 2.50 Credits |
| Local | Meridian Community Bank | Community and relationship banking | 2.40% | 12.50% | 1.50 Credits |
| Microfinance | Harbor Microfinance | Small-ticket and microbusiness finance | 3.00% | 18.50% | 1.00 Credits |
| Investment | Aster Investment Bank | Secured and specialist financing | 1.00% | 9.00% | 5.00 Credits |
| Predatory | Rapid Cash Lenders | Emergency credit with severe pricing | 0.00% | 48.00% | 15.00 Credits |

Rates and providers are fictional simulation parameters, not real financial offers. The institution cards also disclose relative stability and whether the institution participates in the simulated deposit-insurance program. National and Local deposits have a maximum aggregate insured claim of 25,000 Credits per institution; Microfinance, Investment and Predatory deposits are uninsured in this phase.

## Deposit products

- Open checking or savings accounts with an initial cash deposit.
- Each bank account has a dedicated asset account in the general ledger. Opening a deposit moves value from Cash to the bank asset; it does not create income or change net worth.
- Savings accounts earn weekly interest at the institution's annual deposit rate divided by 52, rounded down to integer minor units.
- Checking accounts incur the institution's account fee once every four turns (the simulation's monthly approximation), provided the account has sufficient funds.
- Withdrawals move bank deposits back to Cash and are rejected when the account balance is insufficient.
- Fixed deposits can be funded from an open checking or savings account for 4, 8, 12, 26 or 52 weeks. The simulated fixed-deposit rate is the institution deposit APR plus 2.50 percentage points. Principal and simple interest are released to Cash at maturity. There is no early-withdrawal action in this phase.

## Lending and repayment

Four loan products are available:
- Personal loan — up to 52 weeks, minimum score 540.
- Mortgage loan — up to 260 weeks, minimum score 640; collateral description required.
- Business loan — up to 156 weeks, minimum score 620; collateral description required.
- Microloan — up to 26 weeks, minimum score 500.

Applications check institution availability, credit score, requested term, secured-loan collateral and an income-based principal ceiling. Predatory lender emergency advances are capped at 3,000 Credits. Approved loans disburse immediately in this first-pass model.

- APR is institution pricing, with an additional 2.50 percentage points when the credit score is below 620.
- A fixed weekly amortizing payment is calculated at origination.
- Interest accrues weekly against outstanding principal and is posted as Interest Expense with a corresponding increase to the loan liability.
- Scheduled payments are automatically attempted each week. Cash pays accrued interest first and principal second.
- A missed payment lowers the credit score by 12 points. Four consecutive missed payments mark the loan as defaulted and lower the score by a further 45 points.
- A loan that is fully repaid improves the score by 8 points.
- Loan principal is never income; principal repayment is never an expense. Interest is an expense.

The optional manual loan-payment form allows an additional or partial payment against the outstanding balance.

## Credit cards

- Eligible characters can request one card per issuer, subject to credit score and an income-based credit limit.
- Purchases increase the card liability and post an expense; they do not reduce cash at the moment of purchase.
- Card interest accrues weekly at the issuer's loan APR plus 5 percentage points.
- Payments reduce the card liability and cash. Card purchases and interest are included in recorded expenses and net cash flow.
- Credit use cannot exceed the available limit at the time of purchase.

## Credit score

The simulated score ranges from 300 to 850. It starts from a baseline of 600, adjusted by half the character's starting reputation. Score changes are recorded with the turn and reason:
- New card facility: +2.
- Recorded card payment: +2.
- Scheduled loan payment: +2.
- Fully repaid loan: +8.
- Missed loan payment: −12.
- Loan default: −45.

Product minimum scores and the income-based lending cap make borrowing access depend on the character's financial position. This is an explainable first-pass score, not a real-world credit bureau model.

## Accounting and save compatibility

- Bank deposit accounts, fixed deposits, loans and cards each map to dedicated general-ledger accounts.
- Deposits and withdrawals are asset transfers.
- Loan proceeds debit Cash and credit a loan liability.
- Interest income and interest expense post to the appropriate income/expense accounts.
- Card purchases debit expense and credit card liability.
- Every banking journal entry balances and product balances are reconciled to their ledger accounts during save validation.
- The schema advances from v4 to v5. Migration preserves character, career, education, finance ledger, budgets, calendar, event history and RNG state, and initializes an empty banking profile with a starting credit score.
- Schema v1–v4 backups remain importable after checksum verification and migration.

## Acceptance tests

- All five institution categories appear with fictional rates and product details.
- Checking/savings account opening transfers cash into a separate bank asset without changing net worth or income.
- Savings interest and checking fees post to the ledger and reconcile.
- Fixed deposits lock funds, mature on the correct turn and release principal plus interest.
- Loan applications enforce score, product, term, collateral, income and lender limits.
- Loan disbursement increases cash and liabilities equally, never income.
- Weekly interest accrual, amortization, missed payments, default and score changes are deterministic and logged.
- Credit-card purchases, interest and payments update the card liability and expenses correctly.
- Invalid account, loan, deposit and card actions do not mutate state.
- v4 saves and backups migrate to v5 without losing Phase 5 or earlier data.
- JSON export/import preserves all banking and finance records.

## Known limitations and planned extensions

- Institution rates and providers are static; there is no central-bank policy or changing market rate feed.
- Deposit insurance eligibility and coverage are disclosed, but bank insolvency, liquidity runs and insurance-claim settlement are not yet simulated. These require the interconnected institution/economy event layer and are planned for the later economy/news work.
- Bank fees are a simple four-turn monthly approximation, not a date-specific billing calendar.
- Secured-loan collateral is recorded as a description; it is not yet linked to a separately owned property asset or repossession workflow.
- Credit cards do not yet have statement cycles, minimum due dates, grace periods, cash advances or late fees.
- Loans have no refinancing, restructuring, early payoff penalty, co-signers, variable rates or negotiated terms.
- There is no separate student-loan product yet.
- Credit scoring is a transparent prototype, not a bureau-grade score.
- No real-world currency, rates or financial institution data is used.
