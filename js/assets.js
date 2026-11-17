import { MONEY_SCALE } from "./finance.js";
import { BANKING_INSTITUTIONS } from "./banking.js";

const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const roundDiv = (value, divisor) => Math.floor((value + Math.floor(divisor / 2)) / divisor);
const mulDiv = (a, b, divisor) => Number((BigInt(a) * BigInt(b) + BigInt(Math.floor(divisor / 2))) / BigInt(divisor));
const ceilDiv = (a, b) => Math.floor((a + b - 1) / b);

export const PROPERTY_LISTINGS = Object.freeze([
  { id: "property-studio", name: "Harborview Starter Studio", type: "Residential · Studio", description: "A compact entry-level apartment with modest upkeep and steady rental demand.", priceMinor: 950000, weeklyRentMinor: 8200, weeklyMaintenanceMinor: 900, annualTaxBps: 60, volatilityBps: 18, risk: "Moderate" },
  { id: "property-apartment", name: "Meridian City Apartment", type: "Residential · Apartment", description: "A larger city apartment suited to a small household or long-term tenant.", priceMinor: 1450000, weeklyRentMinor: 12500, weeklyMaintenanceMinor: 1500, annualTaxBps: 70, volatilityBps: 20, risk: "Moderate" },
  { id: "property-townhouse", name: "Cedar Park Townhouse", type: "Residential · Townhouse", description: "A multi-room home with higher running costs and stronger rental potential.", priceMinor: 2300000, weeklyRentMinor: 19000, weeklyMaintenanceMinor: 2500, annualTaxBps: 80, volatilityBps: 22, risk: "Moderate" },
  { id: "property-retail", name: "Meridian Street Retail Suite", type: "Commercial · Retail", description: "A small commercial unit exposed to tenant demand and business activity.", priceMinor: 3100000, weeklyRentMinor: 27500, weeklyMaintenanceMinor: 3900, annualTaxBps: 105, volatilityBps: 28, risk: "Elevated" },
  { id: "property-duplex", name: "Northstar Income Duplex", type: "Residential · Multi-unit", description: "A two-unit rental property with higher income potential and operating exposure.", priceMinor: 4200000, weeklyRentMinor: 36000, weeklyMaintenanceMinor: 5200, annualTaxBps: 90, volatilityBps: 25, risk: "Elevated" }
]);

export const COLLECTIBLE_CATALOG = Object.freeze([
  { id: "collectible-camera", name: "Vintage Rangefinder Camera", category: "Photography", description: "A carefully preserved mechanical camera with a specialist resale audience.", priceMinor: 42000, volatilityBps: 48, liquidityBps: 1200, maintenanceMinor: 1800, risk: "Moderate" },
  { id: "collectible-watch", name: "Limited Chronograph Watch", category: "Watches", description: "A numbered timepiece whose value depends on condition, provenance and buyer demand.", priceMinor: 78000, volatilityBps: 58, liquidityBps: 850, maintenanceMinor: 2400, risk: "Moderate" },
  { id: "collectible-art", name: "Contemporary Original Canvas", category: "Art", description: "A fictional emerging-artist work with uncertain appraisal and a narrow buyer pool.", priceMinor: 135000, volatilityBps: 82, liquidityBps: 1800, maintenanceMinor: 3000, risk: "High" },
  { id: "collectible-cards", name: "Rare Trading Card Archive", category: "Memorabilia", description: "A graded archive whose value is sensitive to collector sentiment and condition.", priceMinor: 28000, volatilityBps: 125, liquidityBps: 1500, maintenanceMinor: 900, risk: "High" },
  { id: "collectible-car", name: "Classic Collector Automobile", category: "Vehicles", description: "A specialist vehicle with substantial storage, upkeep and resale considerations.", priceMinor: 580000, volatilityBps: 98, liquidityBps: 2200, maintenanceMinor: 12500, risk: "High" }
]);

const listingById = id => PROPERTY_LISTINGS.find(item => item.id === id);
const collectibleById = id => COLLECTIBLE_CATALOG.find(item => item.id === id);
const line = (accountId, debitMinor = 0, creditMinor = 0) => ({ accountId, debitMinor, creditMinor });

