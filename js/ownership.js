const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const safePositive = value => Number.isSafeInteger(value) && value > 0;
const safeNonNegative = value => Number.isSafeInteger(value) && value >= 0;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const money = value => (value / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COMPANY_SECTORS = ["Technology", "Consumer", "Professional services", "Healthcare", "Logistics", "Hospitality", "Manufacturing"];
const INVESTORS = Object.freeze([
  { id: "cedar-ridge-capital", name: "Cedar Ridge Capital", type: "Institutional investor", capacityMinor: 250000000, dividendBias: 72, growthBias: 48, riskTolerance: 42 },
  { id: "northstar-ventures", name: "Northstar Ventures", type: "Venture investor", capacityMinor: 120000000, dividendBias: 25, growthBias: 92, riskTolerance: 88 },
  { id: "mira-chen", name: "Mira Chen", type: "Angel investor", capacityMinor: 25000000, dividendBias: 38, growthBias: 78, riskTolerance: 70 },
  { id: "atlas-holdings", name: "Atlas Holdings", type: "Private investment group", capacityMinor: 500000000, dividendBias: 84, growthBias: 32, riskTolerance: 35 }
]);
export const OWNERSHIP_TARGETS = Object.freeze([
  { id: "cobalt-digital-works", name: "Cobalt Digital Works", sector: "Technology", description: "A compact analytics and workflow automation studio with a recurring small-business client base.", askingPriceMinor: 1850000, weeklyProfitBps: 34, risk: "Moderate" },
  { id: "harbor-home-supply", name: "Harbor Home Supply", sector: "Consumer", description: "A neighbourhood home essentials distributor with stable repeat demand and tight margins.", askingPriceMinor: 2650000, weeklyProfitBps: 28, risk: "Moderate" },
  { id: "apex-fulfillment", name: "Apex Fulfillment Services", sector: "Logistics", description: "A small fulfilment operator serving independent online merchants.", askingPriceMinor: 4200000, weeklyProfitBps: 39, risk: "Elevated" },
  { id: "wellhaven-clinics", name: "Wellhaven Clinics", sector: "Healthcare", description: "A two-site outpatient services group with predictable demand and higher operating overhead.", askingPriceMinor: 6800000, weeklyProfitBps: 31, risk: "Moderate" }
]);
const targetById = id => OWNERSHIP_TARGETS.find(item => item.id === id);
const investorById = id => INVESTORS.find(item => item.id === id);
const companyById = (state, id) => state?.companies?.find(item => item.id === id);
const shareholderById = (company, id) => company?.shareholders?.find(item => item.id === id);
const playerShares = company => shareholderById(company, "player")?.shares ?? 0;
const outstandingShares = company => company.shareholders.reduce((sum, item) => sum + item.shares, 0);
const equityValue = company => Math.max(0, company.paidInCapitalMinor + company.retainedEarningsMinor);
const sharePrice = company => Math.max(1, Math.floor(equityValue(company) / Math.max(1, outstandingShares(company))));
const playerControls = company => playerShares(company) > outstandingShares(company) / 2;
const validCompanyName = value => typeof value === "string" && value.trim().length >= 3 && value.trim().length <= 48 && !/[<>]/.test(value);

function ensureFinanceAccounts(finance) {
  const specs = [
    ["privateEquity", "Private company investments", "asset", "private-equity"],
    ["shareholderLoans", "Shareholder loan receivables", "asset", "shareholder-loans"]
  ];
  for (const [id, name, type, subtype] of specs) {
    if (!finance.accounts.some(item => item.id === id)) finance.accounts.push({ id, name, type, subtype, balanceMinor: 0 });
  }
}
function postHousehold(finance, { id, date, turn, kind, description, amountMinor, lines, relatedId }) {
  const debit = lines.reduce((sum, item) => sum + item.debitMinor, 0);
  const credit = lines.reduce((sum, item) => sum + item.creditMinor, 0);
  if (!safePositive(amountMinor) || debit !== credit || debit <= 0) throw new Error("Ownership journal entry is not balanced.");
  const byId = new Map(finance.accounts.map(item => [item.id, item]));
  for (const item of lines) {
    const account = byId.get(item.accountId);
    if (!account || !safeNonNegative(item.debitMinor) || !safeNonNegative(item.creditMinor) || (item.debitMinor > 0 && item.creditMinor > 0)) throw new Error("Ownership journal line is invalid.");
  }
  for (const item of lines) {
    const account = byId.get(item.accountId);
    account.balanceMinor += ["asset", "expense"].includes(account.type) ? item.debitMinor - item.creditMinor : item.creditMinor - item.debitMinor;
  }
  finance.ledger.push({ id, date, turn, kind, description, amountMinor, category: "private-equity", relatedId, lines: clone(lines) });
}
function initializeCompanyLedger(company) {
  if (Array.isArray(company.ledger) && Array.isArray(company.ledgerAccounts)) return company;
  company.ledgerSequence = 1;
  company.ledgerAccounts = [
    { id: "cash", name: "Cash", type: "asset", balanceMinor: 0 },
    { id: "shareholderLoans", name: "Shareholder loans payable", type: "liability", balanceMinor: 0 },
    { id: "shareCapital", name: "Share capital", type: "equity", balanceMinor: 0 },
    { id: "retainedEarnings", name: "Retained earnings", type: "equity", balanceMinor: 0 }
  ];
  company.ledger = [];
  if (!Number.isSafeInteger(company.capitalAssetsMinor)) company.capitalAssetsMinor = 0;
  if (!company.ledgerAccounts.some(account => account.id === "capitalAssets")) company.ledgerAccounts.push({ id: "capitalAssets", name: "Capital assets", type: "asset", balanceMinor: 0 });
  const amount = company.cashMinor + company.capitalAssetsMinor;
  if (amount > 0) postCompanyJournal(company, {
    date: company.createdAt, turn: company.foundedAtTurn, kind: "OPENING_BALANCE",
    description: "Opening company balance on ownership-ledger activation",
    lines: [
      { accountId: "cash", debitMinor: company.cashMinor, creditMinor: 0 },
      { accountId: "capitalAssets", debitMinor: company.capitalAssetsMinor, creditMinor: 0 },
      { accountId: "shareCapital", debitMinor: 0, creditMinor: company.paidInCapitalMinor },
      { accountId: "shareholderLoans", debitMinor: 0, creditMinor: company.loanBalanceMinor },
      { accountId: "retainedEarnings", debitMinor: 0, creditMinor: company.retainedEarningsMinor }
    ]
  });
  return company;
}
function postCompanyJournal(company, { date, turn, kind, description, lines }) {
  initializeCompanyLedger(company);
  const debit = lines.reduce((sum, line) => sum + line.debitMinor, 0);
  const credit = lines.reduce((sum, line) => sum + line.creditMinor, 0);
  if (!safePositive(debit) || debit !== credit) throw new Error("Company journal entry is not balanced.");
  const accounts = new Map(company.ledgerAccounts.map(account => [account.id, account]));
  for (const line of lines) {
    const account = accounts.get(line.accountId);
    if (!account || !safeNonNegative(line.debitMinor) || !safeNonNegative(line.creditMinor) || (line.debitMinor > 0 && line.creditMinor > 0)) throw new Error("Company journal line is invalid.");
  }
  for (const line of lines) {
    const account = accounts.get(line.accountId);
    account.balanceMinor += account.type === "asset" ? line.debitMinor - line.creditMinor : line.creditMinor - line.debitMinor;
  }
  company.ledger.unshift({
    id: "company-journal-" + company.id + "-" + company.ledgerSequence++,
    date, turn, kind, description, amountMinor: debit, lines: clone(lines)
  });
}
function postCompanyTransaction(company, kind, amountMinor, date, turn, description) {
  if (!safePositive(amountMinor)) return;
  const entries = {
    EQUITY_CONTRIBUTION: [{ accountId: "cash", debitMinor: amountMinor, creditMinor: 0 }, { accountId: "shareCapital", debitMinor: 0, creditMinor: amountMinor }],
    SHARES_ISSUED: [{ accountId: "cash", debitMinor: amountMinor, creditMinor: 0 }, { accountId: "shareCapital", debitMinor: 0, creditMinor: amountMinor }],
    SHAREHOLDER_LOAN: [{ accountId: "cash", debitMinor: amountMinor, creditMinor: 0 }, { accountId: "shareholderLoans", debitMinor: 0, creditMinor: amountMinor }],
    SHAREHOLDER_LOAN_REPAYMENT: [{ accountId: "shareholderLoans", debitMinor: amountMinor, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: amountMinor }],
    DIVIDEND_PAID: [{ accountId: "retainedEarnings", debitMinor: amountMinor, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: amountMinor }],
    SHARES_BOUGHT_BACK: [{ accountId: "shareCapital", debitMinor: amountMinor, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: amountMinor }]
  };
  const lines = entries[kind];
  if (lines) postCompanyJournal(company, { date, turn, kind, description, lines });
}
export function migrateOwnershipLedger(state) {
  for (const company of state?.companies ?? []) { initializeCompanyLedger(company); if (!Array.isArray(company.elections)) company.elections = []; }
  return state;
}
function transaction(state, company, turn, date, kind, description, amountMinor, details = {}) {
  const entry = { id: "ownership-" + state.nextId++, companyId: company.id, turn, date, kind, description, amountMinor, details: clone(details) };
  postCompanyTransaction(company, kind, amountMinor, date, turn, description);
  state.transactions.unshift(entry);
  if (state.transactions.length > 250) state.transactions.length = 250;
  company.transactions.unshift(entry.id);
  if (company.transactions.length > 100) company.transactions.length = 100;
  return entry;
}
function makeCompany({ id, name, sector, description, capitalMinor, shares, turn, date, weeklyProfitBps, acquired = false }) {
  const company = {
    id, name, sector, description, status: "active", foundedAtTurn: turn, acquired,
    authorizedShares: Math.max(shares, 1000000), issuedShares: shares, outstandingShares: shares,
    shareholders: [{ id: "player", name: "You", type: "Founder", shares, costBasisMinor: capitalMinor, isPlayer: true }],
    cashMinor: capitalMinor, capitalAssetsMinor: 0, paidInCapitalMinor: capitalMinor, loanBalanceMinor: 0, retainedEarningsMinor: 0,
    cumulativeProfitMinor: 0, cumulativeDividendsMinor: 0, weeklyProfitBps,
    estimatedValueMinor: capitalMinor, sharePriceMinor: Math.max(1, Math.floor(capitalMinor / shares)),
    board: [{ seat: "Chair", holderId: "player", appointedAtTurn: turn }],
    executives: [{ role: "CEO", holderId: "player", appointedAtTurn: turn }, { role: "CFO", holderId: "player", appointedAtTurn: turn }],
    resolutions: [], elections: [], transactions: [], lastAdvanceTurn: turn, createdAt: date,
    ledgerSequence: 1,
    ledgerAccounts: [
      { id: "cash", name: "Cash", type: "asset", balanceMinor: 0 },
      { id: "capitalAssets", name: "Capital assets", type: "asset", balanceMinor: 0 },
      { id: "shareholderLoans", name: "Shareholder loans payable", type: "liability", balanceMinor: 0 },
      { id: "shareCapital", name: "Share capital", type: "equity", balanceMinor: 0 },
      { id: "retainedEarnings", name: "Retained earnings", type: "equity", balanceMinor: 0 }
    ],
    ledger: []
  };
  postCompanyJournal(company, { date, turn, kind: "COMPANY_FORMATION", description: "Initial paid-in capital", lines: [
    { accountId: "cash", debitMinor: capitalMinor, creditMinor: 0 },
    { accountId: "shareCapital", debitMinor: 0, creditMinor: capitalMinor }
  ] });
  return company;
}
export function createOwnershipState() {
  return { nextId: 1, companies: [], transactions: [], acquisitionHistory: [] };
}
export function getOwnershipPortfolio(state) {
  const companies = state?.companies ?? [];
  const holdings = companies.map(company => {
    const shares = playerShares(company), total = outstandingShares(company), value = equityValue(company);
    const costBasisMinor = shareholderById(company, "player")?.costBasisMinor ?? 0;
    return { companyId: company.id, name: company.name, sector: company.sector, shares, totalShares: total, ownershipBps: total ? Math.floor(shares * 10000 / total) : 0, costBasisMinor, estimatedValueMinor: total ? Math.floor(value * shares / total) : 0, unrealizedMinor: (total ? Math.floor(value * shares / total) : 0) - costBasisMinor, cashMinor: company.cashMinor, retainedEarningsMinor: company.retainedEarningsMinor, loanBalanceMinor: company.loanBalanceMinor, sharePriceMinor: company.sharePriceMinor };
  });
  return { companies: holdings, companyCount: holdings.length, investedMinor: holdings.reduce((sum, item) => sum + item.costBasisMinor, 0), estimatedValueMinor: holdings.reduce((sum, item) => sum + item.estimatedValueMinor, 0), unrealizedMinor: holdings.reduce((sum, item) => sum + item.unrealizedMinor, 0) };
}
export function validateOwnershipAction(state, finance, character, action) {
  if (!state || !Array.isArray(state.companies) || !finance?.initialized || !character) return { valid: false, reason: "Create a character and initialize household Finance before managing company ownership." };
  const company = action.companyId ? companyById(state, action.companyId) : null;
  if (action.companyId && !company) return { valid: false, reason: "The selected company could not be found." };
  const cash = finance.accounts.find(item => item.id === "cash")?.balanceMinor ?? 0;
  const amount = action.amountMinor;
  if (action.type === "OWNERSHIP_FOUND_COMPANY") {
    if (!validCompanyName(action.name) || state.companies.some(item => item.name.toLowerCase() === action.name.trim().toLowerCase())) return { valid: false, reason: "Enter a unique company name between 3 and 48 characters." };
    if (!COMPANY_SECTORS.includes(action.sector)) return { valid: false, reason: "Choose a valid company sector." };
    if (!safePositive(amount) || amount < 25000 || amount > cash) return { valid: false, reason: "Founding capital must be at least 250 Credits and cannot exceed available household cash." };
    if (!Number.isInteger(action.shares) || action.shares < 1000 || action.shares > 1000000) return { valid: false, reason: "Issue between 1,000 and 1,000,000 founder shares." };
    if (state.companies.length >= 20) return { valid: false, reason: "Your portfolio has reached the 20-company limit." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_ACQUIRE_TARGET") {
    const target = targetById(action.targetId), ownershipBps = action.ownershipBps ?? 10000;
    if (!target || state.companies.some(item => item.id === target.id)) return { valid: false, reason: "This acquisition target is unavailable or already owned." };
    if (!Number.isInteger(ownershipBps) || ownershipBps < 1000 || ownershipBps > 10000) return { valid: false, reason: "Choose an acquisition stake between 10% and 100%." };
    const consideration = Math.floor(target.askingPriceMinor * ownershipBps / 10000);
    if (!safePositive(consideration) || consideration > cash) return { valid: false, reason: "There is not enough household cash for the selected acquisition stake." };
    if (state.companies.length >= 20) return { valid: false, reason: "Your portfolio has reached the 20-company limit." };
    return { valid: true };
  }
  if (!company) return { valid: false, reason: "Select a company first." };
  if (company.status !== "active") return { valid: false, reason: "This company is not active." };
  if (["OWNERSHIP_CONTRIBUTE_CAPITAL","OWNERSHIP_ISSUE_SHARES","OWNERSHIP_BUYBACK_SHARES","OWNERSHIP_SELL_SHARES","OWNERSHIP_TRANSFER_SHARES"].includes(action.type) && (company.resolutions.some(item => item.status === "open") || (company.elections ?? []).some(item => item.status === "open"))) return { valid: false, reason: "Close open shareholder votes and board elections before changing the share register." };
  if (action.type === "OWNERSHIP_CONTRIBUTE_CAPITAL" || action.type === "OWNERSHIP_TAKE_LOAN") {
    if (!safePositive(amount) || amount > cash) return { valid: false, reason: "Enter a positive amount within available household cash." };
    if (action.type === "OWNERSHIP_CONTRIBUTE_CAPITAL") {
      const newShares = Math.floor(amount / sharePrice(company));
      if (newShares < 1 || company.issuedShares + newShares > company.authorizedShares) return { valid: false, reason: "The contribution would exceed the company's authorized share limit." };
    }
    if (action.type === "OWNERSHIP_TAKE_LOAN" && !playerShares(company)) return { valid: false, reason: "Only a current shareholder can advance a shareholder loan." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_REPAY_LOAN") {
    if (!safePositive(amount) || amount > company.loanBalanceMinor || amount > company.cashMinor) return { valid: false, reason: "Repayment must be positive and cannot exceed the loan balance or company cash." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_PROPOSE_DIVIDEND") {
    if (company.resolutions.some(item => item.status === "open")) return { valid: false, reason: "Close the existing shareholder resolution before proposing a dividend." };
    if (!playerControls(company)) return { valid: false, reason: "A controlling shareholder is required to submit a dividend proposal." };
    const reserve = Math.floor(company.paidInCapitalMinor * 20 / 100);
    const available = Math.min(company.retainedEarningsMinor, Math.max(0, company.cashMinor - company.loanBalanceMinor - reserve));
    if (!safePositive(amount) || amount > available) return { valid: false, reason: "The dividend exceeds distributable retained earnings after debt and the operating reserve." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_CREATE_RESOLUTION") {
    if (!playerShares(company) || typeof action.title !== "string" || action.title.trim().length < 4 || action.title.trim().length > 100 || !["CAPITAL_EXPANSION", "EXECUTIVE_APPOINTMENT"].includes(action.resolutionType)) return { valid: false, reason: "A valid shareholder resolution title and executable type are required." };
    if (company.resolutions.some(item => item.status === "open")) return { valid: false, reason: "Close the existing shareholder resolution before opening another." };
    if (action.resolutionType === "CAPITAL_EXPANSION") {
      const reserve = Math.floor(company.paidInCapitalMinor * 20 / 100);
      if (!safePositive(amount) || amount > Math.max(0, company.cashMinor - company.loanBalanceMinor - reserve)) return { valid: false, reason: "Capital expenditure must be funded from cash above debt and the operating reserve." };
    }
    if (action.resolutionType === "EXECUTIVE_APPOINTMENT" && (!["CEO", "CFO", "COO"].includes(action.role) || !company.shareholders.some(item => item.id === action.candidateId && item.shares > 0))) return { valid: false, reason: "Select an eligible shareholder and executive role." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_VOTE") {
    const resolution = company.resolutions.find(item => item.id === action.resolutionId && item.status === "open");
    if (!resolution || !["for", "against", "abstain"].includes(action.vote)) return { valid: false, reason: "Choose an open resolution and a valid vote." };
    if (!playerShares(company)) return { valid: false, reason: "You must own voting shares to vote." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_CLOSE_VOTE") {
    const resolution = company.resolutions.find(item => item.id === action.resolutionId && item.status === "open");
    if (!resolution) return { valid: false, reason: "This shareholder resolution is not open." };
    if (!resolution.votes.some(item => item.shareholderId === "player")) return { valid: false, reason: "Cast your vote before closing the resolution." };
    if (resolution.type === "DIVIDEND") {
      const reserve = Math.floor(company.paidInCapitalMinor * 20 / 100);
      const available = Math.min(company.retainedEarningsMinor, Math.max(0, company.cashMinor - company.loanBalanceMinor - reserve));
      if (resolution.amountMinor > available) return { valid: false, reason: "The company no longer has sufficient distributable cash to settle this dividend." };
    }
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_TRANSFER_SHARES") {
    const seller = shareholderById(company, action.sellerId), buyer = shareholderById(company, action.buyerId);
    if (!seller || (!buyer && action.buyerId !== "player") || seller.id === action.buyerId || !Number.isInteger(action.shares) || action.shares < 1 || action.shares > seller.shares || !safePositive(action.pricePerShareMinor)) return { valid: false, reason: "Choose two different existing shareholders, a valid share quantity and a positive negotiated price." };
    const proceeds = action.shares * action.pricePerShareMinor;
    const buyerCash = action.buyerId === "player" ? cash : (Number.isSafeInteger(buyer?.cashMinor) ? buyer.cashMinor : (investorById(action.buyerId)?.capacityMinor ?? 0));
    if (!safePositive(proceeds) || proceeds > buyerCash) return { valid: false, reason: "The buyer does not have enough available funds for this negotiated transfer." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_OPEN_BOARD_ELECTION") {
    if (!playerShares(company) || !Number.isInteger(action.termTurns) || action.termTurns < 4 || action.termTurns > 52 || (company.elections ?? []).some(item => item.status === "open")) return { valid: false, reason: "A shareholder must open an election with a director term between 4 and 52 turns; only one election may be open." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_VOTE_BOARD_ELECTION") {
    const election = company.elections?.find(item => item.id === action.electionId && item.status === "open");
    if (!election || !election.candidates.includes(action.candidateId) || !playerShares(company)) return { valid: false, reason: "Choose an eligible candidate in an open board election." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_CLOSE_BOARD_ELECTION") {
    const election = company.elections?.find(item => item.id === action.electionId && item.status === "open");
    if (!election || !election.votes.some(item => item.shareholderId === "player")) return { valid: false, reason: "Cast your shareholder vote before closing this board election." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_ISSUE_SHARES") {
    const investor = investorById(action.investorId);
    if (!playerControls(company) || !investor || !Number.isInteger(action.shares) || action.shares < 1 || action.shares > 1000000) return { valid: false, reason: "A controlling shareholder must select a valid investor and share quantity." };
    const price = sharePrice(company), cost = price * action.shares;
    if (!safePositive(cost) || cost > investor.capacityMinor || company.issuedShares + action.shares > company.authorizedShares) return { valid: false, reason: "The investor capacity or authorized share limit would be exceeded." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_BUYBACK_SHARES") {
    const shares = action.shares, holding = shareholderById(company, "player");
    if (!Number.isInteger(shares) || shares < 1 || shares > (holding?.shares ?? 0)) return { valid: false, reason: "You do not hold that many shares." };
    const proceeds = sharePrice(company) * shares, reserve = Math.floor(company.paidInCapitalMinor * 20 / 100);
    if (proceeds > company.cashMinor - company.loanBalanceMinor - reserve || proceeds > company.paidInCapitalMinor) return { valid: false, reason: "The company cannot fund this buyback while preserving debt, paid-in capital and its operating reserve." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_SELL_SHARES") {
    const holding = shareholderById(company, "player"), buyer = investorById(action.buyerId);
    if (!buyer || !Number.isInteger(action.shares) || action.shares < 1 || action.shares > (holding?.shares ?? 0) || !safePositive(action.pricePerShareMinor)) return { valid: false, reason: "Choose a valid investor, share quantity and positive sale price." };
    const proceeds = action.shares * action.pricePerShareMinor;
    if (!safePositive(proceeds) || proceeds > buyer.capacityMinor) return { valid: false, reason: "The buyer cannot fund this secondary share purchase." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_APPOINT_EXECUTIVE") {
    if (!playerControls(company) || !["CEO", "CFO", "COO"].includes(action.role) || !company.shareholders.some(item => item.id === action.candidateId)) return { valid: false, reason: "Only a controlling shareholder can appoint an eligible shareholder to an executive role." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_APPOINT_DIRECTOR") {
    if (!playerControls(company) || !company.shareholders.some(item => item.id === action.candidateId) || !["Chair", "Director"].includes(action.seat)) return { valid: false, reason: "Only a controlling shareholder can appoint an eligible shareholder to a board seat." };
    if (action.seat === "Director" && company.board.some(item => item.holderId === action.candidateId)) return { valid: false, reason: "This shareholder already holds a board seat." };
    return { valid: true };
  }
  if (action.type === "OWNERSHIP_REMOVE_DIRECTOR") {
    const director = company.board.find(item => item.holderId === action.candidateId && item.seat === "Director");
    if (!playerControls(company) || !director) return { valid: false, reason: "Only a controlling shareholder can remove an appointed director." };
    return { valid: true };
  }
  return { valid: false, reason: "Unsupported ownership action." };
}
export function applyOwnershipAction(state, finance, character, action, { date, turn, sequence }) {
  const next = clone(state), company = action.companyId ? companyById(next, action.companyId) : null;
  ensureFinanceAccounts(finance);
  const postId = suffix => "ownership-journal-" + sequence + "-" + suffix;
  if (action.type === "OWNERSHIP_FOUND_COMPANY") {
    const id = "owned-company-" + next.nextId++;
    const name = action.name.trim(), shares = action.shares, capital = action.amountMinor;
    const created = makeCompany({ id, name, sector: action.sector, description: String(action.description ?? "").trim().slice(0, 240), capitalMinor: capital, shares, turn, date, weeklyProfitBps: 18 + Math.floor((character.skills.operations ?? 0) / 8) + Math.floor((character.skills.sales ?? 0) / 20) });
    next.companies.push(created);
    postHousehold(finance, { id: postId("found"), date, turn, kind: "COMPANY_FOUNDING", description: "Founding capital invested in " + name, amountMinor: capital, relatedId: id, lines: [{ accountId: "privateEquity", debitMinor: capital, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: capital }] });
    transaction(next, created, turn, date, "COMPANY_FOUNDED", "Founded " + name, capital, { shares, sector: action.sector });
    return { ownership: next, finance, event: { type: "COMPANY_FOUNDED", summary: name + " was founded with " + money(capital) + " Credits of paid-in capital.", details: { companyId: id, capitalMinor: capital, shares } } };
  }
  if (action.type === "OWNERSHIP_ACQUIRE_TARGET") {
    const target = targetById(action.targetId), id = target.id, capital = target.askingPriceMinor, totalShares = 100000;
    const ownershipBps = action.ownershipBps ?? 10000, playerShares = Math.max(1, Math.floor(totalShares * ownershipBps / 10000));
    const consideration = Math.floor(capital * ownershipBps / 10000), sellerShares = totalShares - playerShares;
    const created = makeCompany({ id, name: target.name, sector: target.sector, description: target.description, capitalMinor: capital, shares: totalShares, turn, date, weeklyProfitBps: target.weeklyProfitBps, acquired: true });
    created.shareholders = [{ id: "player", name: "You", type: "Shareholder", shares: playerShares, costBasisMinor: consideration, isPlayer: true }];
    if (sellerShares > 0) created.shareholders.push({ id: "seller-" + id, name: "Original shareholders", type: "Existing owners", shares: sellerShares, costBasisMinor: capital - consideration, isPlayer: false });
    next.companies.push(created);
    postHousehold(finance, { id: postId("acquire"), date, turn, kind: "COMPANY_ACQUISITION", description: "Acquired " + (ownershipBps === 10000 ? "100% of " : ownershipBps / 100 + "% of ") + target.name, amountMinor: consideration, relatedId: id, lines: [{ accountId: "privateEquity", debitMinor: consideration, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: consideration }] });
    next.acquisitionHistory.unshift({ id: "acquisition-" + id, companyId: id, companyName: target.name, turn, date, considerationMinor: consideration, ownershipBps });
    transaction(next, created, turn, date, "COMPANY_ACQUIRED", "Acquired " + ownershipBps / 100 + "% of " + target.name, consideration, { ownershipBps, shares: playerShares });
    return { ownership: next, finance, event: { type: "COMPANY_ACQUIRED", summary: "Acquired " + ownershipBps / 100 + "% of " + target.name + " for " + money(consideration) + " Credits.", details: { companyId: id, considerationMinor: consideration, ownershipBps } } };
  }
  if (action.type === "OWNERSHIP_CONTRIBUTE_CAPITAL") {
    const price = sharePrice(company), shares = Math.floor(action.amountMinor / price), invested = shares * price;
    if (!shares || !safePositive(invested)) throw new Error("The contribution cannot purchase a whole share at the current price.");
    const holding = shareholderById(company, "player");
    if (holding) { holding.shares += shares; holding.costBasisMinor += invested; }
    else company.shareholders.push({ id: "player", name: "You", type: "Shareholder", shares, costBasisMinor: invested, isPlayer: true });
    company.issuedShares += shares; company.outstandingShares += shares; company.paidInCapitalMinor += invested; company.cashMinor += invested;
    company.estimatedValueMinor = equityValue(company); company.sharePriceMinor = sharePrice(company);
    postHousehold(finance, { id: postId("contribution"), date, turn, kind: "EQUITY_CONTRIBUTION", description: "Additional equity contributed to " + company.name, amountMinor: invested, relatedId: company.id, lines: [{ accountId: "privateEquity", debitMinor: invested, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: invested }] });
    transaction(next, company, turn, date, "EQUITY_CONTRIBUTION", "Additional equity contribution", invested, { sharesIssued: shares, pricePerShareMinor: price });
    return { ownership: next, finance, event: { type: "EQUITY_CONTRIBUTION", summary: money(invested) + " Credits invested in " + company.name + " for " + shares.toLocaleString("en-US") + " new shares.", details: { companyId: company.id, shares, amountMinor: invested } } };
  }
  if (action.type === "OWNERSHIP_TAKE_LOAN") {
    company.cashMinor += action.amountMinor; company.loanBalanceMinor += action.amountMinor;
    postHousehold(finance, { id: postId("loan"), date, turn, kind: "SHAREHOLDER_LOAN_ADVANCE", description: "Shareholder loan advanced to " + company.name, amountMinor: action.amountMinor, relatedId: company.id, lines: [{ accountId: "shareholderLoans", debitMinor: action.amountMinor, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: action.amountMinor }] });
    transaction(next, company, turn, date, "SHAREHOLDER_LOAN", "Shareholder loan advanced", action.amountMinor);
    return { ownership: next, finance, event: { type: "SHAREHOLDER_LOAN", summary: "Advanced " + money(action.amountMinor) + " Credits to " + company.name + " as a repayable shareholder loan.", details: { companyId: company.id, amountMinor: action.amountMinor } } };
  }
  if (action.type === "OWNERSHIP_REPAY_LOAN") {
    company.cashMinor -= action.amountMinor; company.loanBalanceMinor -= action.amountMinor;
    postHousehold(finance, { id: postId("repayment"), date, turn, kind: "SHAREHOLDER_LOAN_REPAYMENT", description: "Shareholder loan repayment from " + company.name, amountMinor: action.amountMinor, relatedId: company.id, lines: [{ accountId: "cash", debitMinor: action.amountMinor, creditMinor: 0 }, { accountId: "shareholderLoans", debitMinor: 0, creditMinor: action.amountMinor }] });
    transaction(next, company, turn, date, "SHAREHOLDER_LOAN_REPAYMENT", "Repaid shareholder loan", action.amountMinor);
    return { ownership: next, finance, event: { type: "SHAREHOLDER_LOAN_REPAID", summary: company.name + " repaid " + money(action.amountMinor) + " Credits of shareholder loans.", details: { companyId: company.id, amountMinor: action.amountMinor } } };
  }
  if (action.type === "OWNERSHIP_PROPOSE_DIVIDEND") {
    const id = "resolution-" + next.nextId++;
    company.resolutions.unshift({ id, title: "Declare shareholder dividend", type: "DIVIDEND", amountMinor: action.amountMinor, status: "open", createdAtTurn: turn, votes: [], outcome: null });
    transaction(next, company, turn, date, "DIVIDEND_PROPOSED", "Proposed shareholder dividend", action.amountMinor, { resolutionId: id });
    return { ownership: next, finance, event: { type: "DIVIDEND_PROPOSED", summary: "Dividend proposal opened for " + money(action.amountMinor) + " Credits. Shareholders must vote before payment.", details: { companyId: company.id, resolutionId: id } } };
  }
  if (action.type === "OWNERSHIP_CREATE_RESOLUTION") {
    const id = "resolution-" + next.nextId++;
    company.resolutions.unshift({ id, title: action.title.trim(), type: action.resolutionType, amountMinor: action.resolutionType === "CAPITAL_EXPANSION" ? action.amountMinor : 0, role: action.role ?? null, candidateId: action.candidateId ?? null, status: "open", createdAtTurn: turn, votes: [], outcome: null });
    transaction(next, company, turn, date, "RESOLUTION_OPENED", "Opened shareholder resolution: " + action.title.trim(), 0, { resolutionId: id, resolutionType: action.resolutionType });
    return { ownership: next, finance, event: { type: "RESOLUTION_OPENED", summary: "Shareholder resolution opened: " + action.title.trim() + ".", details: { companyId: company.id, resolutionId: id } } };
  }
  if (action.type === "OWNERSHIP_VOTE") {
    const resolution = company.resolutions.find(item => item.id === action.resolutionId);
    const existing = resolution.votes.find(item => item.shareholderId === "player");
    const vote = { shareholderId: "player", shares: playerShares(company), choice: action.vote, turn };
    if (existing) Object.assign(existing, vote); else resolution.votes.push(vote);
    transaction(next, company, turn, date, "SHAREHOLDER_VOTE", "Voted " + action.vote + " on " + resolution.title, 0, { resolutionId: resolution.id, vote: action.vote, shares: vote.shares });
    return { ownership: next, finance, event: { type: "SHAREHOLDER_VOTE", summary: "Your vote was recorded with " + vote.shares.toLocaleString("en-US") + " voting shares.", details: { companyId: company.id, resolutionId: resolution.id, vote: action.vote } } };
  }
  if (action.type === "OWNERSHIP_CLOSE_VOTE") {
    const resolution = company.resolutions.find(item => item.id === action.resolutionId);
    for (const holder of company.shareholders.filter(item => item.id !== "player" && item.shares > 0)) {
      if (resolution.votes.some(item => item.shareholderId === holder.id)) continue;
      const profile = investorById(holder.id);
      let choice = "abstain";
      if (resolution.type === "DIVIDEND") {
        const ratio = company.retainedEarningsMinor > 0 ? resolution.amountMinor / company.retainedEarningsMinor : 1;
        choice = (profile?.dividendBias ?? 50) >= Math.min(95, Math.round(ratio * 100)) ? "for" : "against";
      } else if (resolution.type === "CAPITAL_EXPANSION") {
        const ratio = company.cashMinor > 0 ? resolution.amountMinor / company.cashMinor : 1;
        choice = (profile?.growthBias ?? 50) >= Math.round(ratio * 100) ? "for" : "against";
      } else if (resolution.type === "EXECUTIVE_APPOINTMENT") {
        choice = resolution.candidateId === holder.id || (resolution.candidateId === "player" && (character?.skills?.leadership ?? 0) >= 45) ? "for" : "against";
      }
      resolution.votes.push({ shareholderId: holder.id, shares: holder.shares, choice, turn, automatic: true });
    }
    const cast = resolution.votes.reduce((sum, item) => sum + (item.choice === "abstain" ? 0 : item.shares), 0);
    const yes = resolution.votes.filter(item => item.choice === "for").reduce((sum, item) => sum + item.shares, 0);
    const quorum = cast >= Math.ceil(company.outstandingShares * 0.5);
    const passed = quorum && yes > cast / 2;
    resolution.status = passed ? "passed" : "rejected";
    resolution.outcome = { turn, date, votesFor: yes, votesAgainst: resolution.votes.filter(item => item.choice === "against").reduce((sum, item) => sum + item.shares, 0), quorum, castShares: cast };
    if (passed && resolution.type === "DIVIDEND") {
      const total = resolution.amountMinor, shares = outstandingShares(company);
      const reserve = Math.floor(company.paidInCapitalMinor * 20 / 100);
      const available = Math.min(company.retainedEarningsMinor, Math.max(0, company.cashMinor - company.loanBalanceMinor - reserve));
      if (total > available) throw new Error("The company no longer has sufficient distributable cash to settle this dividend.");
      let paid = 0;
      const recipients = company.shareholders.filter(item => item.shares > 0);
      recipients.forEach((holder, index) => {
        const amount = index === recipients.length - 1 ? total - paid : Math.floor(total * holder.shares / shares);
        paid += amount;
        if (holder.id === "player" && amount > 0) postHousehold(finance, { id: postId("dividend"), date, turn, kind: "COMPANY_DIVIDEND", description: "Dividend received from " + company.name, amountMinor: amount, relatedId: company.id, lines: [{ accountId: "cash", debitMinor: amount, creditMinor: 0 }, { accountId: "income", debitMinor: 0, creditMinor: amount }] });
        holder.lastDividendMinor = (holder.lastDividendMinor ?? 0) + amount;
      });
      company.cashMinor -= total; company.retainedEarningsMinor -= total; company.cumulativeDividendsMinor += total;
      company.estimatedValueMinor = equityValue(company); company.sharePriceMinor = sharePrice(company);
      transaction(next, company, turn, date, "DIVIDEND_PAID", "Paid shareholder dividend", total, { resolutionId: resolution.id, playerReceiptMinor: company.shareholders.find(item => item.id === "player")?.lastDividendMinor ?? 0 });
    }
    if (passed && resolution.type === "CAPITAL_EXPANSION") {
      const amount = resolution.amountMinor, reserve = Math.floor(company.paidInCapitalMinor * 20 / 100);
      if (!safePositive(amount) || amount > Math.max(0, company.cashMinor - company.loanBalanceMinor - reserve)) throw new Error("The company can no longer fund this approved capital expansion.");
      company.cashMinor -= amount; company.capitalAssetsMinor += amount;
      postCompanyJournal(company, { date, turn, kind: "CAPITAL_EXPANSION", description: "Approved capital expansion: " + resolution.title, lines: [
        { accountId: "capitalAssets", debitMinor: amount, creditMinor: 0 },
        { accountId: "cash", debitMinor: 0, creditMinor: amount }
      ] });
      transaction(next, company, turn, date, "CAPITAL_EXPANSION_EXECUTED", "Executed capital expansion: " + resolution.title, amount, { resolutionId: resolution.id });
    }
    if (passed && resolution.type === "EXECUTIVE_APPOINTMENT") {
      const existing = company.executives.find(item => item.role === resolution.role);
      const appointment = { role: resolution.role, holderId: resolution.candidateId, appointedAtTurn: turn, approvedByResolutionId: resolution.id };
      if (existing) Object.assign(existing, appointment); else company.executives.push(appointment);
      transaction(next, company, turn, date, "EXECUTIVE_APPOINTED_BY_RESOLUTION", "Appointed " + shareholderById(company, resolution.candidateId).name + " as " + resolution.role, 0, appointment);
    }
    transaction(next, company, turn, date, "RESOLUTION_CLOSED", "Shareholder resolution " + resolution.status, 0, { resolutionId: resolution.id, outcome: resolution.outcome });
    return { ownership: next, finance, event: { type: "RESOLUTION_CLOSED", summary: "Resolution " + resolution.status + (resolution.type === "DIVIDEND" && passed ? "; dividend settled to eligible shareholders." : ".") , details: { companyId: company.id, resolutionId: resolution.id, outcome: resolution.outcome } } };
  }
  if (action.type === "OWNERSHIP_ISSUE_SHARES") {
    const investor = investorById(action.investorId), price = sharePrice(company), amount = price * action.shares;
    let holder = shareholderById(company, investor.id);
    if (holder) holder.shares += action.shares;
    else { holder = { id: investor.id, name: investor.name, type: investor.type, shares: action.shares, costBasisMinor: amount, isPlayer: false }; company.shareholders.push(holder); }
    company.issuedShares += action.shares; company.outstandingShares += action.shares; company.paidInCapitalMinor += amount; company.cashMinor += amount;
    company.estimatedValueMinor = equityValue(company); company.sharePriceMinor = sharePrice(company);
    transaction(next, company, turn, date, "SHARES_ISSUED", "Issued shares to " + investor.name, amount, { investorId: investor.id, shares: action.shares, pricePerShareMinor: price });
    return { ownership: next, finance, event: { type: "SHARES_ISSUED", summary: "Issued " + action.shares.toLocaleString("en-US") + " shares to " + investor.name + " for " + money(amount) + " Credits.", details: { companyId: company.id, investorId: investor.id, shares: action.shares, amountMinor: amount } } };
  }
  if (action.type === "OWNERSHIP_BUYBACK_SHARES") {
    const holding = shareholderById(company, "player"), price = sharePrice(company), proceeds = price * action.shares;
    const basis = Math.floor(holding.costBasisMinor * action.shares / holding.shares), gain = proceeds - basis;
    holding.shares -= action.shares; holding.costBasisMinor -= basis;
    company.issuedShares -= action.shares; company.outstandingShares -= action.shares; company.cashMinor -= proceeds; company.paidInCapitalMinor -= proceeds;
    if (holding.shares === 0) company.shareholders = company.shareholders.filter(item => item.id !== "player");
    const lines = [{ accountId: "cash", debitMinor: proceeds, creditMinor: 0 }, { accountId: "privateEquity", debitMinor: 0, creditMinor: basis }];
    if (gain > 0) lines.push({ accountId: "income", debitMinor: 0, creditMinor: gain });
    if (gain < 0) lines.push({ accountId: "expense", debitMinor: -gain, creditMinor: 0 });
    postHousehold(finance, { id: postId("buyback"), date, turn, kind: "EQUITY_BUYBACK", description: "Sold shares back to " + company.name, amountMinor: proceeds, relatedId: company.id, lines });
    company.estimatedValueMinor = equityValue(company); company.sharePriceMinor = sharePrice(company);
    transaction(next, company, turn, date, "SHARES_BOUGHT_BACK", "Company repurchased founder shares", proceeds, { shares: action.shares, realizedGainMinor: gain, pricePerShareMinor: price });
    return { ownership: next, finance, event: { type: "SHARES_BOUGHT_BACK", summary: "Sold " + action.shares.toLocaleString("en-US") + " shares back to " + company.name + " for " + money(proceeds) + " Credits.", details: { companyId: company.id, shares: action.shares, realizedGainMinor: gain } } };
  }
  if (action.type === "OWNERSHIP_SELL_SHARES") {
    const holding = shareholderById(company, "player"), buyer = investorById(action.buyerId), shares = action.shares;
    const proceeds = shares * action.pricePerShareMinor, basis = Math.floor(holding.costBasisMinor * shares / holding.shares), gain = proceeds - basis;
    let buyerHolding = shareholderById(company, buyer.id);
    holding.shares -= shares; holding.costBasisMinor -= basis;
    if (holding.shares === 0) company.shareholders = company.shareholders.filter(item => item.id !== "player");
    if (buyerHolding) { buyerHolding.shares += shares; buyerHolding.costBasisMinor += proceeds; }
    else company.shareholders.push({ id: buyer.id, name: buyer.name, type: buyer.type, shares, costBasisMinor: proceeds, isPlayer: false });
    const lines = [{ accountId: "cash", debitMinor: proceeds, creditMinor: 0 }, { accountId: "privateEquity", debitMinor: 0, creditMinor: basis }];
    if (gain > 0) lines.push({ accountId: "income", debitMinor: 0, creditMinor: gain });
    if (gain < 0) lines.push({ accountId: "expense", debitMinor: -gain, creditMinor: 0 });
    postHousehold(finance, { id: postId("secondary-sale"), date, turn, kind: "EQUITY_SECONDARY_SALE", description: "Sold shares in " + company.name + " to " + buyer.name, amountMinor: proceeds, relatedId: company.id, lines });
    transaction(next, company, turn, date, "SECONDARY_SHARE_SALE", "Sold shares to " + buyer.name, proceeds, { buyerId: buyer.id, shares, pricePerShareMinor: action.pricePerShareMinor, realizedGainMinor: gain });
    return { ownership: next, finance, event: { type: "SECONDARY_SHARE_SALE", summary: "Sold " + shares.toLocaleString("en-US") + " shares in " + company.name + " to " + buyer.name + " for " + money(proceeds) + " Credits.", details: { companyId: company.id, shares, proceedsMinor: proceeds, realizedGainMinor: gain } } };
  }
  if (action.type === "OWNERSHIP_APPOINT_EXECUTIVE") {
    const existing = company.executives.find(item => item.role === action.role);
    const appointment = { role: action.role, holderId: action.candidateId, appointedAtTurn: turn };
    if (existing) Object.assign(existing, appointment); else company.executives.push(appointment);
    transaction(next, company, turn, date, "EXECUTIVE_APPOINTED", "Appointed " + shareholderById(company, action.candidateId).name + " as " + action.role, 0, appointment);
    return { ownership: next, finance, event: { type: "EXECUTIVE_APPOINTED", summary: "Executive appointment recorded: " + action.role + ".", details: { companyId: company.id, ...appointment } } };
  }
  if (action.type === "OWNERSHIP_APPOINT_DIRECTOR") {
    if (action.seat === "Chair") {
      const chair = company.board.find(item => item.seat === "Chair");
      const appointment = { seat: "Chair", holderId: action.candidateId, appointedAtTurn: turn };
      if (chair) Object.assign(chair, appointment); else company.board.push(appointment);
    } else company.board.push({ seat: "Director", holderId: action.candidateId, appointedAtTurn: turn });
    transaction(next, company, turn, date, "DIRECTOR_APPOINTED", "Appointed " + shareholderById(company, action.candidateId).name + " to the board", 0, { seat: action.seat, holderId: action.candidateId });
    return { ownership: next, finance, event: { type: "DIRECTOR_APPOINTED", summary: "Board appointment recorded.", details: { companyId: company.id, seat: action.seat, holderId: action.candidateId } } };
  }
  if (action.type === "OWNERSHIP_REMOVE_DIRECTOR") {
    company.board = company.board.filter(item => !(item.holderId === action.candidateId && item.seat === "Director"));
    transaction(next, company, turn, date, "DIRECTOR_REMOVED", "Removed a director from the board", 0, { holderId: action.candidateId });
    return { ownership: next, finance, event: { type: "DIRECTOR_REMOVED", summary: "Board director removed.", details: { companyId: company.id, holderId: action.candidateId } } };
  }
  if (action.type === "OWNERSHIP_TRANSFER_SHARES") {
    const seller = shareholderById(company, action.sellerId), buyer = shareholderById(company, action.buyerId);
    const shares = action.shares, proceeds = shares * action.pricePerShareMinor;
    const basis = Math.floor(seller.costBasisMinor * shares / seller.shares), gain = proceeds - basis;
    seller.shares -= shares; seller.costBasisMinor -= basis;
    if (seller.id !== "player") seller.cashMinor = (seller.cashMinor ?? investorById(seller.id)?.capacityMinor ?? 0) + proceeds;
    if (buyer) { buyer.shares += shares; buyer.costBasisMinor += proceeds; if (buyer.id !== "player") buyer.cashMinor = (buyer.cashMinor ?? investorById(buyer.id)?.capacityMinor ?? 0) - proceeds; }
    else company.shareholders.push({ id: "player", name: "You", type: "Shareholder", shares, costBasisMinor: proceeds, isPlayer: true });
    if (seller.shares === 0) company.shareholders = company.shareholders.filter(item => item.id !== seller.id);
    if (action.sellerId === "player") {
      const lines = [{ accountId: "cash", debitMinor: proceeds, creditMinor: 0 }, { accountId: "privateEquity", debitMinor: 0, creditMinor: basis }];
      if (gain > 0) lines.push({ accountId: "income", debitMinor: 0, creditMinor: gain });
      if (gain < 0) lines.push({ accountId: "expense", debitMinor: -gain, creditMinor: 0 });
      postHousehold(finance, { id: postId("negotiated-sale"), date, turn, kind: "NEGOTIATED_EQUITY_SALE", description: "Negotiated share transfer in " + company.name, amountMinor: proceeds, relatedId: company.id, lines });
    } else if (action.buyerId === "player") {
      postHousehold(finance, { id: postId("negotiated-purchase"), date, turn, kind: "NEGOTIATED_EQUITY_PURCHASE", description: "Purchased shares in " + company.name, amountMinor: proceeds, relatedId: company.id, lines: [{ accountId: "privateEquity", debitMinor: proceeds, creditMinor: 0 }, { accountId: "cash", debitMinor: 0, creditMinor: proceeds }] });
    }
    transaction(next, company, turn, date, "NEGOTIATED_SHARE_TRANSFER", "Transferred shares between " + action.sellerId + " and " + action.buyerId, proceeds, { sellerId: action.sellerId, buyerId: action.buyerId, shares, pricePerShareMinor: action.pricePerShareMinor, realizedGainMinor: action.sellerId === "player" ? gain : null });
    return { ownership: next, finance, event: { type: "NEGOTIATED_SHARE_TRANSFER", summary: "Negotiated transfer of " + shares.toLocaleString("en-US") + " shares settled for " + money(proceeds) + " Credits.", details: { companyId: company.id, sellerId: action.sellerId, buyerId: action.buyerId, shares, proceedsMinor: proceeds, realizedGainMinor: action.sellerId === "player" ? gain : null } } };
  }
  if (action.type === "OWNERSHIP_OPEN_BOARD_ELECTION") {
    const id = "election-" + next.nextId++;
    const election = { id, status: "open", openedAtTurn: turn, termTurns: action.termTurns, candidates: company.shareholders.filter(item => item.shares > 0).map(item => item.id), votes: [], outcome: null };
    company.elections.unshift(election);
    transaction(next, company, turn, date, "BOARD_ELECTION_OPENED", "Opened board election", 0, { electionId: id, termTurns: action.termTurns });
    return { ownership: next, finance, event: { type: "BOARD_ELECTION_OPENED", summary: "Board election opened for a " + action.termTurns + "-turn director term.", details: { companyId: company.id, electionId: id } } };
  }
  if (action.type === "OWNERSHIP_VOTE_BOARD_ELECTION") {
    const election = company.elections.find(item => item.id === action.electionId);
    const existing = election.votes.find(item => item.shareholderId === "player");
    const vote = { shareholderId: "player", candidateId: action.candidateId, shares: playerShares(company), turn };
    if (existing) Object.assign(existing, vote); else election.votes.push(vote);
    transaction(next, company, turn, date, "BOARD_ELECTION_VOTE", "Voted for a board candidate", 0, { electionId: election.id, candidateId: action.candidateId, shares: vote.shares });
    return { ownership: next, finance, event: { type: "BOARD_ELECTION_VOTE", summary: "Your board-election vote was recorded.", details: { companyId: company.id, electionId: election.id, candidateId: action.candidateId } } };
  }
  if (action.type === "OWNERSHIP_CLOSE_BOARD_ELECTION") {
    const election = company.elections.find(item => item.id === action.electionId);
    for (const holder of company.shareholders.filter(item => item.id !== "player" && item.shares > 0)) {
      if (election.votes.some(item => item.shareholderId === holder.id)) continue;
      const profile = investorById(holder.id);
      const ranked = election.candidates.map(candidateId => {
        const candidate = shareholderById(company, candidateId);
        const selfPreference = candidateId === holder.id ? 25 : 0;
        const leadership = candidateId === "player" ? Math.floor((character?.skills?.leadership ?? 0) / 5) : Math.floor((candidate?.shares ?? 0) * 20 / company.outstandingShares);
        return { candidateId, score: selfPreference + leadership + Math.floor((profile?.growthBias ?? 50) / 5) };
      }).sort((a,b) => b.score - a.score || a.candidateId.localeCompare(b.candidateId));
      election.votes.push({ shareholderId: holder.id, candidateId: ranked[0].candidateId, shares: holder.shares, turn, automatic: true });
    }
    const totals = new Map(election.candidates.map(id => [id, 0]));
    for (const vote of election.votes) totals.set(vote.candidateId, (totals.get(vote.candidateId) ?? 0) + vote.shares);
    const winner = [...totals.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    election.status = "closed";
    election.outcome = { turn, winnerId: winner?.[0] ?? null, votesByCandidate: Object.fromEntries(totals), totalVotes: election.votes.reduce((sum,item) => sum + item.shares,0) };
    if (winner?.[0]) {
      const existing = company.board.find(item => item.seat === "Director");
      const appointment = { seat: "Director", holderId: winner[0], appointedAtTurn: turn, termEndsAtTurn: turn + election.termTurns, electionId: election.id };
      if (existing) Object.assign(existing, appointment); else company.board.push(appointment);
    }
    transaction(next, company, turn, date, "BOARD_ELECTION_CLOSED", "Board election closed", 0, { electionId: election.id, outcome: election.outcome });
    return { ownership: next, finance, event: { type: "BOARD_ELECTION_CLOSED", summary: "Board election completed. " + (winner?.[0] ?? "No candidate") + " won the director seat.", details: { companyId: company.id, electionId: election.id, outcome: election.outcome } } };
  }
  throw new Error("Unsupported ownership action.");
}
export function advanceOwnership(state, finance, { date, turn, character }) {
  const next = clone(state), events = [];
  for (const company of next.companies) {
    if (!Array.isArray(company.elections)) company.elections = [];
    company.board = company.board.filter(member => member.seat === "Chair" || !Number.isInteger(member.termEndsAtTurn) || member.termEndsAtTurn > turn);
    if (company.status !== "active" || company.lastAdvanceTurn >= turn) continue;
    const skillAdjustment = Math.floor((character?.skills?.operations ?? 0) / 20) + Math.floor((character?.skills?.management ?? 0) / 25);
    const rate = clamp(company.weeklyProfitBps + skillAdjustment, 5, 100);
    const profit = Math.max(1, Math.floor(company.paidInCapitalMinor * rate / 10000));
    company.cashMinor += profit; company.retainedEarningsMinor += profit; company.cumulativeProfitMinor += profit;
    postCompanyJournal(company, { date, turn, kind: "WEEKLY_OPERATING_PROFIT", description: "Weekly operating profit", lines: [
      { accountId: "cash", debitMinor: profit, creditMinor: 0 },
      { accountId: "retainedEarnings", debitMinor: 0, creditMinor: profit }
    ] });
    company.lastAdvanceTurn = turn; company.estimatedValueMinor = equityValue(company); company.sharePriceMinor = sharePrice(company);
    const entry = { id: "ownership-" + next.nextId++, companyId: company.id, turn, date, kind: "WEEKLY_OPERATING_PROFIT", description: "Weekly operating profit", amountMinor: profit, details: { rateBps: rate } };
    next.transactions.unshift(entry); company.transactions.unshift(entry.id);
    events.push({ type: "COMPANY_PROFIT", summary: company.name + " generated " + money(profit) + " Credits in weekly operating profit.", details: { companyId: company.id, profitMinor: profit, rateBps: rate } });
  }
  return { ownership: next, finance, events };
}
export function validateOwnership(state, finance) {
  const errors = [];
  if (!state || !Number.isInteger(state.nextId) || state.nextId < 1 || !Array.isArray(state.companies) || !Array.isArray(state.transactions) || !Array.isArray(state.acquisitionHistory)) return { valid: false, errors: ["Company ownership state is malformed."] };
  const ids = new Set();
  for (const company of state.companies) {
    if (!company || typeof company.id !== "string" || ids.has(company.id) || !validCompanyName(company.name) || !COMPANY_SECTORS.includes(company.sector) || !Array.isArray(company.shareholders) || !Array.isArray(company.resolutions) || !Array.isArray(company.elections) || !Array.isArray(company.transactions) || !Array.isArray(company.board) || !Array.isArray(company.executives)) { errors.push("A company ownership record is malformed."); continue; }
    ids.add(company.id);
    if (!Number.isSafeInteger(company.authorizedShares) || !Number.isSafeInteger(company.issuedShares) || !Number.isSafeInteger(company.outstandingShares) || company.authorizedShares < company.issuedShares || company.issuedShares !== company.outstandingShares || company.outstandingShares < 1 || company.outstandingShares > 100000000) errors.push("Company share authorization and issuance do not reconcile.");
    const shareholderIds = new Set(); let shares = 0;
    for (const holder of company.shareholders) {
      if (!holder || typeof holder.id !== "string" || shareholderIds.has(holder.id) || !Number.isSafeInteger(holder.shares) || holder.shares < 0 || !safeNonNegative(holder.costBasisMinor)) errors.push("A shareholder holding is invalid.");
      else { shareholderIds.add(holder.id); shares += holder.shares; }
    }
    if (shares !== company.outstandingShares) errors.push("The shareholder register does not reconcile to outstanding shares.");
    for (const key of ["cashMinor", "capitalAssetsMinor", "paidInCapitalMinor", "loanBalanceMinor", "retainedEarningsMinor", "cumulativeProfitMinor", "cumulativeDividendsMinor", "estimatedValueMinor", "sharePriceMinor"]) if (!safeNonNegative(company[key])) errors.push("A company financial balance is invalid.");
    if (company.cashMinor + (company.capitalAssetsMinor ?? 0) !== company.paidInCapitalMinor + company.loanBalanceMinor + company.retainedEarningsMinor) errors.push("Company cash does not reconcile to paid-in capital, shareholder loans and retained earnings.");
    if (company.retainedEarningsMinor !== company.cumulativeProfitMinor - company.cumulativeDividendsMinor) errors.push("Company retained earnings do not reconcile to profit and distributions.");
    if (company.estimatedValueMinor !== equityValue(company) || company.sharePriceMinor !== sharePrice(company)) errors.push("Company valuation does not reconcile to its equity and share register.");
    if (!Array.isArray(company.ledger) || !Array.isArray(company.ledgerAccounts) || !Number.isInteger(company.ledgerSequence) || company.ledgerSequence < 1) errors.push("Company double-entry ledger is missing or malformed.");
    else {
      const accountIds = new Set(company.ledgerAccounts.map(account => account.id));
      const totals = new Map(company.ledgerAccounts.map(account => [account.id, 0]));
      for (const entry of company.ledger) {
        const debit = entry.lines?.reduce((sum, line) => sum + line.debitMinor, 0) ?? -1;
        const credit = entry.lines?.reduce((sum, line) => sum + line.creditMinor, 0) ?? -2;
        if (debit <= 0 || debit !== credit || !Array.isArray(entry.lines)) errors.push("A company journal entry is not balanced.");
        for (const line of entry.lines ?? []) {
          const account = company.ledgerAccounts.find(item => item.id === line.accountId);
          if (!account || !safeNonNegative(line.debitMinor) || !safeNonNegative(line.creditMinor) || (line.debitMinor > 0 && line.creditMinor > 0)) errors.push("A company journal line is invalid.");
          else totals.set(line.accountId, (totals.get(line.accountId) ?? 0) + (account.type === "asset" ? line.debitMinor - line.creditMinor : line.creditMinor - line.debitMinor));
        }
      }
      for (const account of company.ledgerAccounts) if (account.balanceMinor !== totals.get(account.id)) errors.push("Company ledger account balances do not reconcile to journal history.");
      const balance = id => company.ledgerAccounts.find(account => account.id === id)?.balanceMinor ?? -1;
      if (balance("cash") !== company.cashMinor || balance("capitalAssets") !== company.capitalAssetsMinor || balance("shareCapital") !== company.paidInCapitalMinor || balance("shareholderLoans") !== company.loanBalanceMinor || balance("retainedEarnings") !== company.retainedEarningsMinor) errors.push("Company ledger does not reconcile to the company balance sheet.");
    }
    if (!Number.isInteger(company.weeklyProfitBps) || company.weeklyProfitBps < 1 || company.weeklyProfitBps > 100 || !Number.isInteger(company.lastAdvanceTurn) || company.lastAdvanceTurn < company.foundedAtTurn) errors.push("Company operating parameters are invalid.");
    for (const resolution of company.resolutions) {
      if (!resolution || typeof resolution.id !== "string" || !["open", "passed", "rejected"].includes(resolution.status) || !Array.isArray(resolution.votes) || resolution.votes.some(vote => !shareholderIds.has(vote.shareholderId) || !Number.isInteger(vote.shares) || vote.shares < 1 || !["for", "against", "abstain"].includes(vote.choice))) errors.push("A shareholder resolution or vote is invalid.");
    }
  }
  if (finance?.initialized) {
    const privateEquity = finance.accounts.find(item => item.id === "privateEquity")?.balanceMinor ?? 0;
    const shareholderLoans = finance.accounts.find(item => item.id === "shareholderLoans")?.balanceMinor ?? 0;
    const expectedEquity = state.companies.reduce((sum, company) => sum + (shareholderById(company, "player")?.costBasisMinor ?? 0), 0);
    const expectedLoans = state.companies.reduce((sum, company) => sum + company.loanBalanceMinor, 0);
    if (privateEquity !== expectedEquity) errors.push("Household private-equity cost basis does not reconcile to company holdings.");
    if (shareholderLoans !== expectedLoans) errors.push("Household shareholder-loan receivables do not reconcile to company debt.");
  }
  return { valid: errors.length === 0, errors };
}
