/**
 * Small, deterministic double-entry ledger.
 * Amounts are positive integer minor units; direction is expressed by debit/credit.
 */
import { DEFAULT_CURRENCY, createMoney } from "./money.js";

export const ACCOUNT_TYPES = Object.freeze(["asset", "liability", "equity", "income", "expense"]);
const NORMAL_SIDE = Object.freeze({
  asset: "debit",
  expense: "debit",
  liability: "credit",
  equity: "credit",
  income: "credit"
});

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${label} is required.`);
  return value.trim();
}

function safeAmount(value) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError("Entry amount must be a positive safe integer in minor units.");
  }
  return value;
}

export class Ledger {
  #accounts = new Map();
  #transactions = [];
  #transactionIds = new Set();

  createAccount({ id, name, type, currency = DEFAULT_CURRENCY, parentId = null, metadata = {} }) {
    id = requireText(id, "Account id");
    name = requireText(name, "Account name");
    if (this.#accounts.has(id)) throw new Error(`Account already exists: ${id}`);
    if (!ACCOUNT_TYPES.includes(type)) throw new RangeError(`Unsupported account type: ${type}`);
    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) throw new TypeError("Invalid currency.");
    if (parentId && !this.#accounts.has(parentId)) throw new Error(`Unknown parent account: ${parentId}`);
    const account = Object.freeze({ id, name, type, currency, parentId, metadata: structuredClone(metadata), active: true });
    this.#accounts.set(id, account);
    return account;
  }

  getAccount(id) {
    const account = this.#accounts.get(id);
    return account ? structuredClone(account) : null;
  }

  listAccounts() {
    return [...this.#accounts.values()].map(account => structuredClone(account));
  }

  postTransaction({ id, date, description, reference = null, entries }) {
    id = requireText(id, "Transaction id");
    description = requireText(description, "Transaction description");
    if (this.#transactionIds.has(id)) throw new Error(`Duplicate transaction id: ${id}`);
    if (typeof date !== "string" || Number.isNaN(Date.parse(date))) throw new TypeError("A valid ISO date is required.");
    if (!Array.isArray(entries) || entries.length < 2) throw new RangeError("A transaction requires at least two entries.");

    // Validate the entire transaction before mutating ledger state.
    let debitTotal = 0;
    let creditTotal = 0;
    const normalized = entries.map((entry, index) => {
      const accountId = requireText(entry.accountId, `Entry ${index + 1} accountId`);
      const account = this.#accounts.get(accountId);
      if (!account || !account.active) throw new Error(`Unknown or inactive account: ${accountId}`);
      const side = entry.side;
      if (side !== "debit" && side !== "credit") throw new RangeError("Entry side must be debit or credit.");
      const amount = safeAmount(entry.amountMinor);
      if (entry.currency && entry.currency !== account.currency) throw new RangeError("Entry currency does not match account currency.");
      if (side === "debit") debitTotal += amount;
      else creditTotal += amount;
      if (!Number.isSafeInteger(debitTotal) || !Number.isSafeInteger(creditTotal)) throw new RangeError("Transaction total exceeds safe integer precision.");
      return Object.freeze({ accountId, side, amountMinor: amount, currency: account.currency, memo: entry.memo ?? null });
    });

    const currencies = new Set(normalized.map(entry => entry.currency));
    if (currencies.size !== 1) throw new RangeError("A transaction cannot mix currencies.");
    if (debitTotal !== creditTotal) throw new RangeError(`Unbalanced transaction: debits ${debitTotal}, credits ${creditTotal}.`);

    const transaction = Object.freeze({
      id, date, description, reference,
      currency: normalized[0].currency,
      debitTotalMinor: debitTotal,
      creditTotalMinor: creditTotal,
      entries: Object.freeze(normalized),
      postedAtSequence: this.#transactions.length + 1
    });
    this.#transactions.push(transaction);
    this.#transactionIds.add(id);
    return structuredClone(transaction);
  }

  getBalance(accountId) {
    const account = this.#accounts.get(accountId);
    if (!account) throw new Error(`Unknown account: ${accountId}`);
    let debits = 0;
    let credits = 0;
    for (const tx of this.#transactions) {
      for (const entry of tx.entries) {
        if (entry.accountId !== accountId) continue;
        if (entry.side === "debit") debits += entry.amountMinor;
        else credits += entry.amountMinor;
      }
    }
    const normal = NORMAL_SIDE[account.type];
    const balanceMinor = normal === "debit" ? debits - credits : credits - debits;
    return createMoney(balanceMinor, account.currency);
  }

  getTransactions() {
    return this.#transactions.map(transaction => structuredClone(transaction));
  }

  reverseTransaction(originalId, { id, date, description } = {}) {
    const original = this.#transactions.find(tx => tx.id === originalId);
    if (!original) throw new Error(`Unknown transaction: ${originalId}`);
    if (this.#transactions.some(tx => tx.reference === originalId && tx.description.startsWith("Reversal:"))) {
      throw new Error(`Transaction already reversed: ${originalId}`);
    }
    return this.postTransaction({
      id,
      date,
      description: description ?? `Reversal: ${original.description}`,
      reference: originalId,
      entries: original.entries.map(entry => ({
        accountId: entry.accountId,
        side: entry.side === "debit" ? "credit" : "debit",
        amountMinor: entry.amountMinor,
        currency: entry.currency,
        memo: entry.memo
      }))
    });
  }
}
