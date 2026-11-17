export const GROUPS = [
  { label: "Workspace", pages: [{ id: "overview", label: "Overview", icon: "grid", title: "Executive Overview", description: "A clear view of the financial life and enterprise you are building." }] },
  { label: "Life & Capital", pages: [
    { id: "personal", label: "Personal", icon: "user", title: "Personal Dossier", description: "Your career, education, circumstances, capabilities and personal goals." },
    { id: "finance", label: "Finance", icon: "wallet", title: "Finance", description: "Accounts, obligations, banking, credit, cash flow and the foundations of your balance sheet." },
    { id: "markets", label: "Markets", icon: "chart", title: "Markets", description: "Equities, bonds, commodities, digital assets, orders and portfolio performance." },
    { id: "businesses", label: "Businesses", icon: "building", title: "Businesses", description: "Company operating mandates, products, pricing, suppliers, staff, sales and branch performance." },
    { id: "assets", label: "Assets", icon: "gem", title: "Assets", description: "Property ownership, rental operations, mortgages, collectibles and asset valuations." }
  ] },
  { label: "Intelligence", pages: [
    { id: "network", label: "Network", icon: "network", title: "Network", description: "People, institutions and companies connected by influence and ownership." },
    { id: "news", label: "News", icon: "news", title: "News & Events", description: "Developments that shape companies, industries and the wider economy." },
    { id: "reports", label: "Reports", icon: "report", title: "Reports", description: "Statements, performance reviews and decision-ready analysis." }
  ] }
];
export const PAGES = GROUPS.flatMap(group => group.pages);
export const PAGE_IDS = PAGES.map(page => page.id);
export const getPage = id => PAGES.find(page => page.id === id) ?? PAGES[0];
export function getPageIdFromHash(hash = "") {
  const id = hash.replace(/^#\/?/, "").replace(/\/$/, "").toLowerCase();
  return PAGE_IDS.includes(id) ? id : "overview";
}
