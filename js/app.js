import { GROUPS, PAGES, getPage, getPageIdFromHash } from "./navigation.js";
import { esc, icon, navLink } from "./components.js";
import { renderOverview, renderSection } from "./views.js";

const root = document.querySelector("#app");
function sidebar(active) {
  return '<aside class="sidebar"><a class="brand" href="#/overview" data-route="overview"><span class="brand-mark">N</span><span><b>NETWORTH</b><small>CAPITAL & CONSEQUENCE</small></span></a><div class="side-rule"></div><div class="nav-groups">' + GROUPS.map(group => '<section class="nav-group"><label>' + esc(group.label) + '</label><nav>' + group.pages.map(page => navLink(page, active)).join("") + '</nav></section>').join("") + '</div><div class="side-bottom"><b>EARLY ACCESS SHELL</b><small>BUILD 0.1.0 / PHASE 01</small><p>A world of decisions.<br>A future of your making.</p></div></aside>';
}
function topbar(page) {
  return '<header class="topbar"><div class="crumb">NETWORTH ' + icon("right") + ' <b>' + esc(page.label.toUpperCase()) + '</b></div><div class="top-actions"><div class="search" id="searchWrap">' + icon("search") + '<input id="globalSearch" type="search" placeholder="Find a workspace" aria-label="Find a workspace" aria-controls="searchResults" aria-expanded="false" autocomplete="off"><kbd>⌘ K</kbd><div id="searchResults" class="results" role="listbox" hidden></div></div><div class="save"><i></i><span><small>SAVE STATUS</small><b>NO SAVE LOADED</b></span></div><span class="avatar" aria-label="Player profile not created">—</span></div></header>';
}
function heading(page) {
  return '<div class="page-heading"><div><label>' + (page.id === "overview" ? "YOUR FINANCIAL COMMAND CENTER" : "NETWORTH WORKSPACE / " + page.id.toUpperCase()) + '</label><h1>' + esc(page.title) + '</h1><p>' + esc(page.description) + '</p></div><span class="phase">◇ PHASE 01 <small>CORE SHELL / 09 SECTIONS</small></span></div>';
}
function render() {
  let id = getPageIdFromHash(location.hash);
  if (!location.hash || !PAGES.some(page => "#/" + page.id === location.hash)) {
    history.replaceState(null, "", "#/overview");
    id = "overview";
  }
  const page = getPage(id);
  root.innerHTML = sidebar(id) + '<div class="main-column">' + topbar(page) + '<main class="main"><a class="skip" href="#content">Skip to content</a><div id="content">' + heading(page) + '<div class="content">' + (id === "overview" ? renderOverview() : renderSection(id)) + '</div></div><footer class="page-footer"><span>NETWORTH · CAPITAL & CONSEQUENCE</span><span>PHASE 01 / CORE SHELL · NO LIVE SIMULATION DATA</span></footer></main></div>';
  document.title = page.label + " — Networth";
  setupSearch();
  root.classList.add("ready");
}
function closeSearch() {
  const input = document.querySelector("#globalSearch"), results = document.querySelector("#searchResults");
  if (results) results.hidden = true;
  if (input) input.setAttribute("aria-expanded", "false");
}
function setupSearch() {
  const input = document.querySelector("#globalSearch"), results = document.querySelector("#searchResults");
  if (!input || !results) return;
  function update() {
    const q = input.value.trim().toLowerCase();
    const matches = PAGES.filter(page => (page.label + " " + page.title + " " + page.description).toLowerCase().includes(q));
    results.innerHTML = matches.length ? matches.map(page => '<a class="result" role="option" href="#/' + page.id + '" data-route="' + page.id + '">' + icon(page.icon) + '<span><b>' + esc(page.label) + '</b><small>' + esc(page.title) + '</small></span></a>').join("") : '<p class="no-results">No matching workspace found.</p>';
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  input.addEventListener("focus", update);
  input.addEventListener("input", update);
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeSearch(); input.blur(); }
    if (event.key === "Enter") { const first = results.querySelector("a"); if (first) location.hash = first.getAttribute("href"); }
    if (event.key === "ArrowDown") { const first = results.querySelector("a"); if (first) { event.preventDefault(); first.focus(); } }
  });
  results.addEventListener("keydown", event => { if (event.key === "Escape") { closeSearch(); input.focus(); } });
}
root.addEventListener("click", event => { if (event.target.closest("a[data-route]")) closeSearch(); else if (!event.target.closest("#searchWrap")) closeSearch(); });
window.addEventListener("hashchange", render);
window.addEventListener("keydown", event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); document.querySelector("#globalSearch")?.focus(); } });
render();
