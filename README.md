# Networth — Capital & Consequence

Networth is a turn-based financial life simulation, economic strategy and business management game. Players begin as ordinary individuals with different backgrounds, resources, obligations and opportunities. Through work, education, saving, borrowing, investing, entrepreneurship, acquisitions and relationships, they pursue financial independence and may continue into building a business and investment empire.

This repository currently contains **Phases 1–9**: Core Shell, Simulation Core, Character & Life, Household Finance & Ledger, Employment & Education, Banking & Credit, Investment Markets, Property & Collectibles, and Business Operations. Later phases remain gated by the implementation roadmap.

## Workspaces

- **Overview** — financial command center and simulation controls.
- **Personal** — character dossier, career opportunities, job applications, employment contracts, education programs, skills, time allocation, well-being and goals.
- **Finance** — cash, bank checking/savings, fixed deposits, loans, mortgages, credit cards, credit score, investment holdings, property, collectibles, liabilities, budgets, double-entry journal, cash flow and net worth.
- **Markets** — fictional equities, government/corporate bonds, commodity benchmarks, digital assets, research indicators, market orders, watchlists, weekly pricing, dividends/coupons and portfolio performance.
- **Businesses** — company operating mandates, products and pricing, staffing, supplier orders, marketing, sales, branch finances and weekly performance (Phase 9). Ownership, equity, acquisitions and governance remain Phase 10.
- **Assets** — property listings and ownership, rental income, upkeep, taxes, mortgage-linked financing, appraisals, maintenance, collectible acquisitions, liquidity discounts and sales.
- **Network** — people, company relationships and ownership-network placeholders.
- **News** — news feed, economic events and cause-and-effect placeholders (Phase 11).
- **Reports** — financial statements, performance and forecast placeholders.

The design uses dashboards, directories, profiles, terminals, reports and relationship networks. There is no world map, geographic exploration, travel progression or multi-region unlock system.

## Phase 2 — Simulation core

- Seven-day in-game turn clock, independent of real-world time.
- Seed normalization and deterministic pseudo-random draws.
- Central action validation/resolution; invalid actions do not mutate state.
- Turn and month-boundary event log.
- Three IndexedDB save slots stored locally in the current browser profile.
- Versioned save validation and integrity checksum.
- JSON backup export and validated import.

## Phase 3 — Character & life

- Four distinct starting backgrounds: Early-Career Graduate, Career Switcher, Family Provider and Independent Specialist.
- Each profile has different education, experience, employment context, capital/debt/expense context, dependents, skills, well-being, reputation and contacts.
- Character dossier with age, background, skills, well-being and starting circumstances.
- Weekly time planner with 112 waking hours across work, study, rest, family, networking, research, side work and recreation.
- Deterministic well-being updates for health, energy, stress and happiness on turn advancement.
- Skill development through study focus, research, networking and side work.
- Measurable goals for skills, well-being and turn milestones, including lower-is-better stress goals.

## Phase 4 — Household finance & ledger

- Neutral in-game Credits, stored as integer minor units.
- Opening cash, debt and monthly budget initialized from each character profile.
- Balanced double-entry journal with account reconciliation.
- Income, expense, transfer, borrowing, principal repayment and unrealized valuation actions.
- Transfers and borrowing are excluded from income; principal repayment is not an expense; unrealized gains are not cash.
- Net worth, liquid net worth, recorded cash flow and monthly budgets.
- Schema v2 → v3 migration for existing Phase 3 saves and backups.

The monthly expense context is a budget baseline, not an automatic charge. Banking products, interest, scheduled debt service and market pricing remain later-phase systems.

## Phase 5 — Employment & education

- Six fictional job listings with role requirements, weekly salary and contracted hours.
- Seeded job applications, offer/rejection outcomes, explicit offer acceptance and resignation.
- Employment contracts, employment history, performance, experience and promotions.
- Weekly payroll posted to the existing double-entry Finance ledger.
- Salary prorated to allocated work hours; work influences performance and job-specific skill gains.
- Three education programs with tuition, prerequisites, study-hour progression, skill development and credentials.
- Education completion can unlock more advanced programs and job eligibility.
- Schema v3 → v4 migration preserves existing Phase 4 saves and initializes career state.

Employment salaries and education tuition use the existing Finance ledger. Salary is gross in-game Credits. Payroll taxes, benefits, commissions, student loans, bank products and credit scoring are not included in this phase.

## Phase 6 — Banking & credit

- Five fictional institution categories: National, Local, Microfinance, Investment and Predatory.
- Checking and savings accounts, fixed deposits, deposit interest, account fees and withdrawals.
- Personal, mortgage, business and microfinance loans with eligibility rules, amortization, interest accrual and scheduled repayment.
- Credit cards, purchase limits, interest and repayments.
- Credit score with a recorded reason for each score change.
- Dedicated ledger accounts for bank deposits, fixed deposits, loans and credit cards; bank transactions reconcile to the household double-entry ledger.
- Schema v4 → v5 migration preserves earlier saves and backups.