function account(finance, id, name, type, subtype) {
  let found = finance.accounts.find(item => item.id === id);
  if (!found) {
    found = { id, name, type, subtype, balanceMinor: 0 };
    finance.accounts.push(found);
  }
  return found;
}

function post(finance, { id, date, turn, kind, description, amountMinor, lines, category = "assets", relatedId = null }) {
  const debit = lines.reduce((sum, item) => sum + item.debitMinor, 0);
  const credit = lines.reduce((sum, item) => sum + item.creditMinor, 0);
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0 || debit !== credit || debit <= 0) throw new Error("Asset journal entry is not balanced.");
  const byId = new Map(finance.accounts.map(item => [item.id, item]));
  for (const item of lines) {
    const target = byId.get(item.accountId);
    if (!target || !Number.isSafeInteger(item.debitMinor) || !Number.isSafeInteger(item.creditMinor) || item.debitMinor < 0 || item.creditMinor < 0 || (item.debitMinor > 0 && item.creditMinor > 0)) throw new Error("Asset journal line is invalid.");
    target.balanceMinor += ["asset", "expense"].includes(target.type) ? item.debitMinor - item.creditMinor : item.creditMinor - item.debitMinor;
  }
  finance.ledger.push({ id, date, turn, kind, description, amountMinor, category, relatedId, lines: clone(lines) });
}

function draw(rng, max) {
  const value = (rng.state + 0x6D2B79F5) >>> 0;
  let t = value;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * max), state: value };
}
function fee(amountMinor, basisPoints) {
  return Number((BigInt(amountMinor) * BigInt(basisPoints) + 9999n) / 10000n);
}
function recordTransaction(assets, record) {
  assets.transactions.unshift(record);
  if (assets.transactions.length > 100) assets.transactions.length = 100;
}
function mortgagePayment(principalMinor, rateBps, termWeeks) {
  const weeklyRate = rateBps / 10000 / 52;
  if (!weeklyRate) return Math.ceil(principalMinor / termWeeks);
  return Math.ceil(principalMinor * weeklyRate / (1 - Math.pow(1 + weeklyRate, -termWeeks)));
}

export function createAssetState(seed = 1) {
  return { rng: { state: (Number(seed) >>> 0) || 1 }, turn: 0, nextId: 1, properties: [], collectibles: [], transactions: [], lastAdvanceTurn: 0 };
}

export function validateAssets(assets, finance, banking) {
  const errors = [];
  if (!assets || !assets.rng || !Number.isInteger(assets.rng.state) || !Number.isInteger(assets.turn) || assets.turn < 0 || !Number.isInteger(assets.nextId) || assets.nextId < 1 || !Array.isArray(assets.properties) || !Array.isArray(assets.collectibles) || !Array.isArray(assets.transactions)) return { valid: false, errors: ["Property and collectible data is missing or malformed."] };
  const propertyIds = new Set();
  for (const property of assets.properties) {
    if (!property || typeof property.id !== "string" || propertyIds.has(property.id) || !listingById(property.listingId) || !Number.isSafeInteger(property.costBasisMinor) || property.costBasisMinor <= 0 || !Number.isSafeInteger(property.marketValueMinor) || property.marketValueMinor <= 0 || !Number.isInteger(property.condition) || property.condition < 0 || property.condition > 100 || !["owner-occupied", "rental"].includes(property.use) || typeof property.occupied !== "boolean" || !Number.isSafeInteger(property.weeklyRentMinor) || !Number.isSafeInteger(property.weeklyMaintenanceMinor) || !Number.isInteger(property.annualTaxBps) || (property.mortgageId !== null && typeof property.mortgageId !== "string")) errors.push("A property holding is invalid.");
    propertyIds.add(property.id);
    if (property.mortgageId && !banking?.loans?.some(loan => loan.id === property.mortgageId && loan.type === "mortgage")) errors.push("A property mortgage is not linked to a valid banking loan.");
  }
  const collectibleIds = new Set();
  for (const item of assets.collectibles) {
    if (!item || typeof item.id !== "string" || collectibleIds.has(item.id) || !collectibleById(item.catalogId) || !Number.isSafeInteger(item.costBasisMinor) || item.costBasisMinor <= 0 || !Number.isSafeInteger(item.marketValueMinor) || item.marketValueMinor <= 0 || !Number.isInteger(item.condition) || item.condition < 0 || item.condition > 100 || !Number.isInteger(item.liquidityBps) || item.liquidityBps < 0 || item.liquidityBps > 5000) errors.push("A collectible holding is invalid.");
    collectibleIds.add(item.id);
  }
  const propertyValue = assets.properties.reduce((sum, item) => sum + item.marketValueMinor, 0);
  const collectibleValue = assets.collectibles.reduce((sum, item) => sum + item.marketValueMinor, 0);
  const propertyBalance = finance?.accounts?.find(item => item.id === "propertyAssets")?.balanceMinor ?? 0;
  const collectibleBalance = finance?.accounts?.find(item => item.id === "collectibleAssets")?.balanceMinor ?? 0;
  if (propertyBalance !== propertyValue) errors.push("Property holdings do not reconcile to the general ledger.");
  if (collectibleBalance !== collectibleValue) errors.push("Collectibles do not reconcile to the general ledger.");
  for (const transaction of assets.transactions) {
    if (!transaction || typeof transaction.id !== "string" || typeof transaction.date !== "string" || typeof transaction.kind !== "string" || !Number.isSafeInteger(transaction.amountMinor) || transaction.amountMinor < 0) errors.push("An asset transaction record is invalid.");
  }
  return { valid: errors.length === 0, errors };
}

