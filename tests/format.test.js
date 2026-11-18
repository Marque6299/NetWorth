import test from "node:test";
import assert from "node:assert/strict";
import { compactCr, formatCr, pct, signed } from "../js/ui/format.js";
test("formatCr formats integer minor units", () => {
  assert.equal(formatCr(1_234_567), "Cr 12,345.67");
  assert.equal(formatCr(0), "Cr 0.00");
  assert.equal(formatCr(-12_345), "−Cr 123.45");
  assert.throws(() => formatCr(12.5), /safe integers/);
});
test("compactCr formats K, M and B amounts", () => {
  assert.equal(compactCr(124_000_000), "Cr 1.24M");
  assert.equal(compactCr(123_400), "Cr 1.23K");
  assert.equal(compactCr(123_456_789_000), "Cr 1.23B");
  assert.equal(compactCr(12_345), "Cr 123.45");
});
test("pct and signed format basis points and positive or negative values", () => {
  assert.equal(pct(1_250), "12.50%");
  assert.equal(pct(-250), "-2.50%");
  assert.equal(signed(12_345), "+Cr 123.45");
  assert.equal(signed(-12_345), "−Cr 123.45");
  assert.equal(signed(0), "Cr 0.00");
});
