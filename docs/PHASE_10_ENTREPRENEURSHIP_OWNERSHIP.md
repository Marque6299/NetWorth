# Phase 10 — Entrepreneurship, Equity, Acquisitions & Governance

## Objective

Extend Phase 9's company operating simulation into a complete ownership and control layer. The player can found a company, contribute personal capital, own and transfer equity, receive distributions, acquire stakes in existing companies, and participate in corporate governance.

The system must distinguish four concepts at all times:

1. **Ownership** — the economic claim represented by shares.
2. **Control** — voting power and governance rights attached to shares or board seats.
3. **Management** — authority to run day-to-day operations under an employment or management mandate.
4. **Value** — an estimated market or negotiated value, which is not cash until a sale or distribution settles.

Phase 9 operating mandates remain separate. Accepting a management mandate must never silently grant equity, and owning shares must not automatically grant operating authority.

## Phase 10 workstreams

### 1. Company formation

- Player can create a privately held company with a validated name, sector, business model and founding description.
- Formation requires a minimum paid-in capital contribution from household cash.
- The founder selects an initial authorized share count and issue price.
- The company starts with a traceable cash balance, share register, cap table, formation record and ownership history.
- The founder's personal cash decreases by the actual contribution; the company receives the same amount.
- No company or share record may be created if the household cannot fund the contribution.

### 2. Equity and capitalization

- Represent equity using integer shares and integer minor-unit currency values.
- Track authorized, issued and outstanding shares separately.
- Maintain a cap table by shareholder, share class and share count.
- Calculate ownership percentage from outstanding shares, not authorized shares.
- Support founder shares, new share issues and dilution.
- Validate that shareholder allocations reconcile exactly to issued/outstanding shares.
- Do not treat authorized but unissued shares as player wealth.
- Keep company cash, retained earnings and equity valuation separate from household cash.
- Maintain one portfolio-wide cash balance per non-player investor across all companies; company-local shareholder fields must never be used as the source of truth.
- Debit that balance for primary share issues and secondary/negotiated purchases; credit it for share-sale proceeds and paid dividends.

### 3. Personal investment and capital contributions

- Allow additional paid-in capital and approved shareholder loans to a player-owned company.
- Record the household cash outflow and corresponding investment/loan asset in the household ledger.
- Distinguish equity contributions from shareholder loans; only loans create a repayment claim.
- Reject transactions that would overdraw household cash or create invalid company balances.
- Support partial contributions only when the user explicitly enters the amount.

### 4. Valuation and distributions

- Provide a transparent estimated company valuation using a documented, deterministic method based on contributed capital and retained earnings. Operating performance changes retained earnings; valuation is indicative, not liquid cash or guaranteed sale proceeds.
- Give each owned company a sector operating profile with reference price, unit cost, demand, service capacity, staff wages and weekly overhead.
- Derive weekly revenue from estimated demand, market regime, player operating skills, customer satisfaction and price elasticity, capped by staffed capacity.
- Record cost of goods, payroll and overhead as operating expenses. Pay costs from company cash where possible and carry unpaid costs as operating payables without allowing company cash to go negative.
- Keep company journal entries balanced, close weekly income and expenses into retained earnings, and reconcile cash, capital assets, debt, operating payables and equity.
- Clearly label estimates and assumptions; do not imply that estimated value is guaranteed sale proceeds.
- Calculate the player's equity value from the player's share count and the current estimated per-share value.
- Support board-approved dividends/distributions subject to available distributable cash.
- Allocate distributions pro rata to eligible outstanding shares and post only settled cash to household Finance.
- Prevent distributions from using restricted or unavailable company funds.

### 5. Share transfers and secondary transactions

- Allow the player to negotiate share transfers between any existing shareholders, including player purchases and sales.
- Validate seller holdings, buyer funds, transfer quantity and agreed price.
- Update both parties' holdings atomically.
- Record transaction price, date, counterparties, shares, fees (if any), realized gain/loss and ownership history.
- Prevent negative share balances, unauthorized transfers and partial mutation on invalid actions.

### 6. Acquisitions and ownership transfers

- Provide a curated directory of fictional private and public companies with grounded share structures and acquisition eligibility.
- Support minority stake purchases and full-company acquisition proposals.
- Require sufficient household funds or an explicitly supported financing arrangement.
- Record acquisition consideration, shares acquired, resulting ownership percentage and control status.
- A proposal is not a completed acquisition until the counterparty accepts and settlement succeeds.
- Full acquisition must transfer the appropriate outstanding shares and control rights; it must not create duplicate shares or duplicate company assets.
- Keep operating mandates and acquired ownership independent.

