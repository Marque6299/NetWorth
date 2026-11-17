const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const roundDiv = (value, divisor) => Math.floor((value + Math.floor(divisor / 2)) / divisor);
const mulDiv = (a, b, divisor) => Number((BigInt(a) * BigInt(b) + BigInt(Math.floor(divisor / 2))) / BigInt(divisor));
const positive = value => Number.isSafeInteger(value) && value > 0;
const line = (accountId, debitMinor = 0, creditMinor = 0) => ({ accountId, debitMinor, creditMinor });

export const BUSINESS_COMPANIES = Object.freeze([
  {
    id: "meridian-essentials", name: "Meridian Retail Group", branchName: "Meridian Essentials Market", sector: "Consumer retail",
    description: "A neighbourhood essentials store focused on everyday household and convenience products.",
    model: "Retail operations", managerPayMinor: 10000, staffWageMinor: 4500, defaultStaff: 3, rentMinor: 4000, utilitiesMinor: 1500, capacityPerStaff: 18,
    requirements: { management: 15, operations: 20 }, openingCashMinor: 1500000,
    products: [
      { id: "pantry-pack", name: "Pantry Staples Pack", priceMinor: 1800, unitCostMinor: 850, initialUnits: 70, baseDemand: 20 },
      { id: "household-kit", name: "Household Care Kit", priceMinor: 2800, unitCostMinor: 1350, initialUnits: 45, baseDemand: 10 },
      { id: "meal-bundle", name: "Quick Meal Bundle", priceMinor: 1200, unitCostMinor: 650, initialUnits: 80, baseDemand: 24 }
    ]
  },
  {
    id: "brightline-commerce", name: "Brightline Commerce", branchName: "Brightline Home & Lifestyle", sector: "E-commerce",
    description: "An online home and lifestyle retailer balancing product margin, delivery reliability and customer demand.",
    model: "Online retail", managerPayMinor: 13000, staffWageMinor: 6000, defaultStaff: 3, rentMinor: 5500, utilitiesMinor: 2000, capacityPerStaff: 16,
    requirements: { management: 20, sales: 25 }, openingCashMinor: 1650000,
    products: [
      { id: "carry-tote", name: "Everyday Carry Tote", priceMinor: 3500, unitCostMinor: 1400, initialUnits: 42, baseDemand: 7 },
      { id: "desk-organizer", name: "Desk Organizer", priceMinor: 4200, unitCostMinor: 1900, initialUnits: 36, baseDemand: 6 },
      { id: "travel-mug", name: "Travel Mug", priceMinor: 2700, unitCostMinor: 1100, initialUnits: 48, baseDemand: 8 }
    ]
  },
  {
    id: "cobalt-insights", name: "Cobalt Insights", branchName: "Cobalt Digital Studio", sector: "Technology services",
    description: "A digital analytics studio delivering repeatable data, reporting and automation packages.",
    model: "Digital services", managerPayMinor: 16000, staffWageMinor: 7500, defaultStaff: 2, rentMinor: 2500, utilitiesMinor: 900, capacityPerStaff: 12,
    requirements: { management: 30, research: 35 }, openingCashMinor: 1750000,
    products: [
      { id: "data-readiness", name: "Data Readiness Package", priceMinor: 38000, unitCostMinor: 17000, initialUnits: 18, baseDemand: 2 },
      { id: "reporting-sprint", name: "BI Reporting Sprint", priceMinor: 52000, unitCostMinor: 24500, initialUnits: 12, baseDemand: 2 },
      { id: "automation-kit", name: "Automation Starter Kit", priceMinor: 26000, unitCostMinor: 12000, initialUnits: 20, baseDemand: 3 }
    ]
  },
  {
    id: "northstar-services", name: "Northstar Services", branchName: "Northstar Client Services", sector: "Business services",
    description: "A managed customer and back-office services team selling service bundles to business clients.",
    model: "Service operations", managerPayMinor: 18000, staffWageMinor: 7500, defaultStaff: 3, rentMinor: 4500, utilitiesMinor: 1700, capacityPerStaff: 13,
    requirements: { operations: 35, leadership: 25 }, openingCashMinor: 1850000,
    products: [
      { id: "support-bundle", name: "Customer Support Bundle", priceMinor: 8800, unitCostMinor: 3500, initialUnits: 24, baseDemand: 8 },
      { id: "backoffice-pack", name: "Back-office Processing Pack", priceMinor: 6500, unitCostMinor: 2500, initialUnits: 28, baseDemand: 9 },
      { id: "quality-batch", name: "Quality Review Batch", priceMinor: 9000, unitCostMinor: 3600, initialUnits: 20, baseDemand: 6 }
    ]
  },
  {
    id: "aster-industrial", name: "Aster Industrial", branchName: "Aster Industrial Supply", sector: "Industrial supply",
    description: "A specialist supplier balancing equipment availability, order value and technical customer support.",
    model: "Wholesale and supply", managerPayMinor: 21000, staffWageMinor: 9000, defaultStaff: 3, rentMinor: 6500, utilitiesMinor: 3000, capacityPerStaff: 9,
    requirements: { technical: 40, operations: 40 }, openingCashMinor: 2000000,
    products: [
      { id: "precision-tools", name: "Precision Tool Set", priceMinor: 15500, unitCostMinor: 8800, initialUnits: 22, baseDemand: 3 },
      { id: "safety-kit", name: "Workshop Safety Kit", priceMinor: 7600, unitCostMinor: 3900, initialUnits: 32, baseDemand: 4 },
      { id: "calibration-pack", name: "Calibration Service Pack", priceMinor: 24000, unitCostMinor: 13000, initialUnits: 18, baseDemand: 2 }
    ]
  }
]);