export function validateAssetAction(assets, finance, banking, career, action) {
  if (!assets || !finance?.initialized || !banking) return { valid: false, reason: "Create a character and initialize finance, banking and assets first." };
  const cash = finance.accounts.find(item => item.id === "cash")?.balanceMinor ?? 0;
  if (action.type === "ASSET_BUY_PROPERTY") {
    const listing = listingById(action.listingId), use = action.use ?? "rental", downPaymentBps = action.downPaymentBps ?? 2000;
    if (!listing || !["owner-occupied", "rental"].includes(use) || !Number.isInteger(downPaymentBps) || downPaymentBps < 2000 || downPaymentBps > 10000) return { valid: false, reason: "Choose a valid property, use and down payment between 20% and 100%." };
    if (assets.properties.some(item => item.listingId === listing.id)) return { valid: false, reason: "This property listing has already been acquired in this save." };
    const downPayment = roundDiv(listing.priceMinor * downPaymentBps, 10000), mortgage = listing.priceMinor - downPayment, closing = fee(listing.priceMinor, 150);
    if (!Number.isSafeInteger(downPayment + closing) || downPayment + closing > cash) return { valid: false, reason: "Available cash does not cover the down payment and property closing costs." };
    if (mortgage > 0) {
      const maxLoan = Math.max(100000, Math.round((career?.currentJob?.weeklyPayMinor ?? 50000) * 20));
      if (banking.creditScore < 600) return { valid: false, reason: "A mortgage requires a credit score of at least 600." };
      if (mortgage > maxLoan) return { valid: false, reason: "The requested mortgage exceeds the current income-based borrowing limit. Increase income or the down payment." };
    }
    return { valid: true };
  }
  if (action.type === "ASSET_SELL_PROPERTY") {
    const property = assets.properties.find(item => item.id === action.propertyId);
    if (!property) return { valid: false, reason: "Choose a property you currently own." };
    const gross = property.marketValueMinor, saleFee = fee(gross, 300);
    const loan = property.mortgageId ? banking.loans.find(item => item.id === property.mortgageId) : null;
    const debt = loan && ["active", "defaulted"].includes(loan.status) ? loan.principalMinor + loan.interestAccruedMinor : 0;
    if (cash + gross - saleFee < debt) return { valid: false, reason: "The expected sale proceeds and available cash are not enough to settle this mortgage and selling costs." };
    return { valid: true };
  }
  if (action.type === "ASSET_SET_PROPERTY_USE") {
    if (!assets.properties.some(item => item.id === action.propertyId) || !["owner-occupied", "rental"].includes(action.use)) return { valid: false, reason: "Choose an owned property and a valid use." };
    return { valid: true };
  }
  if (action.type === "ASSET_MAINTAIN_PROPERTY") {
    const property = assets.properties.find(item => item.id === action.propertyId);
    if (!property) return { valid: false, reason: "Choose a property you currently own." };
    const cost = Math.max(2500, fee(property.marketValueMinor, 35));
    if (property.condition >= 100) return { valid: false, reason: "This property is already in excellent condition." };
    if (cost > cash) return { valid: false, reason: "There is not enough available cash for this property maintenance." };
    return { valid: true };
  }
  if (action.type === "ASSET_BUY_COLLECTIBLE") {
    const item = collectibleById(action.catalogId);
    if (!item) return { valid: false, reason: "Choose a valid collectible." };
    if (assets.collectibles.some(holding => holding.catalogId === item.id)) return { valid: false, reason: "This collectible has already been acquired in this save." };
    if (item.priceMinor + fee(item.priceMinor, 150) > cash) return { valid: false, reason: "There is not enough available cash to cover the purchase and acquisition fee." };
    return { valid: true };
  }
  if (action.type === "ASSET_SELL_COLLECTIBLE") {
    return assets.collectibles.some(item => item.id === action.collectibleId) ? { valid: true } : { valid: false, reason: "Choose a collectible you currently own." };
  }
  if (action.type === "ASSET_MAINTAIN_COLLECTIBLE") {
    const holding = assets.collectibles.find(item => item.id === action.collectibleId);
    if (!holding) return { valid: false, reason: "Choose a collectible you currently own." };
    if (holding.condition >= 100) return { valid: false, reason: "This collectible is already in excellent condition." };
    if (holding.maintenanceMinor > cash) return { valid: false, reason: "There is not enough available cash to maintain this collectible." };
    return { valid: true };
  }
  return { valid: false, reason: "Unknown property or collectible action." };
}

