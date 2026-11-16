import test from "node:test";
import assert from "node:assert/strict";
import { renderOverview, renderSection } from "../js/views.js";
import { PAGE_IDS } from "../js/navigation.js";

test("Overview contains the welcome panel, blank snapshot and next-step navigation", () => {
  const html = renderOverview();
  for (const text of ["Every empire starts", "Available cash", "No active save", "Financial position", "Recent activity"]) assert.ok(html.includes(text), text);
  for (const id of ["personal", "finance", "markets"]) assert.ok(html.includes('data-route="' + id + '"'));
  assert.doesNotMatch(html, /LU\s*[\d,]+|\$\s*[\d,]+/);
});

test("each section shows modules, planned status and a deliberate empty state", () => {
  for (const id of PAGE_IDS.filter(item => item !== "overview")) {
    const html = renderSection(id);
    assert.match(html, /WORKSPACE MODULES/);
    assert.match(html, /PLANNED/);
    assert.match(html, /No active data/);
    assert.match(html, /Phase 1 foundation/);
    assert.doesNotMatch(html, /undefined|null/);
  }
});