export const BUSINESS_SUPPLIERS = Object.freeze([
  { id: "metro-wholesale", name: "Metro Wholesale", tier: "Standard", markupBps: 10000, leadWeeks: 2, reliabilityBps: 9700, shippingMinor: 1200, description: "Balanced wholesale pricing and dependable scheduled deliveries." },
  { id: "harbor-trade", name: "Harbor Trade Supply", tier: "Value", markupBps: 9600, leadWeeks: 3, reliabilityBps: 9000, shippingMinor: 600, description: "Lower unit cost with longer lead times and a greater chance of delay." },
  { id: "rapid-stock", name: "Rapid Stock Partners", tier: "Express", markupBps: 10800, leadWeeks: 1, reliabilityBps: 9950, shippingMinor: 3500, description: "Premium pricing for fast, highly reliable replenishment." }
]);

const companyById = id => BUSINESS_COMPANIES.find(item => item.id === id);
const supplierById = id => BUSINESS_SUPPLIERS.find(item => item.id === id);
const account = (id, name, type, subtype, balanceMinor = 0) => ({ id, name, type, subtype, balanceMinor });

function post(ledger, { id, date, turn, kind, description, amountMinor, lines, relatedId = null }) {
  const debit = lines.reduce((sum, item) => sum + item.debitMinor, 0);
  const credit = lines.reduce((sum, item) => sum + item.creditMinor, 0);
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0 || debit !== credit || debit <= 0) throw new Error("Business journal entry is not balanced.");
  const byId = new Map(ledger.accounts.map(item => [item.id, item]));
  for (const item of lines) {
    const target = byId.get(item.accountId);
    if (!target || !Number.isSafeInteger(item.debitMinor) || !Number.isSafeInteger(item.creditMinor) || item.debitMinor < 0 || item.creditMinor < 0 || (item.debitMinor > 0 && item.creditMinor > 0)) throw new Error("Business journal line is invalid.");
    target.balanceMinor += ["asset", "expense"].includes(target.type) ? item.debitMinor - item.creditMinor : item.creditMinor - item.debitMinor;
  }
  ledger.entries.push({ id, date, turn, kind, description, amountMinor, relatedId, lines: clone(lines) });
}

function postHouseholdIncome(finance, { id, date, turn, amountMinor, relatedId }) {
  if (!positive(amountMinor)) return;
  const cash = finance.accounts.find(item => item.id === "cash");
  const income = finance.accounts.find(item => item.id === "income");
  if (!cash || !income) throw new Error("Household Finance accounts are unavailable for business manager payroll.");
  const lines = [line("cash", amountMinor), line("income", 0, amountMinor)];
  const debit = lines.reduce((sum, item) => sum + item.debitMinor, 0);
  if (debit !== lines.reduce((sum, item) => sum + item.creditMinor, 0)) throw new Error("Household manager payroll is not balanced.");
  cash.balanceMinor += amountMinor;
  income.balanceMinor += amountMinor;
  finance.ledger.push({ id, date, turn, kind: "BUSINESS_MANAGER_PAY", description: "Business operating manager compensation", amountMinor, category: "business-income", relatedId, lines });
}

function getBalance(ledger, id) {
  return ledger.accounts.find(item => item.id === id)?.balanceMinor ?? 0;
}

function draw(rng, max) {
  const value = (rng.state + 0x6D2B79F5) >>> 0;
  let t = value;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: Math.floor(((t ^ (t >>> 14)) >>> 0) / 4294967296 * max), state: value };
}

function transaction(mandate, { id, date, turn, kind, description, amountMinor, relatedId = null }) {
  mandate.transactions.unshift({ id, date, turn, kind, description, amountMinor, relatedId });
  if (mandate.transactions.length > 100) mandate.transactions.length = 100;
}

