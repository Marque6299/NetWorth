# MOSAIC — Phase 3: Player, Household & Life Simulation

## Integrated start scenarios
A new save is created from one complete scenario record. Starting cash, employment, household composition, housing, liabilities and living costs are chosen together so the opening financial position and recurring budget are coherent.

| Scenario | Work | Household | Housing | Pressure |
|---|---|---:|---|---|
| The Meridian Newcomer | Employed | 1 | Renter | Manageable debt, modest surplus |
| The Family Provider | Employed | 3 | Family renter | Higher fixed costs and dependents |
| The Career Transition | Unemployed | 2 | Shared rental | Limited cash runway and negative monthly budget |

All values are fictional Luma (LU) game values. Amounts are integer minor units; 100 minor units = 1 LU.

## Opening accounting
Scenario creation builds a chart of accounts and posts one balanced opening transaction. Cash is debited, liabilities and opening equity are credited; opening equity is debited when liabilities exceed cash. The ledger is the sole authority for cash, debt and net worth.

## Household and employment
The player references a household containing members, relationships and dependency flags. Housing supports renting, shared rental, owned and family-home arrangements. Shared rent can store a player-specific share. Employment status and pay are selected as part of the same scenario.

## Budget and settlement
getHouseholdMonthlyBudget(state) projects gross salary less rent, living costs and scheduled debt principal payments. settleHouseholdMonth(state, { month }) posts income and obligations as one balanced ledger transaction. It rejects duplicate or out-of-order settlement and checks available cash before posting. Failed settlement does not mutate the input state.

Debt payments are principal-only. Interest, taxes, benefits, multiple earners, asset valuation, rent changes and employer payroll liquidity are deferred. Employer-side payroll funding arrives in Phase 5.

## Tests
Run npm test and npm run validate:world. Tests cover scenario composition, opening trial balance, net worth, budget, monthly settlement, duplicate settlement and unemployment cash-shortfall behavior.
