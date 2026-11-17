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

### 3. Personal investment and capital contributions

- Allow additional paid-in capital and approved shareholder loans to a player-owned company.
- Record the household cash outflow and corresponding investment/loan asset in the household ledger.
- Distinguish equity contributions from shareholder loans; only loans create a repayment claim.
- Reject transactions that would overdraw household cash or create invalid company balances.
- Support partial contributions only when the user explicitly enters the amount.

### 4. Valuation and distributions

- Provide a transparent estimated company valuation using a documented, deterministic method based on contributed capital, retained earnings and operating performance where available.
- Clearly label estimates and assumptions; do not imply that estimated value is guaranteed sale proceeds.
- Calculate the player's equity value from the player's share count and the current estimated per-share value.
- Support board-approved dividends/distributions subject to available distributable cash.
- Allocate distributions pro rata to eligible outstanding shares and post only settled cash to household Finance.
- Prevent distributions from using restricted or unavailable company funds.

### 5. Share transfers and secondary transactions

- Allow the player to sell or transfer shares to named fictional counterparties.
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

- Support shareholder voting based on eligible voting shares.
- Include meeting proposals with a defined voting window and clear quorum/approval rules.
- Record votes, abstentions, quorum, outcome and effective turn.
- Support a board with seats, appointment/removal rules and board resolutions.
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
- Invalid actions must not partially mutate state.
- All random outcomes, if introduced, must use the existing seeded simulation generator.

## Save compatibility

- Advance the save schema from v8 to v9.
- v8 saves initialize an empty ownership subsystem while preserving every existing subsystem and historical record.
- Earlier schema versions continue through the existing migration chain.
- New companies, cap tables, investments, shareholder loans, transactions, valuations, distributions, acquisition proposals, votes, board seats, executive appointments and governance history must survive IndexedDB save/load and JSON export/import.
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
- JSON export/import preserves the full ownership and governance state.
- Existing Phase 9 operations, banking, markets, assets, Finance and career behavior remain unchanged.
- Deterministic seeds and action sequences produce identical ownership and governance outcomes.
- Full test suite and syntax checks pass.

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
- Deterministic weekly operating-profit accrual and indicative equity valuations.
- Dividend proposals, share-weighted player voting, quorum/approval calculation and pro-rata settlement.
- Full acquisition of selected fictional companies.
- Executive appointments and generic shareholder resolutions.
- Businesses workspace ownership portfolio, company formation, acquisitions and governance controls.

### Known boundaries before Phase 10 acceptance

- Share transfers between arbitrary shareholders and minority-stake acquisition offers are not implemented yet.
- NPC shareholders do not submit autonomous votes; the current governance milestone records the player's share-weighted vote and applies the configured quorum/majority rule.
- Generic non-dividend resolutions are recorded and voted on but do not yet trigger their corresponding corporate action.
- Weekly operating profit is a deterministic abstraction based on paid-in capital and character operating/management skills; it is not yet connected to the detailed Phase 9 branch ledger.
- The first milestone now passes the GitHub Actions automated suite (132 tests) and JavaScript syntax checks. Cloudflare Pages preview deployment also reports success. Browser acceptance remains pending before this phase can be accepted.