export function applyAssetAction(assets, finance, banking, action, { date, turn, sequence }) {
  const a = clone(assets), f = clone(finance), b = clone(banking), entryId = "journal-asset-" + sequence;
  const lineAccount = (id, name, type, subtype) => account(f, id, name, type, subtype);
  lineAccount("income", "Income", "income", "income");
  lineAccount("expense", "Household expenses", "expense", "expense");
  lineAccount("unrealizedGain", "Unrealized valuation changes", "equity", "valuation");

  if (action.type === "ASSET_BUY_PROPERTY") {
    lineAccount("propertyAssets", "Property holdings", "asset", "property");
    const listing = listingById(action.listingId), downPayment = roundDiv(listing.priceMinor * (action.downPaymentBps ?? 2000), 10000);
    const mortgagePrincipal = listing.priceMinor - downPayment, closing = fee(listing.priceMinor, 150), id = "property-" + a.nextId++;
    let mortgageId = null;
    const lines = [line("propertyAssets", listing.priceMinor), line("cash", 0, downPayment)];
    if (mortgagePrincipal > 0) {
      const bank = BANKING_INSTITUTIONS.find(item => item.id === "national-union");
      mortgageId = "loan-" + b.nextId++;
      const rateBps = bank.loanRateBps + (b.creditScore < 620 ? 250 : 0);
      lineAccount(mortgageId, bank.name + " — Property mortgage", "liability", "bank-loan");
      lines.push(line(mortgageId, 0, mortgagePrincipal));
      b.loans.push({ id: mortgageId, bankId: bank.id, type: "mortgage", principalMinor: mortgagePrincipal, interestAccruedMinor: 0, rateBps, termWeeks: 260, paymentMinor: mortgagePayment(mortgagePrincipal, rateBps, 260), remainingPayments: 260, nextPaymentTurn: turn + 1, collateral: listing.name, status: "active", missedPayments: 0, openedAtTurn: turn, ledgerAccountId: mortgageId });
    }
    post(f, { id: entryId, date, turn, kind: "PROPERTY_PURCHASE", description: "Acquired " + listing.name, amountMinor: listing.priceMinor, lines, relatedId: id });
    if (closing) post(f, { id: entryId + "-closing", date, turn, kind: "PROPERTY_CLOSING_COST", description: "Property closing costs — " + listing.name, amountMinor: closing, lines: [line("expense", closing), line("cash", 0, closing)], relatedId: id });
    a.properties.push({ id, listingId: listing.id, name: listing.name, type: listing.type, description: listing.description, costBasisMinor: listing.priceMinor, marketValueMinor: listing.priceMinor, condition: 100, use: action.use ?? "rental", occupied: true, weeklyRentMinor: listing.weeklyRentMinor, weeklyMaintenanceMinor: listing.weeklyMaintenanceMinor, annualTaxBps: listing.annualTaxBps, volatilityBps: listing.volatilityBps, mortgageId, acquiredAtTurn: turn });
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "PROPERTY_BUY", itemId: id, description: "Purchased " + listing.name, amountMinor: listing.priceMinor });
  } else if (action.type === "ASSET_SELL_PROPERTY") {
    const property = a.properties.find(item => item.id === action.propertyId), gross = property.marketValueMinor, saleFee = fee(gross, 300);
    const unrealized = gross - property.costBasisMinor, saleLines = [line("cash", gross), line("propertyAssets", 0, property.marketValueMinor)];
    if (gross > property.marketValueMinor) saleLines.push(line("income", 0, gross - property.marketValueMinor));
    else if (gross < property.marketValueMinor) saleLines.push(line("expense", property.marketValueMinor - gross));
    post(f, { id: entryId, date, turn, kind: "PROPERTY_SALE", description: "Sold " + property.name, amountMinor: gross, lines: saleLines, relatedId: property.id });
    if (unrealized > 0) post(f, { id: entryId + "-reserve", date, turn, kind: "PROPERTY_REALIZED_GAIN", description: "Realized property appreciation — " + property.name, amountMinor: unrealized, lines: [line("unrealizedGain", unrealized), line("income", 0, unrealized)], relatedId: property.id });
    else if (unrealized < 0) post(f, { id: entryId + "-reserve", date, turn, kind: "PROPERTY_REALIZED_LOSS", description: "Realized property depreciation — " + property.name, amountMinor: -unrealized, lines: [line("expense", -unrealized), line("unrealizedGain", 0, -unrealized)], relatedId: property.id });
    if (saleFee) post(f, { id: entryId + "-fee", date, turn, kind: "PROPERTY_SALE_FEE", description: "Property selling costs — " + property.name, amountMinor: saleFee, lines: [line("expense", saleFee), line("cash", 0, saleFee)], relatedId: property.id });
    const loan = property.mortgageId ? b.loans.find(item => item.id === property.mortgageId) : null;
    if (loan && ["active", "defaulted"].includes(loan.status)) {
      const debt = loan.principalMinor + loan.interestAccruedMinor;
      if (debt) post(f, { id: entryId + "-mortgage", date, turn, kind: "MORTGAGE_SETTLEMENT", description: "Mortgage settled from sale — " + property.name, amountMinor: debt, lines: [line(loan.ledgerAccountId, debt), line("cash", 0, debt)], relatedId: property.id });
      loan.principalMinor = 0; loan.interestAccruedMinor = 0; loan.remainingPayments = 0; loan.status = "paid";
    }
    a.properties = a.properties.filter(item => item.id !== property.id);
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "PROPERTY_SELL", itemId: property.id, description: "Sold " + property.name, amountMinor: gross - saleFee });
  } else if (action.type === "ASSET_SET_PROPERTY_USE") {
    const property = a.properties.find(item => item.id === action.propertyId);
    property.use = action.use;
    if (action.use === "owner-occupied") property.occupied = true;
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "PROPERTY_USE", itemId: property.id, description: property.name + " set to " + action.use, amountMinor: 0 });
  } else if (action.type === "ASSET_MAINTAIN_PROPERTY") {
    const property = a.properties.find(item => item.id === action.propertyId), cost = Math.max(2500, fee(property.marketValueMinor, 35));
    const oldValue = property.marketValueMinor, beforeCondition = property.condition;
    property.condition = clamp(property.condition + 20, 0, 100);
    const delta = Math.max(0, roundDiv(oldValue * (property.condition - beforeCondition) * 12, 10000));
    property.marketValueMinor += delta;
    post(f, { id: entryId, date, turn, kind: "PROPERTY_MAINTENANCE", description: "Repairs and maintenance — " + property.name, amountMinor: cost, lines: [line("expense", cost), line("cash", 0, cost)], relatedId: property.id });
    if (delta) post(f, { id: entryId + "-value", date, turn, kind: "PROPERTY_CONDITION_GAIN", description: "Condition improvement — " + property.name, amountMinor: delta, lines: [line("propertyAssets", delta), line("unrealizedGain", 0, delta)], relatedId: property.id });
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "PROPERTY_MAINTENANCE", itemId: property.id, description: "Maintained " + property.name, amountMinor: cost });
  } else if (action.type === "ASSET_BUY_COLLECTIBLE") {
    lineAccount("collectibleAssets", "Collectibles and valuables", "asset", "collectible");
    const item = collectibleById(action.catalogId), acquisitionFee = fee(item.priceMinor, 150), id = "collectible-" + a.nextId++;
    post(f, { id: entryId, date, turn, kind: "COLLECTIBLE_PURCHASE", description: "Acquired " + item.name, amountMinor: item.priceMinor + acquisitionFee, lines: [line("collectibleAssets", item.priceMinor), line("expense", acquisitionFee), line("cash", 0, item.priceMinor + acquisitionFee)], relatedId: id });
    a.collectibles.push({ id, catalogId: item.id, name: item.name, category: item.category, description: item.description, costBasisMinor: item.priceMinor, marketValueMinor: item.priceMinor, condition: 100, volatilityBps: item.volatilityBps, liquidityBps: item.liquidityBps, maintenanceMinor: item.maintenanceMinor, acquiredAtTurn: turn });
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "COLLECTIBLE_BUY", itemId: id, description: "Purchased " + item.name, amountMinor: item.priceMinor });
  } else if (action.type === "ASSET_SELL_COLLECTIBLE") {
    const holding = a.collectibles.find(item => item.id === action.collectibleId), saleValue = mulDiv(holding.marketValueMinor, 10000 - holding.liquidityBps, 10000);
    const unrealized = holding.marketValueMinor - holding.costBasisMinor, lines = [line("cash", saleValue), line("collectibleAssets", 0, holding.marketValueMinor)];
    if (saleValue > holding.marketValueMinor) lines.push(line("income", 0, saleValue - holding.marketValueMinor));
    else if (saleValue < holding.marketValueMinor) lines.push(line("expense", holding.marketValueMinor - saleValue));
    post(f, { id: entryId, date, turn, kind: "COLLECTIBLE_SALE", description: "Sold " + holding.name + " after its liquidity discount", amountMinor: saleValue, lines, relatedId: holding.id });
    if (unrealized > 0) post(f, { id: entryId + "-reserve", date, turn, kind: "COLLECTIBLE_REALIZED_GAIN", description: "Realized collectible appreciation — " + holding.name, amountMinor: unrealized, lines: [line("unrealizedGain", unrealized), line("income", 0, unrealized)], relatedId: holding.id });
    else if (unrealized < 0) post(f, { id: entryId + "-reserve", date, turn, kind: "COLLECTIBLE_REALIZED_LOSS", description: "Realized collectible depreciation — " + holding.name, amountMinor: -unrealized, lines: [line("expense", -unrealized), line("unrealizedGain", 0, -unrealized)], relatedId: holding.id });
    a.collectibles = a.collectibles.filter(item => item.id !== holding.id);
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "COLLECTIBLE_SELL", itemId: holding.id, description: "Sold " + holding.name, amountMinor: saleValue });
  } else if (action.type === "ASSET_MAINTAIN_COLLECTIBLE") {
    const holding = a.collectibles.find(item => item.id === action.collectibleId), cost = holding.maintenanceMinor;
    const oldValue = holding.marketValueMinor, beforeCondition = holding.condition;
    holding.condition = clamp(holding.condition + 15, 0, 100);
    const delta = Math.max(0, roundDiv(oldValue * (holding.condition - beforeCondition) * 8, 10000));
    holding.marketValueMinor += delta;
    post(f, { id: entryId, date, turn, kind: "COLLECTIBLE_CARE", description: "Conservation and care — " + holding.name, amountMinor: cost, lines: [line("expense", cost), line("cash", 0, cost)], relatedId: holding.id });
    if (delta) post(f, { id: entryId + "-value", date, turn, kind: "COLLECTIBLE_CONDITION_GAIN", description: "Condition improvement — " + holding.name, amountMinor: delta, lines: [line("collectibleAssets", delta), line("unrealizedGain", 0, delta)], relatedId: holding.id });
    recordTransaction(a, { id: "asset-tx-" + sequence, date, turn, kind: "COLLECTIBLE_CARE", itemId: holding.id, description: "Maintained " + holding.name, amountMinor: cost });
  }
  return { assets: a, finance: f, banking: b };
}

