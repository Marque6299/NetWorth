# Phase 10 — Browser Acceptance Checklist

Use the Phase 10 preview build from the open draft pull request. These are manual acceptance checks; automated tests do not replace them.

## Setup

- Start a fresh simulation and create a character with the **Independent Specialist** or **Career Switcher** profile.
- Open **Businesses**. Confirm the ownership portfolio appears above or alongside the Phase 9 management workspace.
- Record the starting household cash balance from Finance.

## A. Company formation and accounting

1. Found a company with a unique name, Technology sector, 2,500 Credits of capital and 100,000 founder shares.
2. Confirm the new company appears in the ownership portfolio with 100% founder ownership.
3. Confirm household cash decreases by exactly 2,500 Credits.
4. Confirm Finance shows the private-company investment asset increasing by 2,500 Credits.
5. Confirm company cash starts at 2,500 Credits and is not shown as household cash.
6. Try an unaffordable founding amount and a duplicate company name. Both must be rejected without changing balances.

## B. Operations, valuation and funding

1. Advance one turn. Confirm weekly operating profit is recorded and estimated equity value increases.
2. Contribute another 500 Credits. Confirm new founder shares are issued and the cap table reconciles.
3. Advance a shareholder loan of 300 Credits. Confirm household cash decreases and shareholder-loan receivables increase.
4. Repay 100 Credits from the company. Confirm household cash increases and both company debt and the household receivable decrease by 100 Credits.
5. Issue 10,000 new shares to a fictional investor. Confirm the investor appears in the cap table and founder ownership is diluted.
6. If sufficient company cash is available, sell a small number of founder shares back to the company. Confirm proceeds, remaining shares and realized gain/loss are reflected in Finance.

## C. Governance and distributions

1. Advance enough turns to accumulate retained earnings.
2. Propose a dividend amount that is within distributable retained earnings and the operating reserve.
3. Vote **for** the dividend and close the resolution.
4. Confirm the resolution passes, the player's pro-rata dividend is posted to household cash/income, and company cash and retained earnings decrease by the full distribution.
5. Open a generic shareholder resolution, cast a vote and close it. Confirm the outcome and vote totals remain visible.
6. Appoint an eligible shareholder as CEO, CFO or COO. Confirm the executive record updates.

## D. Acquisitions

1. Use Finance to record sufficient legitimate in-game income if the household cash balance is below the target asking price.
2. Acquire **Cobalt Digital Works** from the acquisition directory.
3. Confirm the company is added once, the player owns 100%, household cash decreases by the asking price and private-equity cost basis increases by the same amount.
4. Confirm the acquisition is not confused with a Phase 9 operating mandate.

## E. Phase 9 regression and persistence

1. Accept a Phase 9 operating mandate. Confirm its branch cash, inventory and manager pay remain separate from owned-company cash and equity.
2. Return to the ownership portfolio and confirm owned-company balances remain intact.
3. Export a JSON save, start or load another simulation, then import the exported save.
4. Confirm company holdings, share registers, loans, resolutions, votes, executive appointments, acquisition history and Finance ledger entries are restored.
5. Save to an IndexedDB slot, reload the browser and load the slot. Confirm the same ownership data is restored.

## F. Responsive and integrity checks

- Check the Businesses workspace at desktop, tablet and narrow mobile widths.
- Confirm forms and cap tables remain usable without horizontal page overflow.
- Confirm invalid amounts, negative share counts, unauthorized executive appointments, insufficient dividend funds and over-limit share issues are rejected.
- Confirm the original Phase 9 business controls remain usable.

## Acceptance record

Do not mark Phase 10 accepted until all applicable checks pass. Record any failed step with the browser, viewport size, action sequence and observed result.
