# Networth — Capital & Consequence

Networth is a turn-based financial life simulation, economic strategy and business management game. Players begin as ordinary individuals with different backgrounds, resources, obligations and opportunities. Through work, education, saving, borrowing, investing, entrepreneurship, acquisitions and relationships, they pursue financial independence and may continue into building a business and investment empire.

This repository currently contains **Phases 1–6**: Core Shell, Simulation Core, Character & Life, Household Finance & Ledger, Employment & Education, and Banking & Credit. Later phases remain gated by the implementation roadmap.

## Workspaces

- **Overview** — financial command center and simulation controls.
- **Personal** — character dossier, career opportunities, job applications, employment contracts, education programs, skills, time allocation, well-being and goals.
- **Finance** — cash, bank checking/savings, fixed deposits, loans, credit cards, credit score, investment valuation, liabilities, budgets, double-entry journal, cash flow and net worth.
- **Markets** — instrument directory, research, orders and holdings placeholders (Phase 7).
- **Businesses** — company directory, business operations and ownership placeholders (Phases 9–10).
- **Assets** — asset portfolio, property and collectibles placeholders (Phase 8).
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

## Phase 6 — Banking & credit\n\n- Five fictional institution categories: National, Local, Microfinance, Investment and Predatory.\n- Checking and savings accounts, fixed deposits, deposit interest, account fees and withdrawals.\n- Personal, mortgage, business and microfinance loans with eligibility rules, amortization, interest accrual and scheduled repayment.\n- Credit cards, purchase limits, interest and repayments.\n- Credit score with a recorded reason for each score change.\n- Dedicated ledger accounts for bank deposits, fixed deposits, loans and credit cards; bank transactions reconcile to the household double-entry ledger.\n- Schema v4 → v5 migration preserves earlier saves and backups.\n\nBank products and rates are fictional. Deposit-insurance eligibility is disclosed, but bank failure and insurance settlement remain planned economy-system extensions.\n\n## Run locally

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
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)

## Current status

**Phases 1–5 are accepted; Phase 6 is implemented and awaiting user acceptance.** Later phases remain gated by the roadmap.
