const paths = {
  grid: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 15h2M6 5V3h12v2"/>',
  chart: '<path d="M3 3v18h18M7 14l4-4 4 3 6-7M17 6h4v4"/>',
  building: '<path d="M3 21h18M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9zM2 9h20M8 3l4 6 4-6M8 9l4 12 4-12"/>',
  network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="m10.8 7.2-4.6 8.6M13.2 7.2l4.6 8.6M7.5 18h9"/>',
  news: '<path d="M4 4h14v16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM18 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M7 8h8M7 12h8M7 16h5"/>',
  report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 17v-3M12 17v-6M16 17v-5"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11zM9 12l2 2 4-4"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  book: '<path d="M12 7v14M3 5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3 3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1h-5a3 3 0 0 0-3 2 3 3 0 0 0-3-2H4a1 1 0 0 1-1-1z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/>',
  spark: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'
};
export const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
export const icon = name => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.layers) + '</svg>';
/**
 * Render a safe navigation link and mark the active workspace.
 * @param {{id:string,icon:string,label:string}} page Navigation page metadata.
 * @param {string} active Active page identifier.
 * @returns {string} HTML for the navigation link.
 */
export function navLink(page, active) { return '<a class="nav-link ' + (page.id === active ? 'active' : '') + '" href="#/' + page.id + '" data-route="' + page.id + '"' + (page.id === active ? ' aria-current="page"' : '') + '><span class="nav-icon">' + icon(page.icon) + '</span><span>' + esc(page.label) + '</span></a>'; }
export function statCard(label, ico) { return '<article class="stat"><div class="stat-top"><span>' + esc(label) + '</span><i>' + icon(ico) + '</i></div><strong>—</strong><small><b></b>No active save</small></article>'; }
export function emptyState(ico, title, body, tag = "NO DATA YET") { return '<div class="empty"><i>' + icon(ico) + '</i><div><label>' + esc(tag) + '</label><h3>' + esc(title) + '</h3><p>' + esc(body) + '</p></div></div>'; }
export function panelTitle(title, subtitle) { return '<div class="panel-title"><div><h3>' + esc(title) + '</h3><p>' + esc(subtitle) + '</p></div></div>'; }
export function featureCard(feature) { return '<article class="feature"><i>' + icon(feature.icon) + '</i><div><div class="feature-title"><h3>' + esc(feature.title) + '</h3><span>PLANNED</span></div><p>' + esc(feature.description) + '</p></div></article>'; }