function createMandate(company, id, turn) {
  const products = company.products.map(item => ({
    id: item.id, name: item.name, basePriceMinor: item.priceMinor, priceMinor: item.priceMinor,
    unitCostMinor: item.unitCostMinor, inventoryUnits: item.initialUnits,
    inventoryValueMinor: item.unitCostMinor * item.initialUnits, baseDemand: item.baseDemand
  }));
  const inventoryMinor = products.reduce((sum, item) => sum + item.inventoryValueMinor, 0);
  const openingCash = company.openingCashMinor;
  const ledger = {
    accounts: [
      account("cash", "Operating cash", "asset", "cash", openingCash),
      account("inventory", "Inventory on hand", "asset", "inventory", inventoryMinor),
      account("inventoryTransit", "Inventory in transit", "asset", "inventory-transit"),
      account("payables", "Operating payables", "liability", "payables"),
      account("parentCapital", "Parent company operating capital", "equity", "parent-capital", openingCash + inventoryMinor),
      account("revenue", "Sales revenue", "income", "revenue"),
      account("cogs", "Cost of goods sold", "expense", "cogs"),
      account("staffPayroll", "Staff payroll", "expense", "payroll"),
      account("managerPayroll", "Manager payroll", "expense", "manager-payroll"),
      account("rentExpense", "Premises and rent", "expense", "rent"),
      account("utilitiesExpense", "Utilities and services", "expense", "utilities"),
      account("marketingExpense", "Marketing", "expense", "marketing"),
      account("deliveryExpense", "Supplier delivery and handling", "expense", "delivery")
    ],
    entries: []
  };
  post(ledger, {
    id: "business-" + id + "-opening", date: null, turn, kind: "PARENT_CAPITAL_ALLOCATION",
    description: "Operating cash and opening inventory allocated by " + company.name,
    amountMinor: openingCash + inventoryMinor,
    lines: [line("cash", openingCash), line("inventory", inventoryMinor), line("parentCapital", 0, openingCash + inventoryMinor)]
  });
  return {
    id, companyId: company.id, companyName: company.name, branchName: company.branchName, sector: company.sector, model: company.model,
    description: company.description, openedAtTurn: turn, status: "active",
    managerPayMinor: company.managerPayMinor, staffWageMinor: company.staffWageMinor, staffCount: company.defaultStaff,
    rentMinor: company.rentMinor, utilitiesMinor: company.utilitiesMinor, capacityPerStaff: company.capacityPerStaff,
    products, ledger, purchaseOrders: [], payables: [], transactions: [], history: [],
    marketingBoostBps: 0, marketingUntilTurn: 0, actionExpensesMinor: 0,
    customerSatisfaction: 70, managerScore: 60, lastAdvanceTurn: turn,
    totalUnitsSold: 0, totalStockouts: 0, cumulativeRevenueMinor: 0, cumulativeCogsMinor: 0,
    lastWeeklyResult: null
  };
}

export function createBusinessState(seed = 1) {
  return { rng: { state: (Number(seed) >>> 0) || 1 }, nextId: 1, mandate: null, history: [], lastAdvanceTurn: 0 };
}

function validateLedger(ledger) {
  const errors = [];
  if (!ledger || !Array.isArray(ledger.accounts) || !Array.isArray(ledger.entries)) return ["Business ledger is malformed."];
  const ids = new Set(), calculated = {};
  for (const item of ledger.accounts) {
    if (!item || typeof item.id !== "string" || ids.has(item.id) || !["asset", "liability", "equity", "income", "expense"].includes(item.type) || !Number.isSafeInteger(item.balanceMinor)) errors.push("A business ledger account is invalid.");
    else { ids.add(item.id); calculated[item.id] = 0; }
  }
  for (const entry of ledger.entries) {
    if (!entry || !Array.isArray(entry.lines) || entry.lines.length < 2 || !Number.isSafeInteger(entry.amountMinor) || entry.amountMinor < 0) { errors.push("A business journal entry is invalid."); continue; }
    let debit = 0, credit = 0;
    for (const item of entry.lines) {
      if (!ids.has(item.accountId) || !Number.isSafeInteger(item.debitMinor) || !Number.isSafeInteger(item.creditMinor) || item.debitMinor < 0 || item.creditMinor < 0 || (item.debitMinor > 0 && item.creditMinor > 0)) { errors.push("A business journal line is invalid."); continue; }
      debit += item.debitMinor; credit += item.creditMinor;
      const target = ledger.accounts.find(accountItem => accountItem.id === item.accountId);
      calculated[target.id] += (["asset", "expense"].includes(target.type) ? 1 : -1) * (item.debitMinor - item.creditMinor);
    }
    if (debit !== credit || debit === 0) errors.push("A business journal entry is not balanced.");
  }
  for (const item of ledger.accounts) if (calculated[item.id] !== item.balanceMinor) errors.push("Business account " + item.id + " does not reconcile to its journal.");
  return errors;
}