function postValuation(finance, { id, date, turn, kind, description, accountId, delta, relatedId }) {
  if (!delta) return;
  const lines = delta > 0 ? [line(accountId, delta), line("unrealizedGain", 0, delta)] : [line("unrealizedGain", -delta), line(accountId, 0, -delta)];
  post(finance, { id, date, turn, kind, description, amountMinor: Math.abs(delta), lines, relatedId });
}
function chargeCashExpense(finance, { id, date, turn, kind, description, amountMinor, relatedId }) {
  const cash = finance.accounts.find(item => item.id === "cash")?.balanceMinor ?? 0;
  if (cash < amountMinor) return false;
  post(finance, { id, date, turn, kind, description, amountMinor, lines: [line("expense", amountMinor), line("cash", 0, amountMinor)], relatedId });
  return true;
}

export function advanceAssets(assets, finance, { date, turn, regime = "Expansion" }) {
  const a = clone(assets), f = clone(finance), events = [], rng = a.rng;
  a.turn = turn;
  const regimeDrift = regime === "Expansion" ? 2 : regime === "Recovery" ? 3 : regime === "Slowdown" ? -1 : -3;
  account(f, "propertyAssets", "Property holdings", "asset", "property");
  account(f, "collectibleAssets", "Collectibles and valuables", "asset", "collectible");
  account(f, "unrealizedGain", "Unrealized valuation changes", "equity", "valuation");
  account(f, "income", "Income", "income", "income");
  account(f, "expense", "Household expenses", "expense", "expense");

  for (const property of a.properties) {
    const oldCondition = property.condition;
    if (turn % 13 === 0 && property.condition > 0) property.condition = clamp(property.condition - 1, 0, 100);
    if (property.use === "rental" && turn % 13 === 0) {
      const vacancy = draw(rng, 1000); rng.state = vacancy.state;
      if (property.occupied && vacancy.value < 150) {
        property.occupied = false;
        events.push({ type: "PROPERTY_VACANCY", summary: property.name + " became vacant.", details: { propertyId: property.id } });
      } else if (!property.occupied && vacancy.value < 400) {
        property.occupied = true;
        events.push({ type: "PROPERTY_TENANT", summary: "A tenant moved into " + property.name + ".", details: { propertyId: property.id } });
      }
    }
    if (property.use === "rental" && property.occupied && property.weeklyRentMinor > 0) {
      post(f, { id: "journal-rent-" + turn + "-" + property.id, date, turn, kind: "PROPERTY_RENT", description: "Rental income — " + property.name, amountMinor: property.weeklyRentMinor, lines: [line("cash", property.weeklyRentMinor), line("income", 0, property.weeklyRentMinor)], category: "rental-income", relatedId: property.id });
      events.push({ type: "PROPERTY_RENT", summary: (property.weeklyRentMinor / MONEY_SCALE).toFixed(2) + " Credits rent received from " + property.name + ".", details: { propertyId: property.id, amountMinor: property.weeklyRentMinor } });
    }
    if (property.weeklyMaintenanceMinor > 0) {
      const paid = chargeCashExpense(f, { id: "journal-property-maint-" + turn + "-" + property.id, date, turn, kind: "PROPERTY_UPKEEP", description: "Routine property upkeep — " + property.name, amountMinor: property.weeklyMaintenanceMinor, relatedId: property.id });
      if (!paid) {
        property.condition = clamp(property.condition - 1, 0, 100);
        events.push({ type: "PROPERTY_UPKEEP_DEFERRED", summary: "Upkeep was deferred for " + property.name + "; its condition declined.", details: { propertyId: property.id } });
      }
    }
    if (turn % 13 === 0) {
      const taxMinor = Math.ceil(fee(property.marketValueMinor, property.annualTaxBps) / 4);
      const paid = chargeCashExpense(f, { id: "journal-property-tax-" + turn + "-" + property.id, date, turn, kind: "PROPERTY_TAX", description: "Property tax — " + property.name, amountMinor: taxMinor, relatedId: property.id });
      if (!paid) {
        property.condition = clamp(property.condition - 4, 0, 100);
        events.push({ type: "PROPERTY_TAX_DEFERRED", summary: "Property tax could not be paid for " + property.name + "; condition declined.", details: { propertyId: property.id, amountMinor: taxMinor } });
      }
    }
    const movement = draw(rng, property.volatilityBps * 2 + 1); rng.state = movement.state;
    const shock = movement.value - property.volatilityBps, conditionEffect = (property.condition - oldCondition) * 20;
    const changeBps = clamp(regimeDrift + shock + conditionEffect, -500, 500);
    const newValue = Math.max(1, roundDiv(property.marketValueMinor * (10000 + changeBps), 10000)), delta = newValue - property.marketValueMinor;
    property.marketValueMinor = newValue;
    postValuation(f, { id: "journal-property-mark-" + turn + "-" + property.id, date, turn, kind: delta >= 0 ? "PROPERTY_UNREALIZED_GAIN" : "PROPERTY_UNREALIZED_LOSS", description: "Property valuation update — " + property.name, accountId: "propertyAssets", delta, relatedId: property.id });
  }

  for (const holding of a.collectibles) {
    const oldCondition = holding.condition;
    if (turn % 13 === 0 && holding.condition > 0) holding.condition = clamp(holding.condition - 1, 0, 100);
    const movement = draw(rng, holding.volatilityBps * 2 + 1); rng.state = movement.state;
    const shock = movement.value - holding.volatilityBps, conditionEffect = (holding.condition - oldCondition) * 15, changeBps = clamp(regimeDrift + shock + conditionEffect, -1000, 1000);
    const newValue = Math.max(1, roundDiv(holding.marketValueMinor * (10000 + changeBps), 10000)), delta = newValue - holding.marketValueMinor;
    holding.marketValueMinor = newValue;
    postValuation(f, { id: "journal-collectible-mark-" + turn + "-" + holding.id, date, turn, kind: delta >= 0 ? "COLLECTIBLE_UNREALIZED_GAIN" : "COLLECTIBLE_UNREALIZED_LOSS", description: "Collectible valuation update — " + holding.name, accountId: "collectibleAssets", delta, relatedId: holding.id });
  }
  a.rng = rng;
  a.lastAdvanceTurn = turn;
  return { assets: a, finance: f, events };
}

export function getAssetPortfolio(assets) {
  const propertyValue = assets?.properties?.reduce((sum, item) => sum + item.marketValueMinor, 0) ?? 0;
  const propertyCost = assets?.properties?.reduce((sum, item) => sum + item.costBasisMinor, 0) ?? 0;
  const collectibleValue = assets?.collectibles?.reduce((sum, item) => sum + item.marketValueMinor, 0) ?? 0;
  const collectibleCost = assets?.collectibles?.reduce((sum, item) => sum + item.costBasisMinor, 0) ?? 0;
  return {
    propertyValue, propertyCost, propertyUnrealized: propertyValue - propertyCost,
    collectibleValue, collectibleCost, collectibleUnrealized: collectibleValue - collectibleCost,
    totalValue: propertyValue + collectibleValue, totalCost: propertyCost + collectibleCost,
    totalUnrealized: propertyValue + collectibleValue - propertyCost - collectibleCost,
    propertyCount: assets?.properties?.length ?? 0, collectibleCount: assets?.collectibles?.length ?? 0
  };
}
