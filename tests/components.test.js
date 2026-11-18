import test from "node:test";
import assert from "node:assert/strict";
import { esc, icon, navLink, statCard, emptyState, featureCard } from "../js/components.js";
import { PAGES } from "../js/navigation.js";

test("component text is HTML-escaped", () => {
  assert.equal(esc(`<script title="x">'&</script>`), "&lt;script title=&quot;x&quot;&gt;&#39;&amp;&lt;/script&gt;");
  assert.match(emptyState("layers", `<img src=x>`, "Safe"), /&lt;img/);
});

test("navigation link includes stable route and active state", () => {
  const html = navLink(PAGES[0], "overview");
  assert.match(html, /href="#\/overview"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /active/);
  assert.match(html, /class="nav-icon"/);
  assert.doesNotMatch(html, /class="nav-ico"/);
});

test("shared stat, empty-state and feature components render useful defaults", () => {
  assert.match(statCard("Available cash", "wallet"), /No active save/);
  assert.match(statCard("Net worth", "chart"), />—</);
  assert.match(emptyState("wallet", "No data", "Nothing loaded"), /Nothing loaded/);
  assert.match(featureCard({ title: "Portfolio", description: "Placeholder", icon: "gem" }), /PLANNED/);
});

test("icons render inline SVG with safe fallback", () => {
  assert.match(icon("wallet"), /^<svg/);
  assert.match(icon("missing"), /<svg/);
});