export function validateBusinesses(state, finance) {
  const errors = [];
  if (!state || !state.rng || !Number.isInteger(state.rng.state) || !Number.isInteger(state.nextId) || state.nextId < 1 || !Array.isArray(state.history)) return { valid: false, errors: ["Business operating state is malformed."] };
  if (state.mandate === null) return { valid: state.history.every(item => item && typeof item.companyId === "string" && Number.isInteger(item.closedAtTurn)), errors: state.history.every(item => item && typeof item.companyId === "string" && Number.isInteger(item.closedAtTurn)) ? [] : ["A business mandate history record is invalid."] };
  const m = state.mandate;
  if (!m || !companyById(m.companyId) || m.status !== "active" || !Array.isArray(m.products) || !Array.isArray(m.purchaseOrders) || !Array.isArray(m.payables) || !Array.isArray(m.transactions) || !Array.isArray(m.history) || !Number.isInteger(m.staffCount) || m.staffCount < 1 || m.staffCount > 10 || !Number.isInteger(m.managerScore) || m.managerScore < 0 || m.managerScore > 100 || !Number.isInteger(m.customerSatisfaction) || m.customerSatisfaction < 0 || m.customerSatisfaction > 100 || !Number.isSafeInteger(m.actionExpensesMinor) || m.actionExpensesMinor < 0) errors.push("The active business mandate is invalid.");
  errors.push(...validateLedger(m.ledger));
  const productIds = new Set();
  for (const item of m.products) {
    if (!item || typeof item.id !== "string" || productIds.has(item.id) || !Number.isSafeInteger(item.priceMinor) || item.priceMinor <= 0 || !Number.isSafeInteger(item.basePriceMinor) || item.basePriceMinor <= 0 || !Number.isSafeInteger(item.unitCostMinor) || item.unitCostMinor <= 0 || !Number.isInteger(item.inventoryUnits) || item.inventoryUnits < 0 || !Number.isSafeInteger(item.inventoryValueMinor) || item.inventoryValueMinor < 0 || !Number.isInteger(item.baseDemand) || item.baseDemand < 0 || (item.inventoryUnits === 0 && item.inventoryValueMinor !== 0)) errors.push("A business product or inventory balance is invalid.");
    productIds.add(item.id);
  }
  const inventoryValue = m.products.reduce((sum, item) => sum + item.inventoryValueMinor, 0);
  const transitValue = m.purchaseOrders.filter(item => item.status === "pending").reduce((sum, item) => sum + item.goodsValueMinor, 0);
  const payableValue = m.payables.reduce((sum, item) => sum + item.amountMinor, 0);
  if (getBalance(m.ledger, "inventory") !== inventoryValue) errors.push("Business inventory does not reconcile to the business ledger.");
  if (getBalance(m.ledger, "inventoryTransit") !== transitValue) errors.push("Business inventory in transit does not reconcile to pending supplier orders.");
  if (getBalance(m.ledger, "payables") !== payableValue) errors.push("Business payables do not reconcile to outstanding obligations.");
  if (getBalance(m.ledger, "cash") < 0) errors.push("Business operating cash cannot be negative.");
  if (m.ledger?.entries?.length && getBalance(m.ledger, "parentCapital") <= 0) errors.push("Business parent-company capital is missing.");
  if (m.purchaseOrders.some(item => !item || !supplierById(item.supplierId) || !productIds.has(item.productId) || !Number.isInteger(item.units) || item.units <= 0 || !Number.isSafeInteger(item.goodsValueMinor) || item.goodsValueMinor <= 0 || !["pending", "delivered"].includes(item.status))) errors.push("A supplier purchase order is invalid.");
  if (m.payables.some(item => !item || !["staff", "rent", "utilities", "manager"].includes(item.kind) || !Number.isSafeInteger(item.amountMinor) || item.amountMinor <= 0 || !Number.isInteger(item.createdTurn))) errors.push("A business payable is invalid.");
  if (!Number.isInteger(m.lastAdvanceTurn) || m.lastAdvanceTurn < m.openedAtTurn) errors.push("Business operating calendar is invalid.");
  if (!finance?.initialized || !finance.accounts.some(item => item.id === "cash") || !finance.accounts.some(item => item.id === "income")) errors.push("Household Finance cannot receive business manager payroll.");
  return { valid: errors.length === 0, errors };
}

function branchCash(m) { return getBalance(m.ledger, "cash"); }
function quoteOrder(m, product, supplier, units) {
  const supplierUnitCost = roundDiv(product.unitCostMinor * supplier.markupBps, 10000);
  const goodsValueMinor = supplierUnitCost * units;
  return { supplierUnitCost, goodsValueMinor, shippingMinor: supplier.shippingMinor, totalMinor: goodsValueMinor + supplier.shippingMinor };
}

