/** Ledger: atomic double-entry postings, audit history, trial balance and snapshots. */
import { DEFAULT_CURRENCY, createMoney } from "./money.js";
export const ACCOUNT_TYPES = Object.freeze(["asset","liability","equity","income","expense"]);
const NORMAL_SIDE = Object.freeze({asset:"debit",expense:"debit",liability:"credit",equity:"credit",income:"credit"});
const clone = value => structuredClone(value);
function text(value,label){if(typeof value!=="string"||!value.trim())throw new TypeError(label+" is required.");return value.trim();}
function amount(value){if(!Number.isSafeInteger(value)||value<=0)throw new RangeError("Entry amount must be a positive safe integer in minor units.");return value;}
function validDate(value){return typeof value==="string"&&/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)&&!Number.isNaN(Date.parse(value));}
function entryKey(e){return [e.accountId,e.side,e.amountMinor,e.currency].join("|");}
export class Ledger{
 #accounts=new Map(); #transactions=[]; #ids=new Set();
 createAccount({id,name,type,currency=DEFAULT_CURRENCY,parentId=null,metadata={}}){
  id=text(id,"Account id");name=text(name,"Account name");
  if(this.#accounts.has(id))throw new Error("Account already exists: "+id);
  if(!ACCOUNT_TYPES.includes(type))throw new RangeError("Unsupported account type: "+type);
  if(typeof currency!=="string"||!/^[A-Z]{3}$/.test(currency))throw new TypeError("Invalid currency.");
  if(parentId!==null){const p=this.#accounts.get(parentId);if(!p)throw new Error("Unknown parent account: "+parentId);if(p.currency!==currency)throw new RangeError("Parent and child accounts must use the same currency.");}
  if(metadata===null||typeof metadata!=="object"||Array.isArray(metadata))throw new TypeError("Account metadata must be an object.");
  const a=Object.freeze({id,name,type,currency,parentId,metadata:clone(metadata),active:true});this.#accounts.set(id,a);return clone(a);
 }
 getAccount(id){const a=this.#accounts.get(id);return a?clone(a):null;}
 listAccounts(){return [...this.#accounts.values()].map(clone);}
 postTransaction({id,date,description,reference=null,reversalOf=null,entries}){
  id=text(id,"Transaction id");description=text(description,"Transaction description");
  if(this.#ids.has(id))throw new Error("Duplicate transaction id: "+id);
  if(!validDate(date))throw new TypeError("date must be YYYY-MM-DD or a UTC ISO timestamp.");
  if(!Array.isArray(entries)||entries.length<2)throw new RangeError("A transaction requires at least two entries.");
  let debits=0,credits=0;
  const normalized=entries.map((e,i)=>{
   if(!e||typeof e!=="object")throw new TypeError("Entry "+(i+1)+" must be an object.");
   const accountId=text(e.accountId,"Entry "+(i+1)+" accountId"),a=this.#accounts.get(accountId);
   if(!a||!a.active)throw new Error("Unknown or inactive account: "+accountId);
   if(e.side!=="debit"&&e.side!=="credit")throw new RangeError("Entry side must be debit or credit.");
   const n=amount(e.amountMinor);if(e.currency&&e.currency!==a.currency)throw new RangeError("Entry currency does not match account currency.");
   if(e.side==="debit")debits+=n;else credits+=n;
   if(!Number.isSafeInteger(debits)||!Number.isSafeInteger(credits))throw new RangeError("Transaction total exceeds safe integer precision.");
   return Object.freeze({accountId,side:e.side,amountMinor:n,currency:a.currency,memo:e.memo==null?null:String(e.memo)});
  });
  if(new Set(normalized.map(e=>e.currency)).size!==1)throw new RangeError("A transaction cannot mix currencies.");
  if(debits!==credits)throw new RangeError("Unbalanced transaction: debits "+debits+", credits "+credits+".");
  if(reversalOf!==null){
   const original=this.#transactions.find(t=>t.id===reversalOf);if(!original)throw new Error("Cannot reverse unknown transaction: "+reversalOf);
   if(this.#transactions.some(t=>t.reversalOf===reversalOf))throw new Error("Transaction already reversed: "+reversalOf);
   const expected=original.entries.map(e=>entryKey({accountId:e.accountId,side:e.side==="debit"?"credit":"debit",amountMinor:e.amountMinor,currency:e.currency})).sort();
   const actual=normalized.map(entryKey).sort();
   if(expected.length!==actual.length||expected.some((k,i)=>k!==actual[i]))throw new Error("Reversal entries must exactly negate the original transaction.");
   if(reference!==reversalOf)throw new Error("A reversal must reference its original transaction.");
  }
  const tx=Object.freeze({id,date,description,reference,reversalOf,currency:normalized[0].currency,debitTotalMinor:debits,creditTotalMinor:credits,entries:Object.freeze(normalized),postedAtSequence:this.#transactions.length+1});
  this.#transactions.push(tx);this.#ids.add(id);return clone(tx);
 }
 getBalance(accountId){
  const a=this.#accounts.get(accountId);if(!a)throw new Error("Unknown account: "+accountId);
  let d=0,c=0;for(const tx of this.#transactions)for(const e of tx.entries)if(e.accountId===accountId){if(e.side==="debit")d+=e.amountMinor;else c+=e.amountMinor;if(!Number.isSafeInteger(d)||!Number.isSafeInteger(c))throw new RangeError("Account balance exceeds safe integer precision: "+accountId);}
  return createMoney(NORMAL_SIDE[a.type]==="debit"?d-c:c-d,a.currency);
 }
 getTrialBalance(){
  const accounts=this.listAccounts().map(a=>({accountId:a.id,name:a.name,type:a.type,currency:a.currency,balance:this.getBalance(a.id)})),totals={};
  for(const row of accounts){const t=totals[row.currency]??={debitMinor:0,creditMinor:0};const side=NORMAL_SIDE[row.type];const key=row.balance.minorUnits>=0?(side==="debit"?"debitMinor":"creditMinor"):(side==="debit"?"creditMinor":"debitMinor");t[key]+=Math.abs(row.balance.minorUnits);if(!Number.isSafeInteger(t[key]))throw new RangeError("Trial balance exceeds safe integer precision.");}
  return {accounts,totals,balanced:Object.values(totals).every(t=>t.debitMinor===t.creditMinor)};
 }
 getTransactions(){return this.#transactions.map(clone);}
 reverseTransaction(originalId,{id,date,description}={}){const o=this.#transactions.find(t=>t.id===originalId);if(!o)throw new Error("Unknown transaction: "+originalId);return this.postTransaction({id,date,description:description??"Reversal: "+o.description,reference:originalId,reversalOf:originalId,entries:o.entries.map(e=>({accountId:e.accountId,side:e.side==="debit"?"credit":"debit",amountMinor:e.amountMinor,currency:e.currency,memo:e.memo}))});}
 toJSON(){return {version:1,accounts:this.listAccounts(),transactions:this.getTransactions()};}
 static fromJSON(snapshot){
  if(!snapshot||snapshot.version!==1||!Array.isArray(snapshot.accounts)||!Array.isArray(snapshot.transactions))throw new TypeError("Unsupported or malformed ledger snapshot.");
  const ledger=new Ledger();for(const a of snapshot.accounts)ledger.createAccount(a);
  for(const t of snapshot.transactions)ledger.postTransaction({id:t.id,date:t.date,description:t.description,reference:t.reference??null,reversalOf:t.reversalOf??null,entries:t.entries});
  return ledger;
 }
}