### 7. Corporate governance

- Support shareholder voting based on eligible voting shares, deterministic investor-specific preferences, and executable capital-expansion and executive-appointment resolutions.
- Include meeting proposals with a defined voting window and clear quorum/approval rules.
- Record votes, abstentions, quorum, outcome and effective turn.
- Support a board with seats, appointment/removal rules, shareholder-elected directors and fixed director terms.
- Distinguish board authority from executive operating authority.
- Provide a basic executive structure (CEO / finance / operations) with appointment and removal actions.
- Ensure only eligible shareholders or directors can perform the relevant governance action.
- Preserve governance history for auditability.

## Accounting and integrity requirements

- Household equity investments are assets, not household expenses.
- Capital contributions reduce household cash and increase the appropriate investment asset by the same amount.
- Shareholder loans are separate receivables and must not be included in equity value.
- Dividends are income only when actually paid and received.
- Unrealized valuation changes do not create cash flow or realized income.
- Share-sale proceeds post to cash; realized gain/loss is calculated against the tracked cost basis.
- Company books and household books remain separate and reconcile independently.
- All financial amounts use integer minor units; shares use integer units.
- Investor cash is global across company holdings; no investor can spend the same balance twice by investing in another company.
- Paid investor dividends and secondary sale proceeds increase the same shared cash balance.
- Invalid actions must not partially mutate state.
- All random outcomes, if introduced, must use the existing seeded simulation generator.

## Save compatibility

- Advance the save schema from v8 to v9 for ownership, v9 to v10 for company ledgers, v10 to v11 for portfolio-wide investor cash, and v11 to v12 for company operating profiles and operating ledger accounts.
- v8 saves initialize an empty ownership subsystem; v9 saves receive an opening company-ledger entry for each existing company; v10 saves initialize shared investor balances from their existing portfolio holdings; v11 saves receive deterministic sector operating profiles and the related journal accounts.
- Earlier schema versions continue through the existing migration chain.
- New companies, cap tables, investments, shareholder loans, company journal entries and account balances, transactions, valuations, distributions, acquisition proposals, votes, board seats, executive appointments and governance history must survive IndexedDB save/load and JSON export/import.
- Import validation must reject malformed share totals, invalid ownership percentages, duplicate IDs, negative balances and broken company/household reconciliations.

## User interface

The Businesses workspace gains an ownership and entrepreneurship area without removing Phase 9 operating controls:

- Company directory and company profile.
- Found a company workflow.
- Portfolio / holdings overview and cap table.
- Capital contribution and shareholder-loan forms.
- Valuation and distribution history.
- Share transfer / sale workflow.
- Acquisition proposals and transaction status.
- Governance: shareholder meetings, voting, board and executive appointments.
- Clear separation between operating mandates, owned companies and external investments.

The Network workspace should surface ownership relationships from the same underlying records; it must not maintain a second, conflicting ownership dataset.

## Acceptance tests

### Formation and capitalization
- A valid founder can create a company and receive the correct founder shares.
- Formation debits household cash and credits company capital by the same amount.
- Insufficient funds, invalid names, invalid share counts and duplicate company IDs are rejected without mutation.
- Authorized, issued and outstanding shares reconcile.

### Ownership and accounting
- Cap-table ownership percentages reconcile to 100% across outstanding shares.
- Additional contributions and shareholder loans post to the correct household accounts.
- Investment assets and shareholder-loan receivables are included in household net worth without being counted as expenses.
- Estimated valuation changes affect unrealized value only.
- Dividend distributions reconcile company cash, shareholder allocations and household receipts.

### Transfers and acquisitions
- Share transfers update both sides atomically and preserve total outstanding shares.
- Sale proceeds, fees and realized gain/loss reconcile to household Finance.
- Minority acquisitions update holdings and voting power correctly.
- Accepted full acquisitions transfer ownership/control without duplicate shares or assets.
- Rejected or expired proposals do not alter balances or cap tables.

### Governance
- Voting power is derived from eligible voting shares and the configured share class.
- Quorum and approval thresholds are enforced.
- Duplicate votes are rejected or safely replaced according to the meeting rules.
- Board and executive actions enforce role permissions.
- Every governance outcome is recorded with its effective turn and audit history.

