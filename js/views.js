import { PAGES } from "./navigation.js";
import { icon, emptyState, panelTitle, statCard, featureCard } from "./components.js";

const sections = {
  personal: ["Your life, in context.", "The person behind every financial decision. Your circumstances, capabilities and priorities shape the opportunities available to you.", "user", "Phase 3 — Character & life", [
    ["Character dossier", "Background, education, skills, work history, reputation and personal attributes.", "user"],
    ["Calendar & time", "Plan work, learning, health, family and other commitments within each turn.", "clock"],
    ["Goals & well-being", "Track milestones, energy, stress, health and quality-of-life trade-offs.", "spark"]
  ]],
  finance: ["Know where you stand.", "Understand what you own, what you owe, what comes in and what goes out. Every figure will have a traceable source.", "wallet", "Phase 4 — Household finance & ledger", [
    ["Accounts & ledger", "Balances, account activity, transfers and a reconciled transaction history.", "wallet"],
    ["Budget & cash flow", "Recurring income, essential spending, discretionary cash and monthly trends.", "chart"],
    ["Debt & credit", "Payment schedules, interest, credit standing and repayment options.", "shield"],
    ["Savings & reserves", "Emergency funds, savings targets and liquidity behind your plans.", "layers"]
  ]],
  markets: ["Capital at work.", "Research opportunities, compare risk and understand how prices, rates and company performance affect your portfolio.", "chart", "Phase 7 — Markets", [
    ["Instrument directory", "Browse equities, bonds, commodities and other fictional instruments.", "book"],
    ["Research terminal", "Review fundamentals, market observations, confidence and information age.", "search"],
    ["Orders & holdings", "Preview orders, track settlement and inspect portfolio positions and returns.", "chart"]
  ]],
  businesses: ["Build beyond yourself.", "From an independent venture to a portfolio of companies, follow the economics and decisions behind ownership.", "building", "Phases 9–10 — Business operations & ownership", [
    ["Company directory", "Explore employers, suppliers, competitors, private and public companies.", "building"],
    ["Business operations", "Products, pricing, sales, inventory, staffing, suppliers and performance.", "briefcase"],
    ["Ownership & governance", "Equity stakes, voting rights, boards, executives and corporate control.", "network"]
  ]],
  assets: ["Wealth beyond cash.", "Track assets by what they are worth, what they cost to hold and how readily they can become cash.", "gem", "Phase 8 — Property & collectibles", [
    ["Asset portfolio", "Owned assets, acquisition costs and current estimates.", "layers"],
    ["Property", "Ownership, financing, rental income, maintenance, vacancy and sale proceeds.", "building"],
    ["Collectibles & valuables", "Authenticity, condition, provenance, appraisals and liquidity.", "gem"]
  ]],
  network: ["See how influence connects.", "Understand the people and institutions around you through relationships, ownership, contracts and shared interests.", "network", "Phases 10–11 — Ownership & interconnected economy", [
    ["People & contacts", "Professional relationships, personal connections, reputation and trust.", "user"],
    ["Company connections", "Employer, supplier, customer, lender and partnership relationships.", "building"],
    ["Ownership network", "Explore stakes, board seats, voting rights and control as connected data.", "network"]
  ]],
  news: ["Understand what changed.", "Follow developments across companies, industries and institutions, with a clear explanation of why each event matters.", "news", "Phase 11 — News & interconnected economy", [
    ["News feed", "Company announcements, industry shifts and wider economic developments.", "news"],
    ["Events & disruptions", "Policy, technology, labor, supply, credit and consumer-demand events.", "spark"],
    ["Cause & effect", "Trace affected entities, event duration, uncertainty and downstream consequences.", "network"]
  ]],
  reports: ["Turn activity into insight.", "Review reliable statements and decision-ready summaries that distinguish cash, accounting results and estimated values.", "report", "Reports expand alongside each simulation system", [
    ["Financial statements", "Balance sheets, income statements and operating, investing and financing cash flow.", "report"],
    ["Performance analysis", "Net worth, reserves, debt, business performance and portfolio trends.", "chart"],
    ["Forecasts & history", "Assumptions, scenario ranges, past decisions and explainable outcomes.", "clock"]
  ]]
};