Bank products and rates are fictional. Deposit-insurance eligibility is disclosed, but bank failure and insurance settlement remain planned economy-system extensions.

## Phase 7 — Investment markets

- Fourteen fictional instruments across equities, government and corporate bonds, commodities and digital assets.
- Market and portfolio terminal with research descriptions, risk labels, price histories, watchlists, order entry and holdings.
- Buy/sell orders with fractional units, a 0.15% fee, partial sales and realized return accounting.
- Deterministic weekly prices, market regime/sentiment cycle, broad index and quarterly dividends/coupons.
- Unrealized market valuation remains separate from cash flow; all investment activity posts to the Phase 4 double-entry ledger.
- Schema v5 → v6 migration preserves all prior game systems and save data.

The market universe and pricing are fictional simulation data, not live quotes or investment advice.

## Run locally

Requirements: Node.js 18 or newer. There are no runtime dependencies to install.

```bash
npm run dev
```

Open `http://127.0.0.1:4173`.

## Validate

```bash
npm test
npm run check
```

GitHub Actions runs the same tests and syntax checks on pushes and pull requests to `main`.

## Technical boundaries

- Browser-first responsive interface.
- HTML, CSS and native JavaScript ES modules; no framework or third-party runtime dependency.
- Local saves use IndexedDB; saves do not sync across devices.
- Export JSON backups before clearing browser site data or moving to another device.
- The checksum detects accidental corruption; it is not cryptographic security.
- No fabricated financial balances, market prices or news are presented.

## Project documents

- [Phase 1 — Core Shell](docs/PHASE_1_CORE_SHELL.md)
- [Phase 2 — Simulation Core](docs/PHASE_2_SIMULATION_CORE.md)
- [Phase 3 — Character & Life](docs/PHASE_3_CHARACTER_AND_LIFE.md)
- [Phase 4 — Household Finance & Ledger](docs/PHASE_4_HOUSEHOLD_FINANCE.md)
- [Phase 5 — Employment & Education](docs/PHASE_5_EMPLOYMENT_AND_EDUCATION.md)
- [Phase 6 — Banking & Credit](docs/PHASE_6_BANKING_AND_CREDIT.md)
- [Phase 7 — Investment Markets](docs/PHASE_7_INVESTMENT_MARKETS.md)
- [Phase 8 — Property & Collectibles](docs/PHASE_8_PROPERTY_COLLECTIBLES.md)
- [Phase 9 — Business Operations](docs/PHASE_9_BUSINESS_OPERATIONS.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)

## Current status

**Phases 1–8 are accepted; Phase 9 is implemented and awaiting user acceptance.** Later phases remain gated by the roadmap.

 
## Phase 8 — Property & collectibles
 
- Five fictional property listings and five collectible catalogue items.
- Owner-occupied or rental property, with 20% minimum down payment, configurable higher deposits and 1.5% closing costs.
- Mortgages use the existing Banking liability and repayment system; sale requires mortgage settlement.
- Rental income, weekly upkeep, quarterly property tax, vacancies and tenant changes.
- Property valuations, condition wear and maintenance improvements.
- Collectible appraisals, condition wear, care costs and liquidity-discounted resale.
- Separate property and collectible ledger assets; deterministic valuation changes post to unrealized equity rather than cash flow.
- Purchases, upkeep, taxes, fees, rental income and sales post balanced entries to the existing Finance journal.
- Schema v6 → v7 migration preserves existing game state and initializes the new Assets subsystem.
 
Asset catalogue data, prices and appraisal assumptions are fictional. No real-world property inventory, maps or property feeds are used.

 
## Phase 9 — Business Operations
 
- Five fictional companies provide different operating mandates across consumer retail, e-commerce, digital services, business services and industrial supply.
- The player acts as an operating manager for one company-funded branch. The parent company retains the branch's capital, cash, inventory and equity.
- Three product or service lines per branch, with price controls, unit costs, stock, demand and margins.
- Staffing from one to ten employees, manager compensation, weekly payroll, rent and utilities.
- Three suppliers with different prices, shipping fees, lead times and delivery reliability.
- Prepaid purchase orders, inventory in transit, delayed deliveries and weighted-average inventory cost.
- Marketing campaigns with an expense and a four-turn demand boost.
- Deterministic weekly sales driven by pricing, player skills, side-work hours, staffing capacity, marketing and market regime.
- Separate branch ledger for cash, inventory, inventory in transit, operating payables, revenue, cost of goods sold and operating expenses.
- Manager compensation reaches household Finance only when actually paid. Company capital and inventory never count as player assets in Phase 9.
- Weekly sales, operating results, stockouts, customer satisfaction and manager performance history.
- Schema v7 → v8 migration preserves all previous systems and save data.
 
Operating companies and financial assumptions are fictional. Business ownership, equity, dividends, company formation, acquisitions and governance are reserved for Phase 10.
