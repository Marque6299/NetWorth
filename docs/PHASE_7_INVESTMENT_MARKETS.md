# Phase 7 — Investment Markets

## Objective

Turn the Markets workspace into an operational investment terminal. Characters can research and trade fictional equities, government and corporate bonds, commodity benchmarks and digital assets. Weekly price changes, portfolio valuation, income distributions and realized returns post to the existing double-entry Finance ledger.

## Investment universe

Fourteen fictional instruments are listed:

| Asset class | Instruments | Risk profile |
|---|---|---|
| Equities | Northstar Services (NSTR), Cobalt Insights (CBLT), Meridian Retail Group (MRDN), Aster Industrial (ASTR) | Medium to high |
| Government bonds | National Government 5Y (NGB5), National Infrastructure 10Y (NGB10) | Low |
| Corporate bonds | Cobalt Corporate 4Y (CBT4), Meridian Retail 3Y (MRD3) | Medium |
| Commodities | Gold Benchmark (GOLD), Energy Basket (ENER), Agriculture Basket (AGRI) | Medium to high |
| Digital assets | Bitcoin Index (BIT), Ether Network Token (ETHR), Nova Utility Token (NOVA) | Very high to extreme |

The directory contains fictional descriptions, sectors, risk labels, research-quality indicators, prices and annual distribution yields. These are simulation instruments, not real securities, exchanges, issuers or investment recommendations.

## Orders and portfolio

- Market buy and sell orders execute immediately at the current simulated instrument price.
- Quantities support fractional units to four decimal places.
- Each order incurs a 0.15% transaction fee, rounded up to the next minor unit.
- Buy orders are rejected if cash cannot cover purchase value and fee.
- Sell orders cannot exceed the available position.
- Watchlist selection is saved with the simulation.
- Portfolio holdings track quantity, acquisition cost basis, current market value and unrealized profit/loss.
- Partial sales allocate cost basis and carrying value proportionally. Remaining positions continue to be marked to market.
- Transactions are recorded in both the market transaction subledger and the general Finance journal.

## Market simulation

- Each instrument has a distinct volatility, drift, sector and distribution yield.
- A seeded deterministic random generator updates prices once per weekly turn. The same seed and action sequence produce the same price path.
- Price histories retain up to 53 weekly observations for lightweight trend visualization.
- A broad market index summarizes the average simulated instrument movement.
- Every 13 turns, the market regime and sentiment are refreshed among Expansion, Slowdown, Recovery and Contraction. Regime and sentiment influence the following weekly price drift.
- Market index and cycle changes are recorded in the event log.
- Equity dividends and bond coupons are paid every 13 turns using the instrument's annual yield and current holding value. They post as cash income.

The market model is deliberately transparent and deterministic. It does not connect to external quotes, real-world exchange APIs or live market data.

## Accounting treatment

- Purchases debit the existing Investment holdings asset and credit Cash. Trading fees are separate expenses.
- Weekly price increases debit Investment holdings and credit Unrealized valuation changes (equity).
- Weekly price decreases debit Unrealized valuation changes and credit Investment holdings.
- Unrealized gains/losses affect assets and net worth, not cash flow.
- Dividends and coupons debit Cash and credit Income.
- Sales remove the sold carrying value from Investment holdings, return gross proceeds to Cash, reverse the sold portion of the unrealized equity reserve, and recognize realized gain or loss in income/expense. Trading fees are recorded separately.
- The general Finance journal remains authoritative. Market positions are a subledger and are validated against the general investment asset balance.
- All posted market journal entries are balanced and account balances reconcile through the existing finance validator.

## Save compatibility

- Save schema advances from v5 to v6.
- Schema v5 saves initialize a market state while preserving character, career, education, banking, finance, event history, calendar and RNG state.
- Earlier schema v1–v4 migrations continue through the existing migration chain.
- Market prices, RNG state, holdings, watchlist, price history and transaction history are included in local saves and JSON export/import.

## Acceptance tests

- Market directory includes equities, government bonds, corporate bonds, commodities and digital assets.
- Buy orders transfer cash to investments and separately record transaction fees.
- Weekly price movement is deterministic and posts unrealized valuation changes without changing cash flow.
- Partial and full sales preserve portfolio accounting and recognize realized profit/loss.
- Dividends and bond coupons are credited as cash income on the simulated quarterly schedule.
- Insufficient cash, invalid quantities and excess sales are rejected without state mutation.
- Watchlist changes do not alter finance balances.
- Market positions reconcile with the general investment asset and all journal entries balance.
- v5 and earlier saves migrate to v6; export/import preserves market state.

## Known limitations and later extensions

- No real-world security prices, live quote feeds, broker APIs, external news or real currency conversions.
- The listed companies and instruments are fictional; the market universe is static in this phase.
- No IPO subscription process, stock splits, dilution, M&A, delisting, trading halts or exchange-specific sessions yet.
- Bond pricing uses a simplified deterministic price model; there is no full yield curve, duration/convexity engine, credit rating migration or maturity redemption workflow.
- Commodity prices are simplified basket benchmarks; inventory, storage, futures curves and physical delivery are not modeled.
- Digital assets do not include staking, wallet custody, chain fees, forks, stablecoins, exchange failure or cyber incidents.
- Research quality is a fixed simulated information-confidence indicator; it does not yet react to analyst reports or company announcements.
- No short selling, margin, options, leverage, stop/limit orders, tax treatment or automated rebalancing.
- The market regime is a compact cycle model; broad economic interconnections and news-driven shocks belong to Phase 11.