export function renderOverview() {
  return '<section class="welcome"><div class="welcome-copy"><label>— CAPITAL & CONSEQUENCE</label><h2>Every empire starts<br>with a <em>first decision.</em></h2><p>Build financial stability, make your capital work, and shape the companies and relationships that define your future.</p><div class="welcome-links"><a class="primary" href="#/personal" data-route="personal">Explore your profile ' + icon("arrow") + '</a><a href="#/finance" data-route="finance">Understand the numbers ' + icon("right") + '</a></div></div><div class="orbit" aria-hidden="true"><div class="orbit-one"></div><div class="orbit-two"></div><div class="orbit-core">N</div><span>01 / 09<br>YOUR JOURNEY</span></div><footer><span>PHASE 01 / CORE SHELL</span><span>SIMULATION NOT STARTED</span></footer></section>' +
    '<section class="stats">' + statCard("Available cash", "wallet") + statCard("Net worth", "chart") + statCard("Monthly income", "arrow") + statCard("Outstanding debt", "shield") + '</section>' +
    '<section class="dash-grid"><article class="panel">' + panelTitle("Financial position", "Your balance sheet and cash flow will appear here.") + emptyState("chart", "Your financial picture starts here", "Create a character and begin a new game in a later phase to see cash, assets, liabilities and net worth develop over time.", "AWAITING FIRST SAVE") + '</article><article class="panel">' + panelTitle("Your next moves", "The foundations of a stronger financial position.") + '<div class="moves"><a href="#/personal" data-route="personal"><b>01</b><span><strong>Know your starting point</strong><small>Review your character and circumstances</small></span>' + icon("right") + '</a><a href="#/finance" data-route="finance"><b>02</b><span><strong>Understand your finances</strong><small>Accounts, income, spending and debt</small></span>' + icon("right") + '</a><a href="#/markets" data-route="markets"><b>03</b><span><strong>Explore opportunities</strong><small>Learn how capital can be put to work</small></span>' + icon("right") + '</a></div><div class="note-dot"><i></i>Your workspace is ready. Simulation systems arrive in later phases.</div></article></section>' +
    '<section class="dash-grid lower-grid"><article class="panel">' + panelTitle("Recent activity", "A record of decisions and outcomes.") + emptyState("clock", "Your story has not started yet", "Once a game is running, important actions, settlements and events will be recorded here.", "NO ACTIVITY RECORDED") + '</article><article class="panel principle">' + panelTitle("A principle to remember", "Financial literacy, in context.") + '<blockquote>Wealth is not just what you own. It is also what you owe, what you can access, and what your assets can sustainably produce.</blockquote><label>NETWORTH / FINANCIAL FOUNDATIONS</label></article></section>';
}

export function renderSection(id) {
  const section = sections[id];
  if (!section) return renderOverview();
  const names = { personal: "dossier", finance: "financial records", markets: "market workspace", businesses: "company portfolio", assets: "asset register", network: "relationship network", news: "news feed", reports: "reports" };
  return '<section class="intro"><i>' + icon(section[2]) + '</i><div><label>' + id.toUpperCase() + ' / WORKSPACE</label><h2>' + section[0] + '</h2><p>' + section[1] + '</p></div><span class="ready"><b></b> WORKSPACE READY</span></section>' +
    '<section><div class="section-head"><div><label>WORKSPACE MODULES</label><h2>What lives here</h2></div><span>' + String(section[4].length).padStart(2, "0") + ' MODULES</span></div><div class="features">' + section[4].map(item => featureCard({ title: item[0], description: item[1], icon: item[2] })).join("") + '</div></section>' +
    '<section class="panel">' + panelTitle("No active data", "This section is a navigable Phase 1 placeholder.") + emptyState(section[2], "Your " + names[id] + " will appear here", "The interface is in place. Functional data, interactions and simulation rules are scheduled for " + section[3] + ".", "READY FOR THE NEXT PHASE") + '</section>' +
    '<div class="phase-note">' + icon("check") + '<span><strong>Phase 1 foundation</strong><small>Navigation, layout and empty states are active. No placeholder figures are presented as real simulation data.</small></span></div>';
}
export const getSectionContent = id => sections[id] ?? null;
export const getWorkspaceCount = () => PAGES.length;
