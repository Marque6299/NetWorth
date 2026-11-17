# Phase 9 — Business Operations

## Objective

Make the Businesses workspace an operational management simulation. The player can accept a management mandate from an established fictional company and run one company-funded branch. They set product or service prices, staffing, marketing and supplier orders; weekly sales, inventory, payroll, operating costs and performance are simulated.

Phase 9 deliberately provides operating authority without ownership. The parent company supplies branch capital and retains the branch's cash, inventory and equity. The player's personal income is limited to manager compensation actually paid from the branch. Company formation, equity ownership, dividends, acquisitions, shareholders and governance are reserved for Phase 10.

## Company directory and operating mandates

Five fictional companies offer different business models:

| Company | Operating unit | Business model |
|---|---|---|
| Meridian Retail Group | Meridian Essentials Market | Consumer retail |
| Brightline Commerce | Brightline Home & Lifestyle | Online retail |
| Cobalt Insights | Cobalt Digital Studio | Digital services |
| Northstar Services | Northstar Client Services | Business services |
| Aster Industrial | Aster Industrial Supply | Industrial supply |

Each mandate has skill requirements, opening working capital, a product/service portfolio, a starter team, weekly premises/utilities expenses and a fixed manager compensation contract.

Only one mandate can be active at a time. A player may end a mandate and accept another. Completed mandate summaries remain in the player record. Ending a mandate returns all remaining company cash, stock and obligations to the parent company; it does not pay out business capital to the player.

## Operating controls

- **Products and pricing:** each branch has three product or service lines with a reference price, wholesale/delivery cost, stock, demand and gross margin. The manager can update selling prices within an allowed range.
- **Staffing:** the manager can set the branch team between one and ten employees. Staffing changes affect future weekly payroll and sales capacity.
- **Suppliers:** Metro Wholesale, Harbor Trade Supply and Rapid Stock Partners offer different unit pricing, shipping fees, lead times and reliability.
- **Purchase orders:** stock orders are paid from the branch's operating cash when placed. Goods are recorded as inventory in transit and transfer to stock on delivery. Supplier delays can move delivery back by a week, up to two times.
- **Marketing:** a funded campaign is charged immediately and applies a demand boost for four turns.
- **Weekly sales:** demand is affected by price positioning, the player's Sales, Management and Operations skills, time allocated to side work, marketing, the market regime and seeded randomness. Staff capacity and available inventory cap units sold.
- **Operating performance:** each week records sales revenue, cost of goods sold, operating expenses, operating result, units sold, stockouts, customer satisfaction and manager score.
- **Management commitment:** at least eight hours in the weekly side-work allocation is recommended. Lower allocation reduces demand and manager performance.

All catalogue entries, prices, demand, costs, wages, suppliers and market effects are fictional simulation assumptions.

## Separate company books and household Finance

A managed branch keeps its own double-entry ledger. Branch books include:

- Operating cash, inventory on hand and inventory in transit.
- Parent-company operating capital.
- Sales revenue and cost of goods sold.
- Staff payroll and manager payroll.
- Rent, utilities, marketing and supplier delivery expenses.
- Operating payables.

Inventory is valued at a weighted average unit cost when new stock is received. Sales debit branch cash and credit sales revenue. Cost of goods sold debits expense and reduces inventory. Payroll and operating costs are accrued to payables, then settled from available branch cash in priority order. Unpaid amounts remain as liabilities; branch cash is never allowed to become negative.

Manager compensation is credited to household Finance only when the branch actually pays it. Business cash and inventory are not included in the player's personal net worth during Phase 9. There are no personal business assets, dividends, ownership stakes or profit distributions.

The business subledger is validated independently: cash, inventory, inventory in transit and payables must reconcile to their respective ledger accounts. Journal entries must balance.

## Save compatibility

- Save schema advances from v7 to v8.
- Schema v7 saves initialize an empty business state while preserving character, finance, career, banking, markets, property, collectibles, event history, calendar and random-generator state.
- Schema v1–v6 saves continue through the existing migration chain.
- Active mandates, branch books, supplier purchase orders, stock, staffing, payables, performance history, business random state and mandate archive are included in local saves and JSON export/import.

## Acceptance tests

- The Businesses workspace displays the five fictional company mandates and checks character skill requirements.
- Accepting a mandate initializes a company-funded branch and does not change household cash or personal net worth.
- Sales, cost of goods sold, inventory reduction, staff payroll, manager payroll, rent and utilities reconcile to the branch ledger.
- Only manager compensation actually paid increases personal household cash and income.
- Price and staffing decisions update the branch's operating model.
- Supplier orders debit branch cash, create inventory in transit and deliver after the selected lead time; delayed deliveries remain deterministic.
- Marketing expense is recorded and the campaign temporarily changes demand.
- Weekly sales and manager performance are reproducible for identical seeds and action sequences.
- Low side-work allocation reduces management effectiveness.
- Unpaid branch obligations remain visible and branch cash never becomes negative.
- Ending a mandate archives its performance without transferring company assets to the player's household.
- Invalid operations do not partially mutate game state.
- Schema v7 and earlier saves migrate to v8; JSON export/import preserves active mandate and branch books.

## Known limitations and Phase 10 boundary

- Company directory, suppliers, product/service lines, prices and demand are fictional and static.
- The initial operating contract grants management authority over one branch. Multi-branch management and additional operating mandates are not simultaneous.
- Product and service capacity are represented by stock units using a common inventory workflow; complex service delivery, project scheduling and billable employee utilization are simplified.
- Demand uses deterministic weekly assumptions; there is no external customer simulation, live competitor pricing, contracts, credit terms, tax treatment, returns, fraud, spoilage or detailed logistics.
- Branch budgets are company-funded; no owner contributions, personal investment, equity shares, dividends, cap tables, mergers, acquisitions or governance actions are available.
- Phase 10 introduces entrepreneurship, equity ownership, acquisition and corporate governance mechanics.
