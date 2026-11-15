/**
 * Integer-based money utilities for MOSAIC.
 * LU uses 2 minor-unit digits: 1 LU = 100 minor units.
 * Never use floating-point values for authoritative money calculations.
 */
export const DEFAULT_CURRENCY = "LU";
export const DEFAULT_MINOR_UNITS_PER_UNIT = 100;

function assertSafeInteger(value, label) {
  if (!Number.isSafeInteger(value)) throw new TypeError(`${label} must be a safe integer.`);
}

export function createMoney(minorUnits, currency = DEFAULT_CURRENCY) {
  assertSafeInteger(minorUnits, "minorUnits");
  if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError("currency must be a three-letter uppercase code.");
  }
  return Object.freeze({ minorUnits, currency });
}

export function parseMoney(amount, currency = DEFAULT_CURRENCY) {
  if (typeof amount !== "string" && typeof amount !== "number") {
    throw new TypeError("amount must be a decimal string or number.");
  }
  const text = String(amount).trim();
  const match = /^(-?)(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) throw new RangeError("amount must have at most two decimal places and no separators.");
  const whole = Number(match[2]);
  const fraction = Number((match[3] || "").padEnd(2, "0"));
  const magnitude = whole * DEFAULT_MINOR_UNITS_PER_UNIT + fraction;
  const minorUnits = match[1] ? -magnitude : magnitude;
  return createMoney(minorUnits, currency);
}

export function addMoney(a, b) {
  assertSameCurrency(a, b);
  return createMoney(a.minorUnits + b.minorUnits, a.currency);
}

export function subtractMoney(a, b) {
  assertSameCurrency(a, b);
  return createMoney(a.minorUnits - b.minorUnits, a.currency);
}

export function assertSameCurrency(a, b) {
  if (!a || !b || a.currency !== b.currency) throw new RangeError("Currency mismatch.");
}

export function formatMoney(money, options = {}) {
  if (!money || !Number.isSafeInteger(money.minorUnits)) throw new TypeError("Invalid money value.");
  const { minorUnits, currency } = money;
  const sign = minorUnits < 0 ? "-" : "";
  const absolute = Math.abs(minorUnits);
  const major = Math.floor(absolute / DEFAULT_MINOR_UNITS_PER_UNIT);
  const minor = String(absolute % DEFAULT_MINOR_UNITS_PER_UNIT).padStart(2, "0");
  const symbol = options.symbol ?? currency;
  return `${sign}${symbol} ${major.toLocaleString("en-US")}.${minor}`;
}
