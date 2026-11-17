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

export function renderOverview(state=null) {
  return '<section class="welcome"><div class="welcome-copy"><label>— CAPITAL & CONSEQUENCE</label><h2>Every empire starts<br>with a <em>first decision.</em></h2><p>Build financial stability, make your capital work, and shape the companies and relationships that define your future.</p><div class="welcome-links"><a class="primary" href="#/personal" data-route="personal">Explore your profile ' + icon("arrow") + '</a><a href="#/finance" data-route="finance">Understand the numbers ' + icon("right") + '</a></div></div><div class="orbit" aria-hidden="true"><div class="orbit-one"></div><div class="orbit-two"></div><div class="orbit-core">N</div><span>01 / 09<br>YOUR JOURNEY</span></div><footer><span>PHASE 03 / CHARACTER & LIFE</span><span>${state?.life?.character?"CHARACTER CREATED":state?"CHARACTER NOT CREATED":"SIMULATION NOT STARTED"}</span></footer></section>' +
    '<section class="stats">' + statCard("Available cash", "wallet") + statCard("Net worth", "chart") + statCard("Monthly income", "arrow") + statCard("Outstanding debt", "shield") + '</section>' +
    '<section class="dash-grid"><article class="panel">' + panelTitle("Financial position", "Your balance sheet and cash flow will appear here.") + emptyState("chart", "Your financial picture starts here", "The authoritative financial ledger, accounts and net-worth calculations are scheduled for Phase 4.", "AWAITING FIRST SAVE") + '</article><article class="panel">' + panelTitle("Your next moves", "The foundations of a stronger financial position.") + '<div class="moves"><a href="#/personal" data-route="personal"><b>01</b><span><strong>Create your character</strong><small>Choose a background and review your circumstances</small></span>' + icon("right") + '</a><a href="#/finance" data-route="finance"><b>02</b><span><strong>Plan your weekly time</strong><small>Balance work, learning, recovery and relationships</small></span>' + icon("right") + '</a><a href="#/markets" data-route="markets"><b>03</b><span><strong>Set personal goals</strong><small>Track skills and well-being milestones</small></span>' + icon("right") + '</a></div><div class="note-dot"><i></i>Character and life systems are active. Household finance follows in Phase 4.</div></article></section>' +
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

import {STARTING_PROFILES,SKILL_KEYS,TIME_KEYS,DEFAULT_TIME_ALLOCATION,WEEKLY_TIME_BUDGET} from "./simulation-core.js";
const skillLabels={financialLiteracy:"Financial literacy",negotiation:"Negotiation",management:"Management",sales:"Sales",technical:"Technical expertise",research:"Research",leadership:"Leadership",networking:"Networking",operations:"Operations"};
const wellbeingLabels={health:"Health",energy:"Energy",stress:"Stress",happiness:"Happiness"};
const hourLabels={work:"Work",study:"Study",rest:"Rest & recovery",family:"Family",networking:"Networking",research:"Research",sideWork:"Side work",recreation:"Recreation"};
const metricOptions=[...SKILL_KEYS.map(key=>({value:`skill:${key}`,label:`Skill · ${skillLabels[key]}`})),...["health","energy","stress","happiness"].map(key=>({value:`wellbeing:${key}`,label:`Well-being · ${wellbeingLabels[key]}`})),{value:"turns:turn",label:"Milestone · Reach a future turn"}];
function profilePreview(profile){return `<div class="profile-preview-grid"><div><small>EDUCATION</small><b>${profile.education}</b></div><div><small>EXPERIENCE</small><b>${profile.experienceYears} years</b></div><div><small>EMPLOYMENT</small><b>${profile.employment}</b></div><div><small>DEPENDENTS</small><b>${profile.dependents}</b></div><div><small>STARTING CAPITAL CONTEXT</small><b>${profile.startingCapital.toLocaleString("en-US")}</b></div><div><small>STARTING DEBT CONTEXT</small><b>${profile.startingDebt.toLocaleString("en-US")}</b></div><div><small>MONTHLY EXPENSE CONTEXT</small><b>${profile.monthlyExpenseContext.toLocaleString("en-US")}</b></div><div><small>INITIAL WELL-BEING</small><b>Health ${profile.health} · Energy ${profile.energy}</b></div></div>`;}
function renderProfileCreation(){
 return `<section class="panel character-create"><div class="life-section-head"><div><label>CREATE YOUR CHARACTER</label><h2>Choose the life you begin with.</h2><p>Each background changes your education, experience, starting resources, obligations, skills and well-being.</p></div><span class="phase-chip">ONE CHARACTER PER SAVE</span></div><form id="characterForm" class="character-form"><div class="character-fields"><label>CHARACTER NAME<input name="name" minlength="2" maxlength="40" placeholder="Enter a name" required></label><label>AGE<input name="age" type="number" min="18" max="80" value="25" required></label></div><label class="profile-select-label">STARTING PROFILE<select name="profileId" id="profileSelect">${STARTING_PROFILES.map((profile,index)=>`<option value="${profile.id}" ${index===0?"selected":""}>${profile.name}</option>`).join("")}</select></label><p class="profile-tagline" id="profileTagline">${STARTING_PROFILES[0].tagline}</p><div id="profilePreview">${profilePreview(STARTING_PROFILES[0])}</div><button class="primary-button" type="submit">Create character ${icon("arrow")}</button></form></section>`;
}
function renderWellbeing(stats){
 return `<section class="panel"><div class="life-section-head"><div><label>PERSONAL CONDITION</label><h2>Well-being</h2><p>Your weekly choices influence how you feel and perform over time.</p></div></div><div class="wellbeing-grid">${Object.entries(wellbeingLabels).map(([key,label])=>{const value=stats[key];const risk=key==="stress"?value>=70:value<=35;return `<div class="wellbeing-item"><div><span>${label}</span><b>${value}/100</b></div><div class="meter ${risk?"risk":""}"><i style="width:${value}%"></i></div></div>`;}).join("")}</div></section>`;
}
function renderSkills(skills){
 return `<section class="panel"><div class="life-section-head"><div><label>CAPABILITIES</label><h2>Skills & development</h2><p>Study, research, networking and side work build relevant capabilities gradually.</p></div></div><div class="skill-grid">${SKILL_KEYS.map(key=>`<div class="skill-item"><div><span>${skillLabels[key]}</span><b>${skills[key].toFixed(1)}</b></div><div class="meter"><i style="width:${skills[key]}%"></i></div></div>`).join("")}</div></section>`;
}
function renderTimePlanner(allocation){
 const values=allocation??DEFAULT_TIME_ALLOCATION,total=TIME_KEYS.reduce((sum,key)=>sum+(values[key]??0),0);
 return `<section class="panel"><div class="life-section-head"><div><label>WEEKLY ACTION PLANNER</label><h2>Allocate your time</h2><p>You have ${WEEKLY_TIME_BUDGET} waking hours in a standard week after baseline sleep. Unallocated hours remain flexible.</p></div><span class="time-total" id="timeTotal">${total} / ${WEEKLY_TIME_BUDGET} HRS</span></div><form id="timeAllocationForm"><div class="time-allocation-grid">${TIME_KEYS.map(key=>`<label>${hourLabels[key].toUpperCase()}<span class="hour-input"><input data-time-hour name="${key}" type="number" min="0" max="${WEEKLY_TIME_BUDGET}" step="1" value="${values[key]??0}" required><small>HRS / WK</small></span></label>`).join("")}</div><label class="focus-select">STUDY FOCUS<select name="studyFocus">${SKILL_KEYS.map(key=>`<option value="${key}" ${values.studyFocus===key?"selected":""}>${skillLabels[key]}</option>`).join("")}</select></label><p class="allocation-note" id="allocationNote">${WEEKLY_TIME_BUDGET-total} hours remain unallocated. Going beyond the weekly limit is not allowed.</p><button class="primary-button" type="submit">Save weekly plan ${icon("arrow")}</button></form></section>`;
}
function renderGoals(goals){
 return `<section class="panel"><div class="life-section-head"><div><label>PERSONAL MILESTONES</label><h2>Goals</h2><p>Set measurable targets and see them update as your character develops.</p></div><span class="phase-chip">${goals.filter(goal=>goal.status==="completed").length} COMPLETED</span></div><form id="goalForm" class="goal-form"><label>GOAL TITLE<input name="title" maxlength="40" minlength="2" placeholder="e.g. Improve financial literacy" required></label><label>MEASURE<select name="metric">${metricOptions.map(item=>`<option value="${item.value}">${item.label}</option>`).join("")}</select></label><label>TARGET<input name="target" type="number" min="1" max="100" value="50" required></label><button class="primary-button" type="submit">Add goal</button></form><div class="goal-list">${goals.length?goals.map(goal=>{let current=goal.metric.startsWith("skill:")?0:0;const label=metricOptions.find(item=>item.value===goal.metric)?.label??goal.metric;const [kind,key]=goal.metric.split(":");const current=kind==="skill"?character.skills[key]:kind==="wellbeing"?character.wellbeing[key]:turn;const met=goal.metric==="wellbeing:stress"?current<=goal.target:current>=goal.target;const progress=goal.metric==="wellbeing:stress"?Math.min(100,Math.max(0,(100-current)/(100-goal.target||1)*100)):Math.min(100,Math.max(0,current/goal.target*100));return `<article class="goal-item ${goal.status==="completed"?"completed":""}"><div class="goal-copy"><b>${esc(goal.title)}</b><small>${esc(label)} · TARGET ${goal.metric==="wellbeing:stress"?"≤":"≥"} ${goal.target}${goal.metric==="turns:turn"?"":" / 100"} · CURRENT ${Number(current).toFixed(1)}</small><div class="meter"><i style="width:${goal.status==="completed"?100:progress}%"></i></div></div><span>${goal.status==="completed"||met?"COMPLETED":"IN PROGRESS"}</span></article>`;}).join(""):`<p class="goal-empty">No goals yet. Add a target that matters to your character.</p>`}</div></section>`;
}
export function renderPersonalView(state){
 if(!state)return `<section class="panel"><div class="empty"><i>${icon("user")}</i><div><label>SIMULATION REQUIRED</label><h3>Start a game first</h3><p>Create a simulation from Overview, then return here to build your character.</p><a class="primary-button" href="#/overview" data-route="overview">Go to Overview</a></div></div></section>`;
 const character=state.life?.character;
 if(!character)return renderProfileCreation();
 const context=character.startingContext;
 return `<section class="character-hero panel"><div><label>CHARACTER DOSSIER / ${esc(character.profileName.toUpperCase())}</label><h2>${esc(character.name)}</h2><p>Age ${character.age} · ${esc(character.education)} · ${character.experienceYears} years' experience</p><span>${esc(character.employment)}</span></div><div class="character-id"><small>CHARACTER ID</small><b>${esc(character.id)}</b><small>CREATED TURN ${character.createdAtTurn}</small></div></section><section class="panel"><div class="life-section-head"><div><label>STARTING CIRCUMSTANCES</label><h2>Your starting context</h2><p>These are scenario reference values for Phase 3, not ledger balances. Phase 4 will establish the authoritative financial accounts.</p></div></div><div class="profile-preview-grid"><div><small>STARTING CAPITAL CONTEXT</small><b>${context.capital.toLocaleString("en-US")}</b></div><div><small>STARTING DEBT CONTEXT</small><b>${context.debt.toLocaleString("en-US")}</b></div><div><small>MONTHLY EXPENSE CONTEXT</small><b>${context.monthlyExpense.toLocaleString("en-US")}</b></div><div><small>DEPENDENTS</small><b>${context.dependents}</b></div><div><small>REPUTATION</small><b>${character.reputation}/100</b></div><div><small>CONTACTS</small><b>${character.contacts}</b></div></div></section>${renderWellbeing(character.wellbeing)}${renderSkills(character.skills)}${renderTimePlanner(state.life.timeAllocation)}${renderGoals(state.life.goals,character,state.calendar.turn)}`;
}

export function renderStartingProfilePreview(profileId){const profile=STARTING_PROFILES.find(item=>item.id===profileId)??STARTING_PROFILES[0];return {tagline:profile.tagline,html:profilePreview(profile)};}