export function validateBusinessAction(state, character, action) {
  if (!state || !character) return { valid: false, reason: "Create a character before entering the business workspace." };
  if (action.type === "BUSINESS_ACCEPT_MANDATE") {
    const company = companyById(action.companyId);
    if (state.mandate) return { valid: false, reason: "Complete or end the current operating mandate before accepting another." };
    if (!company) return { valid: false, reason: "Choose a valid company operating mandate." };
    const unmet = Object.entries(company.requirements).filter(([key, value]) => (character.skills?.[key] ?? 0) < value);
    if (unmet.length) return { valid: false, reason: "This mandate requires " + unmet.map(([key, value]) => key + " " + value + "+").join(", ") + "." };
    return { valid: true };
  }
  const m = state.mandate;
  if (!m || m.status !== "active") return { valid: false, reason: "Accept a business operating mandate first." };
  if (action.type === "BUSINESS_SET_PRICE") {
    const product = m.products.find(item => item.id === action.productId);
    if (!product || !Number.isSafeInteger(action.priceMinor)) return { valid: false, reason: "Choose a valid product and price." };
    const minimum = Math.ceil(product.unitCostMinor * 1.1);
    const maximum = product.basePriceMinor * 3;
    if (action.priceMinor < minimum || action.priceMinor > maximum) return { valid: false, reason: "Set a price between 110% of current unit cost and three times the listed reference price." };
    return { valid: true };
  }
  if (action.type === "BUSINESS_SET_STAFFING") {
    if (!Number.isInteger(action.staffCount) || action.staffCount < 1 || action.staffCount > 10) return { valid: false, reason: "Staffing must be a whole number between 1 and 10 employees." };
    return { valid: true };
  }
  if (action.type === "BUSINESS_ORDER_INVENTORY") {
    const product = m.products.find(item => item.id === action.productId), supplier = supplierById(action.supplierId);
    if (!product || !supplier || !Number.isInteger(action.units) || action.units < 1 || action.units > 500) return { valid: false, reason: "Choose a valid product and supplier, and order between 1 and 500 units." };
    const pendingUnits = m.purchaseOrders.filter(item => item.productId === product.id && item.status === "pending").reduce((sum, item) => sum + item.units, 0);
    if (product.inventoryUnits + pendingUnits + action.units > 5000) return { valid: false, reason: "This order would exceed the supported stock capacity for the product." };
    const quote = quoteOrder(m, product, supplier, action.units);
    if (!Number.isSafeInteger(quote.totalMinor) || quote.totalMinor > branchCash(m)) return { valid: false, reason: "The branch does not have enough operating cash for this supplier order and delivery fee." };
    return { valid: true };
  }
  if (action.type === "BUSINESS_MARKETING_CAMPAIGN") {
    if (!Number.isSafeInteger(action.amountMinor) || action.amountMinor < 5000 || action.amountMinor > 150000) return { valid: false, reason: "A campaign must cost between 50 and 1,500 Credits." };
    if (action.amountMinor > branchCash(m)) return { valid: false, reason: "The branch does not have enough operating cash for this marketing campaign." };
    return { valid: true };
  }
  if (action.type === "BUSINESS_END_MANDATE") return { valid: true };
  return { valid: false, reason: "Unknown business operation action." };
}

function addPayable(m, { id, date, turn, kind, amountMinor }) {
  if (!positive(amountMinor)) return;
  const expenseAccount = { staff: "staffPayroll", rent: "rentExpense", utilities: "utilitiesExpense", manager: "managerPayroll" }[kind];
  post(m.ledger, { id, date, turn, kind: "BUSINESS_" + kind.toUpperCase() + "_ACCRUED", description: "Accrued " + kind + " obligation", amountMinor, lines: [line(expenseAccount, amountMinor), line("payables", 0, amountMinor)] });
  m.payables.push({ id: id + "-payable", kind, amountMinor, createdTurn: turn });
}

function settlePayables(m, finance, { date, turn }) {
  const priority = { staff: 0, rent: 1, utilities: 2, manager: 3 };
  m.payables.sort((a, b) => a.createdTurn - b.createdTurn || priority[a.kind] - priority[b.kind]);
  const remaining = [];
  let index = 0;
  for (const payable of m.payables) {
    const cash = branchCash(m), paid = Math.min(cash, payable.amountMinor);
    if (paid > 0) {
      post(m.ledger, { id: "business-settlement-" + turn + "-" + index, date, turn, kind: "BUSINESS_PAYABLE_SETTLED", description: "Settled " + payable.kind + " operating payable", amountMinor: paid, lines: [line("payables", paid), line("cash", 0, paid)], relatedId: payable.id });
      if (payable.kind === "manager") postHouseholdIncome(finance, { id: "journal-business-manager-" + turn + "-" + index, date, turn, amountMinor: paid, relatedId: m.id });
      payable.amountMinor -= paid;
    }
    if (payable.amountMinor > 0) remaining.push(payable);
    index += 1;
  }
  m.payables = remaining;
}

