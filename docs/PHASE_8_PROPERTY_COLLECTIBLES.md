# Phase 8 — Property & Collectibles

## Objective

Make the Assets workspace operational. Players can acquire and manage property, finance purchases with a mortgage, earn rental income, pay operating costs and property tax, maintain condition, sell property, and build or liquidate a collection of fictional valuables.

The system continues the browser-first, local-save architecture. Listings, appraisals and all market movement are fictional simulation data. This phase does not add a world map, location progression, external listings or real-world property feeds.

## Property market

Five fictional property listings are available:

| Listing | Indicative price | Gross rent / week | Routine upkeep / week |
|---|---:|---:|---:|
| Harborview Starter Studio | 9,500 Credits | 82 Credits | 9 Credits |
| Meridian City Apartment | 14,500 Credits | 125 Credits | 15 Credits |
| Cedar Park Townhouse | 23,000 Credits | 190 Credits | 25 Credits |
| Meridian Street Retail Suite | 31,000 Credits | 275 Credits | 39 Credits |
| Northstar Income Duplex | 42,000 Credits | 360 Credits | 52 Credits |

- A player can buy each catalogue listing once per save.
- Purchases support owner-occupied or rental use.
- A financed purchase requires a minimum 20% down payment; the player can choose a larger down payment or pay in full.
- Property closing costs are 1.5% of the asking price.
- Mortgages are created as normal Banking mortgage liabilities with a 260-week term, a fictional National Union Bank rate and the existing income-based borrowing cap. The phase uses a 600 minimum credit score for property acquisition.
- Property value is re-estimated each weekly turn using deterministic, seeded movement and the current simulated market regime.
- Rental property may become vacant or receive a tenant at quarterly review. Rent posts as cash income.
- Routine upkeep is charged weekly when cash is available. Property tax is assessed quarterly. If the player cannot fund required operating costs, the cost is deferred and property condition deteriorates.
- Players can pay for additional maintenance to improve condition and its estimated valuation.
- Sale proceeds are subject to a 3% selling cost. An active mortgage must be fully settled from available cash and sale proceeds before the property can be removed from the portfolio.

## Collectibles

Five fictional categories are represented by specific catalogue items: photography, watches, art, memorabilia and collector vehicles.

- Each catalogue item can be acquired once per save.
- Purchases require cash and a separate 1.5% acquisition fee.
- Items have distinct valuation volatility, maintenance costs, risk labels and liquidity discounts.
- Weekly appraisals use deterministic, seeded price movement and the simulated market regime.
- Conservation spending improves condition and updates the estimate.
- Sale proceeds apply each item's liquidity discount to the latest estimated value.

## Accounting and reconciliation

- Property holdings use a dedicated general-ledger asset account. Collectibles use a separate asset account.
- A property purchase debits the property asset, credits the buyer's down payment to Cash and recognizes the mortgage as a Banking liability. Closing costs are a separate expense.
- A collectible purchase debits the collectible asset, credits Cash and separately records its acquisition fee as an expense.
- Changes in estimated property and collectible values post against the existing Unrealized valuation changes equity account. These estimates do not create cash flow.
- Rental income is posted to Cash and Income. Upkeep, property tax, conservation, closing and sale costs are posted as expenses.
- Property sales remove the current asset carrying value, reverse the related unrealized valuation reserve, recognize the realized result and settle the linked mortgage.
- Collectible sales remove the current carrying value, reverse the related unrealized reserve and recognize the realized result after the liquidity discount.
- The property and collectible subledgers are validated against their general-ledger asset account balances. Mortgage records must reconcile to their Banking liability accounts.

## Save compatibility

- Save schema advances from v6 to v7.
- Schema v6 saves initialize an empty property and collectible state while preserving character, finance, career, banking, markets, event history, calendar and random-generator state.
- Schema v1–v5 saves continue through the existing migration chain.
- Asset holdings, conditions, tenant status, market values, asset random-generator state and transaction history are included in local saves and JSON export/import.

## Acceptance tests

- The Assets workspace renders property listings, owned property, collectible catalogue and owned collectibles.
- Property purchase records the down payment, mortgage liability and closing costs with balanced journal entries.
- Mortgage interest and scheduled principal payments continue through the existing Banking system.
- Rental income, weekly upkeep and quarterly property tax post to the Finance ledger.
- Property and collectible appraisals change deterministically and update unrealized valuation equity without changing cash.
- Property sale requires sufficient net sale proceeds and cash to settle the mortgage and selling cost.
- Collectible resale applies the item's liquidity discount.
- Maintenance updates condition and estimated value with explicit expense entries.
- Invalid and unaffordable actions do not partially mutate state.
- Property/collectible holdings reconcile to the general ledger and mortgages reconcile to Banking.
- Schema v6 and earlier saves migrate to v7; JSON export/import preserves asset state.

## Known limitations and future extensions

- All listings, rent assumptions, institutions, appraisals, risks and liquidity assumptions are fictional.
- No real-world addresses, neighbourhoods, maps, zoning, land registration, title searches, legal due diligence, property agents or external market data.
- The property market uses simplified seeded price movement; it does not model local property cycles, construction, renovations beyond condition maintenance, building permits, insurance claims, disasters, detailed leases, deposits, tenant disputes or rental regulation.
- Mortgage terms use the existing weekly Banking model. There is no refinancing, rate reset, early-payment penalty, lender selection for property purchases or foreclosure sale workflow.
- Taxes are a simplified quarterly operating expense rather than a complete tax system.
- Collectibles do not yet have certificates, serial-number verification, provenance disputes, auctions, storage facilities, insurance claims or specialist dealer networks.
- Business premises remain personal property assets for now. Business-owned property and commercial lease accounting belong with later business-operation and ownership phases.
- Property listings are static catalogue entries; there is no generated listing inventory, bidding or negotiation.
