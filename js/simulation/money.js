/**
 * Integer-minor-unit money utilities.
 * MOSAIC's Luma (LU) has two minor-unit digits: 1 LU = 100 minor units.
 * Never use floating-point values for authoritative money calculations.
 */
export const DEFAULT_CURRENCY = "LU";
export const DEFAULT_MINOR_UNITS_PER_UNIT = 100;

function assertSafeInteger(value, label) {
  if (typeof value !== "number" || !Number.isInteger(value)) throw new TypeError(`${label} must be an integer.`);
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label} exceeds safe integer precision.`);
}

function assertCurrency(currency) {
  if (typeof currency !== "string" || !/^(?:LU|[A-Z]{3})$/.test(currency)) {
    throw new TypeError("currency must be LU or a three-letter uppercase code.");
  }
}

export function createMoney(minorUnits, currency = DEFAULT_CURRENCY) {
  assertSafeInteger(minorUnits, "minorUnits");
  assertCurrency(currency);
  return Object.freeze({ minorUnits, currency });
}

export function parseMoney(amount, currency = DEFAULT_CURRENCY) {
  assertCurrency(currency);
  if (typeof amount !== "string" && typeof amount !== "number") {
    throw new TypeError("amount must be a decimal string or number.");
  }
  if (typeof amount === "number" && !Number.isFinite(amount)) {
    throw new RangeError("amount must be finite.");
  }
  const text = String(amount).trim();
  const match = /^(-?)(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) throw new RangeError("amount must have at most two decimal places and no separators.");
  const whole = Number(match[2]);
  const fraction = Number((match[3] || "").padEnd(2, "0"));
  const magnitude = whole * DEFAULT_MINOR_UNITS_PER_UNIT + fraction;
  if (!Number.isSafeInteger(magnitude)) throw new RangeError("amount exceeds safe integer precision.");
  return createMoney(match[1] ? -magnitude : magnitude, currency);
}

export function addMoney(a, b) {
  assertSameCurrency(a, b);
  return createMoney(a.minorUnits + b.minorUnits, a.currency);
}

export function subtractMoney(a, b) {
  assertSameCurrency(a, b);
  return createMoney(a.minorUnits - b.minorUnits, a.currency);
}

export function multiplyMoney(money, quantity) {
  if (!money || !Number.isSafeInteger(money.minorUnits)) throw new TypeError("Invalid money value.");
  if (!Number.isSafeInteger(quantity)) throw new TypeError("quantity must be a safe integer.");
  const result = BigInt(money.minorUnits) * BigInt(quantity);
  if (result > BigInt(Number.MAX_SAFE_INTEGER) || result < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError("Money multiplication exceeds safe integer precision.");
  }
  return createMoney(Number(result), money.currency);
}

export function applyBasisPoints(money, basisPoints, { rounding = "half-up" } = {}) {
  if (!money || !Number.isSafeInteger(money.minorUnits)) throw new TypeError("Invalid money value.");
  if (!Number.isSafeInteger(basisPoints)) throw new TypeError("basisPoints must be a safe integer.");
  if (!["half-up", "down", "up"].includes(rounding)) throw new RangeError("Unsupported rounding mode.");
  const numerator = BigInt(money.minorUnits) * BigInt(basisPoints);
  const denominator = 10000n;
  let quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder !== 0n) {
    if (rounding === "up") quotient += numerator > 0n ? 1n : -1n;
    if (rounding === "half-up" && (remainder < 0n ? -remainder : remainder) * 2n >= denominator) {
      quotient += numerator > 0n ? 1n : -1n;
    }
  }
  if (quotient > BigInt(Number.MAX_SAFE_INTEGER) || quotient < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError("Basis-point calculation exceeds safe integer precision.");
  }
  return createMoney(Number(quotient), money.currency);
}

export function assertSameCurrency(a, b) {
  if (!a || !b || a.currency !== b.currency) throw new RangeError("Currency mismatch.");
}

export function formatMoney(money, options = {}) {
  if (!money || !Number.isSafeInteger(money.minorUnits)) throw new TypeError("Invalid money value.");
  assertCurrency(money.currency);
  const { minorUnits, currency } = money;
  const sign = minorUnits < 0 ? "-" : "";
  const absolute = Math.abs(minorUnits);
  const major = Math.floor(absolute / DEFAULT_MINOR_UNITS_PER_UNIT);
  const minor = String(absolute % DEFAULT_MINOR_UNITS_PER_UNIT).padStart(2, "0");
  const symbol = options.symbol ?? currency;
  return `${sign}${symbol} ${major.toLocaleString("en-US")}.${minor}`;
}