function deliverPurchaseOrders(state, m, { date, turn }, events) {
  for (const order of m.purchaseOrders) {
    if (order.status !== "pending" || order.deliveryTurn > turn) continue;
    const supplier = supplierById(order.supplierId);
    const drawResult = draw(state.rng, 10000); state.rng.state = drawResult.state;
    if (drawResult.value >= supplier.reliabilityBps && order.delayCount < 2) {
      order.delayCount += 1;
      order.deliveryTurn = turn + 1;
      events.push({ type: "BUSINESS_SUPPLIER_DELAY", summary: supplier.name + " delayed a delivery to " + m.branchName + ".", details: { orderId: order.id, supplierId: supplier.id, newDeliveryTurn: order.deliveryTurn } });
      continue;
    }
    const product = m.products.find(item => item.id === order.productId);
    post(m.ledger, { id: "business-delivery-" + order.id, date, turn, kind: "BUSINESS_STOCK_RECEIVED", description: "Received " + order.units + " units of " + product.name, amountMinor: order.goodsValueMinor, lines: [line("inventory", order.goodsValueMinor), line("inventoryTransit", 0, order.goodsValueMinor)], relatedId: order.id });
    const combinedUnits = product.inventoryUnits + order.units;
    product.inventoryValueMinor += order.goodsValueMinor;
    product.inventoryUnits = combinedUnits;
    product.unitCostMinor = roundDiv(product.inventoryValueMinor, combinedUnits);
    order.status = "delivered";
    order.deliveredAtTurn = turn;
    transaction(m, { id: "business-tx-delivery-" + order.id, date, turn, kind: "STOCK_RECEIVED", description: supplier.name + " delivered " + product.name, amountMinor: order.goodsValueMinor, relatedId: order.id });
    events.push({ type: "BUSINESS_STOCK_RECEIVED", summary: order.units + " units of " + product.name + " arrived from " + supplier.name + ".", details: { orderId: order.id, productId: product.id, units: order.units } });
  }
}

export function applyBusinessAction(state, finance, character, action, { date, turn, sequence }) {
  const b = clone(state), f = clone(finance);
  if (action.type === "BUSINESS_ACCEPT_MANDATE") {
    const company = companyById(action.companyId);
    const id = "mandate-" + b.nextId++;
    b.mandate = createMandate(company, id, turn);
    transaction(b.mandate, { id: "business-tx-" + id, date, turn, kind: "MANDATE_ACCEPTED", description: "Accepted operating mandate for " + company.name, amountMinor: 0 });
    return { businesses: b, finance: f, event: { type: "BUSINESS_MANDATE_ACCEPTED", summary: "Operating mandate accepted: " + company.branchName + ".", details: { mandateId: id, companyId: company.id } } };
  }
  const m = b.mandate;
  if (action.type === "BUSINESS_SET_PRICE") {
    const product = m.products.find(item => item.id === action.productId), previous = product.priceMinor;
    product.priceMinor = action.priceMinor;
    transaction(m, { id: "business-tx-" + sequence, date, turn, kind: "PRICE_UPDATED", description: "Updated selling price for " + product.name, amountMinor: product.priceMinor, relatedId: product.id });
    return { businesses: b, finance: f, event: { type: "BUSINESS_PRICE_UPDATED", summary: product.name + " price updated from " + (previous / 100).toFixed(2) + " to " + (product.priceMinor / 100).toFixed(2) + " Credits.", details: { productId: product.id, previousPriceMinor: previous, currentPriceMinor: product.priceMinor } } };
  }
  if (action.type === "BUSINESS_SET_STAFFING") {
    const previous = m.staffCount;
    m.staffCount = action.staffCount;
    transaction(m, { id: "business-tx-" + sequence, date, turn, kind: "STAFFING_UPDATED", description: "Staffing changed from " + previous + " to " + m.staffCount + " employees", amountMinor: 0 });
    return { businesses: b, finance: f, event: { type: "BUSINESS_STAFFING_UPDATED", summary: "Branch staffing updated to " + m.staffCount + " employees.", details: { previous, current: m.staffCount } } };
  }
  if (action.type === "BUSINESS_ORDER_INVENTORY") {
    const product = m.products.find(item => item.id === action.productId), supplier = supplierById(action.supplierId), quote = quoteOrder(m, product, supplier, action.units);
    const orderId = "purchase-order-" + b.nextId++;
    post(m.ledger, { id: "business-order-" + orderId, date, turn, kind: "BUSINESS_STOCK_ORDERED", description: "Ordered " + action.units + " units of " + product.name + " from " + supplier.name, amountMinor: quote.goodsValueMinor, lines: [line("inventoryTransit", quote.goodsValueMinor), ...(quote.shippingMinor ? [line("deliveryExpense", quote.shippingMinor)] : []), line("cash", 0, quote.totalMinor)], relatedId: orderId });
    m.actionExpensesMinor += quote.shippingMinor;
    m.purchaseOrders.push({ id: orderId, supplierId: supplier.id, productId: product.id, units: action.units, unitCostMinor: quote.supplierUnitCost, goodsValueMinor: quote.goodsValueMinor, shippingMinor: quote.shippingMinor, orderedAtTurn: turn, deliveryTurn: turn + supplier.leadWeeks, delayCount: 0, status: "pending" });
    transaction(m, { id: "business-tx-" + orderId, date, turn, kind: "STOCK_ORDERED", description: "Ordered " + action.units + " units of " + product.name, amountMinor: quote.totalMinor, relatedId: orderId });
    return { businesses: b, finance: f, event: { type: "BUSINESS_STOCK_ORDERED", summary: "Placed a " + action.units + "-unit order for " + product.name + " with " + supplier.name + ".", details: { orderId, productId: product.id, supplierId: supplier.id, totalMinor: quote.totalMinor } } };
  }
  if (action.type === "BUSINESS_MARKETING_CAMPAIGN") {
    const boost = clamp(Math.floor(action.amountMinor / 10), 500, 3500);
    post(m.ledger, { id: "business-marketing-" + sequence, date, turn, kind: "BUSINESS_MARKETING", description: "Marketing campaign approved by the branch manager", amountMinor: action.amountMinor, lines: [line("marketingExpense", action.amountMinor), line("cash", 0, action.amountMinor)] });
    m.actionExpensesMinor += action.amountMinor;
    m.marketingBoostBps = Math.max(m.marketingBoostBps, boost);
    m.marketingUntilTurn = turn + 4;
    transaction(m, { id: "business-tx-" + sequence, date, turn, kind: "MARKETING_CAMPAIGN", description: "Launched a marketing campaign", amountMinor: action.amountMinor });
    return { businesses: b, finance: f, event: { type: "BUSINESS_MARKETING", summary: "Marketing campaign launched with a " + (boost / 100).toFixed(1) + "% demand boost for four turns.", details: { amountMinor: action.amountMinor, demandBoostBps: boost, expiresTurn: m.marketingUntilTurn } } };
  }
  if (action.type === "BUSINESS_END_MANDATE") {
    const revenue = getBalance(m.ledger, "revenue");
    const expenses = m.ledger.accounts.filter(item => item.type === "expense").reduce((sum, item) => sum + item.balanceMinor, 0);
    b.history.unshift({ companyId: m.companyId, companyName: m.companyName, branchName: m.branchName, openedAtTurn: m.openedAtTurn, closedAtTurn: turn, managerScore: m.managerScore, customerSatisfaction: m.customerSatisfaction, revenueMinor: revenue, expensesMinor: expenses, operatingProfitMinor: revenue - expenses, closingCashMinor: branchCash(m), closingInventoryMinor: getBalance(m.ledger, "inventory"), outstandingPayablesMinor: getBalance(m.ledger, "payables") });
    if (b.history.length > 20) b.history.length = 20;
    b.mandate = null;
    return { businesses: b, finance: f, event: { type: "BUSINESS_MANDATE_ENDED", summary: "Operating mandate completed. The company retained its branch assets and operating capital.", details: { companyId: m.companyId } } };
  }
  return { businesses: b, finance: f, event: null };
}

