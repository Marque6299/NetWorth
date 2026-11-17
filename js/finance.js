export const MONEY_SCALE = 100;
export const CURRENCY_LABEL = "Credits";
const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const account = (id,name,type,subtype) => ({id,name,type,subtype,balanceMinor:0});
const money = value => Number.isSafeInteger(value) && value > 0;
function post(finance,{id,date,turn,kind,description,amountMinor,lines,category=null,relatedId=null}) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) throw new Error("Journal amount must be a non-negative safe integer.");
  const debit=lines.reduce((sum,line)=>sum+line.debitMinor,0), credit=lines.reduce((sum,line)=>sum+line.creditMinor,0);
  if(debit!==credit || debit===0) throw new Error("Journal entry is not balanced.");
  const byId=new Map(finance.accounts.map(item=>[item.id,item]));
  for(const line of lines){
    const target=byId.get(line.accountId);
    if(!target || !Number.isSafeInteger(line.debitMinor) || !Number.isSafeInteger(line.creditMinor) || line.debitMinor<0 || line.creditMinor<0 || (line.debitMinor>0 && line.creditMinor>0)) throw new Error("Journal line is invalid.");
    const normalDebit=["asset","expense"].includes(target.type);
    target.balanceMinor += normalDebit ? line.debitMinor-line.creditMinor : line.creditMinor-line.debitMinor;
  }
  finance.ledger.push({id,date,turn,kind,description,amountMinor,category,relatedId,lines:clone(lines)});
}
export function createOpeningFinance(context,date,turn=0){
  const capital=Math.round(context.capital*MONEY_SCALE),debt=Math.round(context.debt*MONEY_SCALE),monthly=Math.round(context.monthlyExpense*MONEY_SCALE);
  const finance={currency:"CREDITS",accounts:[
    account("cash","Cash","asset","cash"),account("savings","Savings","asset","savings"),account("investment","Investment holdings","asset","investment"),
    account("loan","Opening personal debt","liability","loan"),account("openingEquity","Opening net position","equity","opening"),
    account("income","Income","income","income"),account("expense","Household expenses","expense","expense"),account("unrealizedGain","Unrealized valuation changes","equity","valuation")
  ],ledger:[],budgets:[{id:"budget-household",category:"household",label:"Household spending",monthlyLimitMinor:monthly}],monthlyBaselineMinor:monthly,initialized:true};
  const lines=[];
  if(capital)lines.push({accountId:"cash",debitMinor:capital,creditMinor:0});
  if(debt)lines.push({accountId:"loan",debitMinor:0,creditMinor:debt});
  if(capital>debt)lines.push({accountId:"openingEquity",debitMinor:0,creditMinor:capital-debt});
  if(debt>capital)lines.push({accountId:"openingEquity",debitMinor:debt-capital,creditMinor:0});
  if(lines.length)post(finance,{id:"journal-opening",date,turn,kind:"OPENING_BALANCE",description:"Opening balances from the selected character profile",amountMinor:Math.max(capital,debt),lines});
  return finance;
}
export function validateFinance(finance){
  const errors=[];
  if(!finance||finance.initialized!==true||finance.currency!=="CREDITS"||!Array.isArray(finance.accounts)||!Array.isArray(finance.ledger)||!Array.isArray(finance.budgets))return {valid:false,errors:["Finance data is missing or malformed."]};
  const ids=new Set(),calculated={};
  for(const a of finance.accounts){if(!a||typeof a.id!=="string"||ids.has(a.id)||!["asset","liability","equity","income","expense"].includes(a.type)||!Number.isSafeInteger(a.balanceMinor))errors.push("A finance account is invalid.");ids.add(a.id);calculated[a.id]=0;}
  for(const entry of finance.ledger){
    if(!entry||!Array.isArray(entry.lines)||!entry.lines.length||!Number.isSafeInteger(entry.amountMinor)||entry.amountMinor<0){errors.push("A journal entry is invalid.");continue;}
    let debit=0,credit=0;
    for(const line of entry.lines){if(!ids.has(line.accountId)||!Number.isSafeInteger(line.debitMinor)||!Number.isSafeInteger(line.creditMinor)||line.debitMinor<0||line.creditMinor<0||(line.debitMinor>0&&line.creditMinor>0)){errors.push("A journal line is invalid.");continue;}debit+=line.debitMinor;credit+=line.creditMinor;const a=finance.accounts.find(x=>x.id===line.accountId);calculated[a.id]+=([ "asset","expense" ].includes(a.type)?1:-1)*(line.debitMinor-line.creditMinor);}
    if(debit!==credit||debit===0)errors.push("A journal entry is not balanced.");
  }
  for(const a of finance.accounts)if(calculated[a.id]!==a.balanceMinor)errors.push(`Account ${a.id} does not reconcile to its journal.`);
  for(const b of finance.budgets)if(!b||typeof b.category!=="string"||!Number.isSafeInteger(b.monthlyLimitMinor)||b.monthlyLimitMinor<0)errors.push("A budget is invalid.");
  if(!Number.isSafeInteger(finance.monthlyBaselineMinor)||finance.monthlyBaselineMinor<0)errors.push("Monthly baseline expense is invalid.");
  return {valid:errors.length===0,errors};
}
export function getFinanceSummary(finance){
 const get=id=>finance?.accounts?.find(a=>a.id===id)?.balanceMinor??0;
 const assets=finance.accounts.filter(a=>a.type==="asset").reduce((s,a)=>s+a.balanceMinor,0);
 const liabilities=finance.accounts.filter(a=>a.type==="liability").reduce((s,a)=>s+a.balanceMinor,0);
 const income=finance.accounts.filter(a=>a.type==="income").reduce((s,a)=>s+a.balanceMinor,0);
 const expenses=finance.accounts.filter(a=>a.type==="expense").reduce((s,a)=>s+a.balanceMinor,0);
 const cashflow=income-expenses;
 return {cash:get("cash"),savings:get("savings"),investment:get("investment"),assets,liabilities,netWorth:assets-liabilities,liquidNetWorth:get("cash")+get("savings")+finance.accounts.filter(a=>a.type==="asset"&&["bank-checking","bank-savings"].includes(a.subtype)).reduce((sum,a)=>sum+a.balanceMinor,0)-liabilities,income,expenses,netCashflow:cashflow,monthlyBaseline:finance.monthlyBaselineMinor};
}
export function validateFinanceAction(finance,action){
 if(!finance?.initialized)return {valid:false,reason:"Create a character and initialize household finance first."};
 const amount=action.amountMinor;
 if(["RECORD_INCOME","RECORD_EXPENSE","TRANSFER_FUNDS","BORROW_MONEY","REPAY_DEBT","RECORD_UNREALIZED_CHANGE"].includes(action.type)&&!money(amount))return {valid:false,reason:"Enter a positive amount in Credits (up to two decimal places)."};
 const balance=id=>finance.accounts.find(a=>a.id===id)?.balanceMinor??0;
 if(action.type==="RECORD_EXPENSE"&&amount>balance("cash"))return {valid:false,reason:"There is not enough cash for this expense."};
 if(action.type==="TRANSFER_FUNDS"&&(!["cash","savings"].includes(action.from)||!["cash","savings"].includes(action.to)||action.from===action.to||amount>balance(action.from)))return {valid:false,reason:"Choose valid source and destination accounts and an amount within the available balance."};
 if(action.type==="REPAY_DEBT"&&amount>balance("loan"))return {valid:false,reason:"Repayment cannot exceed the outstanding loan principal."};
 if(action.type==="RECORD_UNREALIZED_CHANGE"&&!["gain","loss"].includes(action.direction))return {valid:false,reason:"Choose an unrealized gain or loss."};
 if(action.type==="RECORD_UNREALIZED_CHANGE"&&action.direction==="loss"&&amount>balance("investment"))return {valid:false,reason:"A valuation loss cannot exceed the recorded investment value."};
 if(action.type==="SET_BUDGET"&&(!["household","transport","education","health","leisure","other"].includes(action.category)||!Number.isSafeInteger(action.monthlyLimitMinor)||action.monthlyLimitMinor<0))return {valid:false,reason:"Choose a valid budget category and non-negative monthly limit."};
 if(!["RECORD_INCOME","RECORD_EXPENSE","TRANSFER_FUNDS","BORROW_MONEY","REPAY_DEBT","RECORD_UNREALIZED_CHANGE","SET_BUDGET"].includes(action.type))return {valid:false,reason:`Unknown finance action: ${action.type}`};
 return {valid:true};
}
export function applyFinanceAction(finance,action,{date,turn,sequence}){
 const next=clone(finance),amount=action.amountMinor,id=`journal-${sequence}`;
 const entry=(kind,description,lines,category=null,relatedId=null)=>post(next,{id,date,turn,kind,description,amountMinor:amount??0,lines,category,relatedId});
 const line=(accountId,debitMinor=0,creditMinor=0)=>({accountId,debitMinor,creditMinor});
 switch(action.type){
  case "RECORD_INCOME": entry("INCOME",action.description?.trim()||"Income received",[line("cash",amount),line("income",0,amount)],action.category||"income");break;
  case "RECORD_EXPENSE": entry("EXPENSE",action.description?.trim()||"Household expense",[line("expense",amount),line("cash",0,amount)],action.category||"household");break;
  case "TRANSFER_FUNDS": entry("TRANSFER",`Transfer: ${action.from} to ${action.to}`,[line(action.to,amount),line(action.from,0,amount)]);break;
  case "BORROW_MONEY": entry("BORROWING",action.description?.trim()||"Loan proceeds received",[line("cash",amount),line("loan",0,amount)]);break;
  case "REPAY_DEBT": entry("DEBT_REPAYMENT",action.description?.trim()||"Loan principal repaid",[line("loan",amount),line("cash",0,amount)]);break;
  case "RECORD_UNREALIZED_CHANGE":
   if(action.direction==="loss")entry("UNREALIZED_LOSS",action.description?.trim()||"Investment valuation decreased",[line("unrealizedGain",amount),line("investment",0,amount)]);
   else entry("UNREALIZED_GAIN",action.description?.trim()||"Investment valuation increased",[line("investment",amount),line("unrealizedGain",0,amount)]);
   break;
  case "SET_BUDGET":{
   const old=next.budgets.find(b=>b.category===action.category);
   if(old)old.monthlyLimitMinor=action.monthlyLimitMinor;else next.budgets.push({id:`budget-${action.category}`,category:action.category,label:action.category[0].toUpperCase()+action.category.slice(1),monthlyLimitMinor:action.monthlyLimitMinor});
   return next;
  }
 }
 return next;
}
