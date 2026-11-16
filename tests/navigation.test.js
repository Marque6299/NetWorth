import test from "node:test";
import assert from "node:assert/strict";
import { GROUPS, PAGES, PAGE_IDS, getPage, getPageIdFromHash } from "../js/navigation.js";
import { getSectionContent } from "../js/views.js";

test("the core shell exposes exactly the nine planned workspaces", () => {
  assert.deepEqual(PAGE_IDS, ["overview", "personal", "finance", "markets", "businesses", "assets", "network", "news", "reports"]);
  assert.equal(PAGES.length, 9);
});

test("navigation identifiers are unique and every workspace has title and description", () => {
  assert.equal(new Set(PAGE_IDS).size, PAGE_IDS.length);
  for (const page of PAGES) assert.ok(page.title && page.description && page.icon);
});

test("the eight non-overview sections have structured placeholder modules", () => {
  for (const page of PAGES.filter(item => item.id !== "overview")) {
    const section = getSectionContent(page.id);
    assert.ok(section, page.id);
    assert.ok(section[0] && section[1] && section[3]);
    assert.ok(section[4].length >= 3);
  }
});

test("hash routing resolves known pages and falls back to Overview", () => {
  assert.equal(getPageIdFromHash("#/finance"), "finance");
  assert.equal(getPageIdFromHash("#/reports/"), "reports");
  assert.equal(getPageIdFromHash("#/unknown"), "overview");
  assert.equal(getPageIdFromHash(""), "overview");
  assert.equal(getPage("unknown").id, "overview");
});

test("navigation has the requested three groups and no geographic workspace", () => {
  assert.deepEqual(GROUPS.map(group => group.label), ["Workspace", "Life & Capital", "Intelligence"]);
  assert.doesNotMatch(PAGES.map(page => page.id + page.label + page.title).join(" ").toLowerCase(), /world map|geography|travel|region map/);
});