export function advanceBusinesses(state, finance, { date, turn, character, timeAllocation, marketRegime = "Expansion" }) {
  const b = clone(state), f = clone(finance), events = [];
  b.lastAdvanceTurn = turn;
  const m = b.mandate;
  if (!m || m.status !== "active" || m.lastAdvanceTurn >= turn) return { businesses: b, finance: f, events };
  deliverPurchaseOrders(b, m, { date, turn }, events);

  const skills = character?.skills ?? {};
  const salesSkill = skills.sales ?? 0, managementSkill = skills.management ?? 0, operationsSkill = skills.operations ?? 0;
  const sideWorkHours = timeAllocation?.sideWork ?? 0;
  const skillEffect = Math.round((salesSkill + managementSkill + operationsSkill - 100) * 15);
  const regimeEffect = marketRegime === "Expansion" ? 700 : marketRegime === "Recovery" ? 900 : marketRegime === "Slowdown" ? -650 : -1100;
  const marketingEffect = turn <= m.marketingUntilTurn ? m.marketingBoostBps : 0;
  const timeEffect = sideWorkHours < 8 ? -1200 : sideWorkHours >= 12 ? 400 : 0;
  let capacity = m.staffCount * m.capacityPerStaff, demandTotal = 0, unitsSold = 0, revenueMinor = 0, cogsMinor = 0, stockouts = 0;

  for (const product of m.products) {
    const random = draw(b.rng, 3001); b.rng.state = random.state;
    const priceEffect = clamp(Math.round((product.basePriceMinor - product.priceMinor) * 5000 / product.basePriceMinor), -5000, 3500);
    const modifier = clamp(10000 + skillEffect + regimeEffect + marketingEffect + timeEffect + priceEffect + random.value - 1500, 2500, 19000);
    const demand = Math.max(0, Math.floor((product.baseDemand * modifier + 5000) / 10000));
    const sold = Math.min(product.inventoryUnits, demand, capacity);
    const cogs = sold === product.inventoryUnits ? product.inventoryValueMinor : product.inventoryUnits > 0 ? mulDiv(product.inventoryValueMinor, sold, product.inventoryUnits) : 0;
    const sales = sold * product.priceMinor;
    demandTotal += demand; unitsSold += sold; stockouts += Math.max(0, demand - sold); capacity -= sold;
    revenueMinor += sales; cogsMinor += cogs;
    if (sold > 0) {
      post(m.ledger, { id: "business-sale-" + turn + "-" + product.id, date, turn, kind: "BUSINESS_SALE", description: "Sales — " + product.name, amountMinor: sales, lines: [line("cash", sales), line("revenue", 0, sales)] });
      post(m.ledger, { id: "business-cogs-" + turn + "-" + product.id, date, turn, kind: "BUSINESS_COGS", description: "Cost of goods sold — " + product.name, amountMinor: cogs, lines: [line("cogs", cogs), line("inventory", 0, cogs)] });
      product.inventoryUnits -= sold;
      product.inventoryValueMinor -= cogs;
      if (product.inventoryUnits === 0) product.inventoryValueMinor = 0;
      transaction(m, { id: "business-tx-sale-" + turn + "-" + product.id, date, turn, kind: "SALES", description: "Sold " + sold + " units of " + product.name, amountMinor: sales, relatedId: product.id });
    }
  }

  addPayable(m, { id: "business-staff-" + turn, date, turn, kind: "staff", amountMinor: m.staffCount * m.staffWageMinor });
  addPayable(m, { id: "business-rent-" + turn, date, turn, kind: "rent", amountMinor: m.rentMinor });
  addPayable(m, { id: "business-utilities-" + turn, date, turn, kind: "utilities", amountMinor: m.utilitiesMinor });
  addPayable(m, { id: "business-manager-" + turn, date, turn, kind: "manager", amountMinor: m.managerPayMinor });
  settlePayables(m, f, { date, turn });

  const recurringExpenses = m.staffCount * m.staffWageMinor + m.rentMinor + m.utilitiesMinor + m.managerPayMinor;
  const operatingExpenses = recurringExpenses + m.actionExpensesMinor;
  const operatingProfit = revenueMinor - cogsMinor - operatingExpenses;
  m.actionExpensesMinor = 0;
  const fillRate = demandTotal > 0 ? Math.round(unitsSold * 100 / demandTotal) : 100;
  m.customerSatisfaction = clamp(m.customerSatisfaction + (fillRate >= 90 ? 2 : fillRate >= 70 ? 0 : -3) + (sideWorkHours >= 8 ? 1 : -1), 0, 100);
  const scoreChange = (operatingProfit >= 0 ? 2 : -3) + (fillRate >= 90 ? 2 : fillRate >= 70 ? 0 : -2) + (sideWorkHours >= 8 ? 1 : -2);
  m.managerScore = clamp(m.managerScore + scoreChange, 0, 100);
  m.totalUnitsSold += unitsSold;
  m.totalStockouts += stockouts;
  m.cumulativeRevenueMinor += revenueMinor;
  m.cumulativeCogsMinor += cogsMinor;
  m.lastAdvanceTurn = turn;
  m.lastWeeklyResult = { turn, date, revenueMinor, cogsMinor, operatingExpensesMinor: operatingExpenses, operatingProfitMinor: operatingProfit, unitsSold, stockouts, fillRateBps: Math.round(fillRate * 100), customerSatisfaction: m.customerSatisfaction, managerScore: m.managerScore };
  m.history.unshift(clone(m.lastWeeklyResult));
  if (m.history.length > 52) m.history.length = 52;
  events.push({ type: "BUSINESS_WEEK_CLOSED", summary: m.branchName + " sold " + unitsSold + " units and recorded " + (operatingProfit >= 0 ? "an operating surplus" : "an operating deficit") + " of " + (Math.abs(operatingProfit) / 100).toFixed(2) + " Credits.", details: { mandateId: m.id, revenueMinor, cogsMinor, operatingExpensesMinor: operatingExpenses, operatingProfitMinor: operatingProfit, unitsSold, stockouts, fillRateBps: Math.round(fillRate * 100), managerScore: m.managerScore } });
  if (m.payables.length) events.push({ type: "BUSINESS_PAYABLES_OUTSTANDING", summary: m.payables.length + " business operating obligations remain unpaid.", details: { mandateId: m.id, outstandingPayablesMinor: getBalance(m.ledger, "payables") } });
  return { businesses: b, finance: f, events };
}

export function getBusinessSummary(state) {
  const m = state?.mandate;
  if (!m) return { active: false, revenueMinor: 0, expensesMinor: 0, profitMinor: 0, cashMinor: 0, inventoryMinor: 0, payablesMinor: 0 };
  const revenueMinor = getBalance(m.ledger, "revenue");
  const expensesMinor = m.ledger.accounts.filter(item => item.type === "expense").reduce((sum, item) => sum + item.balanceMinor, 0);
  return {
    active: true, revenueMinor, expensesMinor, profitMinor: revenueMinor - expensesMinor,
    cashMinor: getBalance(m.ledger, "cash"), inventoryMinor: getBalance(m.ledger, "inventory"),
    transitMinor: getBalance(m.ledger, "inventoryTransit"), payablesMinor: getBalance(m.ledger, "payables"),
    totalUnitsSold: m.totalUnitsSold, totalStockouts: m.totalStockouts, managerScore: m.managerScore,
    customerSatisfaction: m.customerSatisfaction, staffCount: m.staffCount
  };
}