### Compatibility and regression
- v8 saves migrate to v9 with empty ownership state and all Phase 1–9 data preserved.
- JSON export/import preserves the full ownership, governance and investor cash state.
- A schema v10 save with an investor holding migrates to v12 with a conservative cash balance, no per-company cash fields and an initialized company operating profile.
- A schema v11 save migrates to v12 without changing an existing global investor cash balance.
- An investor who spends most of their cash in one company cannot spend it again in another company.
- Secondary investor purchases debit the buyer; negotiated sales credit sellers; settled dividends credit non-player shareholders.
- A company earns no arbitrary return merely because it has more paid-in capital; two otherwise identical operating companies with different capitalization produce the same weekly trading result.
- Changing selling price or staff count changes sales, capacity or expenses.
- Unpaid operating expenses accrue as liabilities while company cash remains non-negative.
- Weekly operating journal entries balance and reconcile to the company balance sheet and retained earnings.
- Existing Phase 9 operations, banking, markets, assets, Finance and career behavior remain unchanged.
- Deterministic seeds and action sequences produce identical ownership and governance outcomes.
- Full test suite and syntax checks pass.

### Company double-entry accounting — implemented milestone

Each owned company maintains its own journal and chart of accounts, separate from household Finance. Company cash, capital assets, share capital, shareholder-loan liabilities, operating payables and retained earnings are posted through balanced entries. Weekly operating revenue and expenses are closed into retained earnings, and the operating revenue/expense accounts return to zero after each weekly close. The journal reconciles to the company balance sheet and is persisted in saves and JSON backups. v9 company records receive a balanced opening-balance journal in schema v10. Schema v11 adds portfolio-wide investor cash accounts; legacy balances are initialized conservatively from aggregate current shareholder cost basis because prior saves did not maintain a global investor wallet. Schema v12 adds sector operating profiles and operating journal accounts for existing companies.

## Explicit exclusions

- No world map, multi-region progression or geographic unlock system.
- No real companies, real stock prices, external market APIs or real-world investment advice.
- No real-money transactions, multiplayer shareholders or online synchronization.
- No unrestricted player-authored scripting or arbitrary company code.
- No automatic conversion of a management mandate into ownership.
- No assumption that estimated valuation is liquid or guaranteed.

## Phase boundary

Phase 10 is complete only after the ownership subsystem, accounting integration, governance actions, UI, migration, automated tests and browser acceptance checks are implemented and accepted. Phase 11 remains gated until then.

 
## Implementation checkpoint — first functional milestone

The first functional milestone is implemented on branch `phase-10-ownership`:

- Versioned ownership state and schema v8 → v9 migration.
- Company formation, founder shares, authorized/issued/outstanding share reconciliation and a shareholder register.
- Household private-equity and shareholder-loan asset accounts.
- Additional capital contributions, investor share issuance/dilution, company buybacks and shareholder loans.
- Deterministic weekly operating P&L, sector-specific price/cost/demand/staffing profiles, cash-constrained expense settlement, operating payables and indicative equity valuations.
- Dividend proposals, share-weighted player voting, quorum/approval calculation and pro-rata settlement.
- Full acquisition of selected fictional companies.
- Executive appointments and generic shareholder resolutions.
- Businesses workspace ownership portfolio, company formation, acquisitions and governance controls.

### Remaining Phase 10 boundaries before acceptance

- Negotiated transfers are available between shareholders already on a company's register. New external counterparties and a full offer/escrow workflow are not included.
- NPC voting now uses deterministic investor profiles for dividend and growth preferences. These profiles still need balancing across longer simulations.
- Board elections and fixed director terms are implemented. Capital-expansion resolutions move company cash into capital assets; executive-appointment resolutions update the executive register. Broader resolution types, board succession and multi-seat election cycles remain future work.
- Owned-company operating results now depend on demand, pricing, market regime, player skills, staffing capacity, cost of goods, payroll and overhead. The current model is a deliberately small company operating simulation; full Phase 9 product/inventory/supplier/marketing integration remains future work. Phase 9 management mandates remain distinct from ownership.
- The first milestone now passes the GitHub Actions automated suite (136 tests) and JavaScript syntax checks. Cloudflare Pages preview deployment also reports success. Browser acceptance remains pending before this phase can be accepted.
