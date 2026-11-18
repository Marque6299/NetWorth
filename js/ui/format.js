/**
 * Format integer minor-unit credits at the display edge.
 */

/**
 * Format a minor-unit amount with two decimal places.
 * @param {number} minor Integer amount in minor units.
 * @returns {string} Formatted credit amount.
 */
export function formatCr(minor) {
  if (!Number.isSafeInteger(minor)) throw new TypeError("Credit amounts must be safe integers in minor units.");
  const absolute = Math.abs(minor);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, "0");
  return `${minor < 0 ? "−" : ""}Cr ${whole.toLocaleString("en-US")}.${fraction}`;
}

/**
 * Format a minor-unit amount with K, M or B suffixes.
 * @param {number} minor Integer amount in minor units.
 * @returns {string} Compact formatted credit amount.
 */
export function compactCr(minor) {
  if (!Number.isSafeInteger(minor)) throw new TypeError("Credit amounts must be safe integers in minor units.");
  const amount = Math.abs(minor) / 100;
  const tier = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" }
  ].find(item => amount >= item.threshold);
  if (!tier) return formatCr(minor);
  return `${minor < 0 ? "−" : ""}Cr ${(amount / tier.threshold).toFixed(2)}${tier.suffix}`;
}

/**
 * Format basis points as a percentage.
 * @param {number} bps Integer value in basis points.
 * @returns {string} Percentage with two decimal places.
 */
export function pct(bps) {
  if (!Number.isSafeInteger(bps)) throw new TypeError("Percentage values must be safe integers in basis points.");
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * Format a signed minor-unit amount.
 * @param {number} minor Integer amount in minor units.
 * @returns {string} Signed formatted amount.
 */
export function signed(minor) {
  if (!Number.isSafeInteger(minor)) throw new TypeError("Credit amounts must be safe integers in minor units.");
  if (minor === 0) return formatCr(0);
  return minor > 0 ? `+${formatCr(minor)}` : `−${formatCr(Math.abs(minor))}`;
}
