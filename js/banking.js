import { MONEY_SCALE } from "./finance.js";

export const BANKING_INSTITUTIONS = Object.freeze([
 {id:"national-union",name:"National Union Bank",type:"National",description:"Large nationwide deposit-taking bank with broad consumer services.",depositRateBps:180,loanRateBps:1050,feeMinor:250,stability:92,depositInsurance:true},
 {id:"meridian-local",name:"Meridian Community Bank",type:"Local",description:"Community-focused bank with relationship-based lending.",depositRateBps:240,loanRateBps:1250,feeMinor:150,stability:82,depositInsurance:true},
 {id:"harbor-micro",name:"Harbor Microfinance",type:"Microfinance",description:"Small-ticket credit and savings for households and microbusinesses.",depositRateBps:300,loanRateBps:1850,feeMinor:100,stability:68,depositInsurance:false},
 {id:"aster-investment",name:"Aster Investment Bank",type:"Investment",description:"Structured financing and secured facilities for established clients.",depositRateBps:100,loanRateBps:900,feeMinor:500,stability:88,depositInsurance:false},
 {id:"rapid-credit",name:"Rapid Cash Lenders",type:"Predatory",description:"Fast emergency credit with severe pricing and default risk.",depositRateBps:0,loanRateBps:4800,feeMinor:1500,stability:35,depositInsurance:false}
]);
const clone=v=>typeof structuredClone==="function"?structuredClone(v):JSON.parse(JSON.stringify(v));
const positive=n=>Number.isSafeInteger(n)&&n>0;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const institution=id=>BANKING_INSTITUTIONS.find(b=>b.id===id);
const loanTypes={
 personal:{label:"Personal loan",maxTerm:52,minScore:540,secured:false},
 mortgage:{label:"Mortgage loan",maxTerm:260,minScore:640,secured:true},
 business:{label:"Business loan",maxTerm:156,minScore:620,secured:true},
 micro:{label:"Microloan",maxTerm:26,minScore:500,secured:false}
};
function account(finance,id,name,type,subtype){if(!finance.accounts.some(a=>a.id===id))finance.accounts.push({id,name,type,subtype,balanceMinor:0});}
function post(finance,{id,date,turn,kind,description,amountMinor,lines,category=null,relatedId=null}){
 const debit=lines.reduce((s,l)=>s+l.debitMinor,0),credit=lines.reduce((s,l)=>s+l.creditMinor,0);
 if(debit!==credit||debit<=0)throw new Error("Banking journal entry is not balanced.");
 const byId=new Map(finance.accounts.map(a=>[a.id,a]));
 for(const l of lines){const a=byId.get(l.accountId);if(!a||!Number.isSafeInteger(l.debitMinor)||!Number.isSafeInteger(l.creditMinor)||l.debitMinor<0||l.creditMinor<0)throw new Error("Banking journal line is invalid.");a.balanceMinor+=["asset","expense"].includes(a.type)?l.debitMinor-l.creditMinor:l.creditMinor-l.debitMinor;}
 finance.ledger.push({id,date,turn,kind,description,amountMinor,category,relatedId,lines:clone(lines)});
}
const line=(accountId,debitMinor=0,creditMinor=0)=>({accountId,debitMinor,creditMinor});
function creditChange(banking,delta,reason,turn){banking.creditScore=clamp(banking.creditScore+delta,300,850);banking.creditHistory.push({turn,delta,score:banking.creditScore,reason});}
function addBankAccount(banking,finance,bankId,type,turn,sequence){
 const bank=institution(bankId);if(!bank)throw new Error("Choose a valid financial institution.");
 if(!["checking","savings"].includes(type))throw new Error("Choose checking or savings for a new account.");
 if(banking.accounts.some(a=>a.bankId===bankId&&a.type===type&&a.status==="open"))throw new Error("You already have an open account of this type at this institution.");
 const id=`bank-account-${sequence}`,ledgerAccountId=id;
 account(finance,ledgerAccountId,`${bank.name} — ${type==="checking"?"Checking":"Savings"}`,"asset",`bank-${type}`);
 const record={id,bankId,type,ledgerAccountId,balanceMinor:0,openedAtTurn:turn,status:"open"};
 banking.accounts.push(record);return record;
}
export function createBankingState(character){
 return {creditScore:clamp(600+Math.round((character?.reputation??0)*0.5),300,850),accounts:[],fixedDeposits:[],loans:[],cards:[],creditHistory:[],nextId:1};
}
export function validateBanking(banking,finance){
 const errors=[];
 if(!banking||!Number.isInteger(banking.creditScore)||banking.creditScore<300||banking.creditScore>850||!Array.isArray(banking.accounts)||!Array.isArray(banking.fixedDeposits)||!Array.isArray(banking.loans)||!Array.isArray(banking.cards)||!Array.isArray(banking.creditHistory)||!Number.isInteger(banking.nextId)||banking.nextId<1)return {valid:false,errors:["Banking profile is malformed."]};
 for(const a of banking.accounts){if(!institution(a.bankId)||!["checking","savings"].includes(a.type)||!["open","closed"].includes(a.status)||!Number.isSafeInteger(a.balanceMinor)||a.balanceMinor<0||!finance.accounts.some(x=>x.id===a.ledgerAccountId))errors.push("A bank deposit account is invalid.");}
 for(const d of banking.fixedDeposits){if(!institution(d.bankId)||!Number.isSafeInteger(d.principalMinor)||d.principalMinor<=0||!Number.isInteger(d.maturityTurn)||!finance.accounts.some(x=>x.id===d.ledgerAccountId)||!["active","matured","closed"].includes(d.status))errors.push("A fixed deposit is invalid.");}
 for(const l of banking.loans){if(!institution(l.bankId)||!loanTypes[l.type]||!Number.isSafeInteger(l.principalMinor)||l.principalMinor<0||!Number.isSafeInteger(l.paymentMinor)||l.paymentMinor<0||!Number.isInteger(l.termWeeks)||l.termWeeks<1||!finance.accounts.some(x=>x.id===l.ledgerAccountId)||!["active","paid","defaulted"].includes(l.status))errors.push("A loan record is invalid.");}
 for(const c of banking.cards){if(!institution(c.bankId)||!Number.isSafeInteger(c.limitMinor)||c.limitMinor<=0||!Number.isSafeInteger(c.balanceMinor)||c.balanceMinor<0||c.balanceMinor>c.limitMinor||!finance.accounts.some(x=>x.id===c.ledgerAccountId))errors.push("A credit card is invalid.");}
 return {valid:errors.length===0,errors};
}
export function validateBankingAction(banking,finance,character,career,action,turn){
 if(!banking||!finance?.initialized)return {valid:false,reason:"Create a character and initialize finance before using banking."};
 const cash=finance.accounts.find(a=>a.id==="cash")?.balanceMinor??0;
 const bankAccount=banking.accounts.find(a=>a.id===action.accountId&&a.status==="open");
 const loan=banking.loans.find(a=>a.id===action.loanId&&a.status==="active");
 const card=banking.cards.find(a=>a.id===action.cardId);
 switch(action.type){
 case "OPEN_BANK_ACCOUNT":
  if(!institution(action.bankId)||!["checking","savings"].includes(action.accountType)||!positive(action.amountMinor)||action.amountMinor>cash)return {valid:false,reason:"Choose a valid bank account and an opening deposit within available cash."};
  if(banking.accounts.some(a=>a.bankId===action.bankId&&a.type===action.accountType&&a.status==="open"))return {valid:false,reason:"That account is already open."};return {valid:true};
 case "CREATE_FIXED_DEPOSIT":
  if(!bankAccount||!positive(action.amountMinor)||action.amountMinor>bankAccount.balanceMinor||![4,8,12,26,52].includes(action.termWeeks))return {valid:false,reason:"Choose an open deposit account, a valid amount and a term of 4, 8, 12, 26 or 52 weeks."};return {valid:true};
 case "WITHDRAW_BANK_FUNDS":
  if(!bankAccount||!positive(action.amountMinor)||action.amountMinor>bankAccount.balanceMinor)return {valid:false,reason:"Withdrawal must be within the selected account's available balance."};return {valid:true};
 case "APPLY_FOR_LOAN":{
  const bank=institution(action.bankId),type=loanTypes[action.loanType],amount=action.amountMinor,score=banking.creditScore;
  if(!bank||!type||!positive(amount)||!Number.isInteger(action.termWeeks)||action.termWeeks<1||action.termWeeks>type.maxTerm)return {valid:false,reason:"Choose a valid loan product, amount and repayment term."};
  if(score<type.minScore)return {valid:false,reason:`Your credit score (${score}) is below this product's minimum (${type.minScore}).`};
  if(bank.type==="Predatory"&&amount>300000)return {valid:false,reason:"This lender's simulated emergency facility is capped at 3,000 Credits."};
  if(bank.type!=="Predatory"&&amount>Math.max(100000,Math.round((career?.currentJob?.weeklyPayMinor??50000)*20)))return {valid:false,reason:"Requested amount exceeds the current income-based lending limit."};
  if(type.secured&&(!action.collateral||String(action.collateral).trim().length<3))return {valid:false,reason:"This secured loan requires a collateral description."};
  return {valid:true};
 }
 case "PAY_LOAN_INSTALLMENT":
  if(!loan||!positive(action.amountMinor)||action.amountMinor>cash||action.amountMinor>loan.principalMinor+loan.interestAccruedMinor)return {valid:false,reason:"Payment must be within available cash and the outstanding loan balance."};return {valid:true};
 case "APPLY_FOR_CREDIT_CARD":
  if(!institution(action.bankId)||!positive(action.limitMinor)||action.limitMinor>Math.max(50000,Math.round((career?.currentJob?.weeklyPayMinor??50000)*8))||banking.cards.some(c=>c.bankId===action.bankId))return {valid:false,reason:"Choose an eligible issuer and a limit within the current income-based cap."};
  if(banking.creditScore<560)return {valid:false,reason:"Your credit score is too low for this card offer."};return {valid:true};
 case "USE_CREDIT_CARD":
  if(!card||!positive(action.amountMinor)||card.balanceMinor+action.amountMinor>card.limitMinor)return {valid:false,reason:"Purchase exceeds the available credit limit or card is invalid."};return {valid:true};
 case "PAY_CREDIT_CARD":
  if(!card||!positive(action.amountMinor)||action.amountMinor>cash||action.amountMinor>card.balanceMinor)return {valid:false,reason:"Card payment must be within cash and outstanding card balance."};return {valid:true};
 default:return {valid:false,reason:`Unknown banking action: ${action.type}`};
 }
}
export function applyBankingAction(banking,finance,action,{date,turn,sequence}){
 const b=clone(banking),f=clone(finance),id=`journal-${sequence}`,next=()=>b.nextId++;
 const journal=(kind,description,amount,lines,category="banking",relatedId=null)=>post(f,{id, date,turn,kind,description,amountMinor:amount,lines,category,relatedId});
 if(action.type==="OPEN_BANK_ACCOUNT"){
  const record=addBankAccount(b,f,action.bankId,action.accountType,turn,next()),amount=action.amountMinor;
  journal("BANK_DEPOSIT",`Opening deposit — ${institution(action.bankId).name}`,amount,[line(record.ledgerAccountId,amount),line("cash",0,amount)]);
  record.balanceMinor=amount;
 }else if(action.type==="CREATE_FIXED_DEPOSIT"){
  const source=b.accounts.find(a=>a.id===action.accountId),bank=institution(source.bankId),idFixed=`fixed-deposit-${next()}`,ledgerAccountId=idFixed;
  account(f,ledgerAccountId,`${bank.name} — Fixed deposit`,"asset","fixed-deposit");
  const rate=bank.depositRateBps+250,interest=Math.round(action.amountMinor*rate/10000*action.termWeeks/52);
  journal("FIXED_DEPOSIT_OPENED",`Fixed deposit opened — ${bank.name}`,action.amountMinor,[line(ledgerAccountId,action.amountMinor),line(source.ledgerAccountId,0,action.amountMinor)]);
  source.balanceMinor-=action.amountMinor;b.fixedDeposits.push({id:idFixed,bankId:source.bankId,ledgerAccountId,principalMinor:action.amountMinor,interestMinor:interest,rateBps:rate,openedAtTurn:turn,maturityTurn:turn+action.termWeeks,status:"active"});
 }else if(action.type==="WITHDRAW_BANK_FUNDS"){
  const source=b.accounts.find(a=>a.id===action.accountId),amount=action.amountMinor;
  journal("BANK_WITHDRAWAL",`Withdrawal — ${institution(source.bankId).name}`,amount,[line("cash",amount),line(source.ledgerAccountId,0,amount)]);
  source.balanceMinor-=amount;
 }else if(action.type==="APPLY_FOR_LOAN"){
  const bank=institution(action.bankId),loanType=loanTypes[action.loanType],idLoan=`loan-${next()}`,ledgerAccountId=idLoan;
  account(f,ledgerAccountId,`${bank.name} — ${loanType.label}`,"liability","bank-loan");
  const rateBps=bank.loanRateBps+(b.creditScore<620?250:0),weeklyRate=rateBps/10000/52,payment=weeklyRate===0?Math.ceil(action.amountMinor/action.termWeeks):Math.ceil(action.amountMinor*weeklyRate/(1-Math.pow(1+weeklyRate,-action.termWeeks)));
  journal("LOAN_DISBURSEMENT",`${loanType.label} — ${bank.name}`,action.amountMinor,[line("cash",action.amountMinor),line(ledgerAccountId,0,action.amountMinor)]);
  b.loans.push({id:idLoan,bankId:bank.id,type:action.loanType,principalMinor:action.amountMinor,interestAccruedMinor:0,rateBps,termWeeks:action.termWeeks,paymentMinor:payment,remainingPayments:action.termWeeks,nextPaymentTurn:turn+1,collateral:action.collateral?String(action.collateral).trim():null,status:"active",missedPayments:0,openedAtTurn:turn,ledgerAccountId});
 }else if(action.type==="PAY_LOAN_INSTALLMENT"){
  const item=b.loans.find(x=>x.id===action.loanId),amount=action.amountMinor,interestPaid=Math.min(amount,item.interestAccruedMinor),principalPaid=amount-interestPaid;
  const lines=[line(item.ledgerAccountId,interestPaid+principalPaid,0),line("cash",0,amount)];
  if(interestPaid){account(f,"interestExpense","Interest expense","expense","interest");lines.push(line("interestExpense",interestPaid,0));}
  // Rebalance the liability debit against cash plus the interest expense credit.
  lines.splice(0,1,line(item.ledgerAccountId,principalPaid,0));
  lines.splice(1,0,line("interestExpense",interestPaid,0));
  journal("LOAN_PAYMENT",`Loan payment — ${item.type}`,amount,lines);
  item.interestAccruedMinor-=interestPaid;item.principalMinor-=principalPaid;item.remainingPayments=Math.max(0,item.remainingPayments-1);item.nextPaymentTurn=turn+1;
  if(item.principalMinor===0&&item.interestAccruedMinor===0){item.status="paid";creditChange(b,8,"Loan fully repaid",turn);}
 }else if(action.type==="APPLY_FOR_CREDIT_CARD"){
  const bank=institution(action.bankId),idCard=`card-${next()}`,ledgerAccountId=idCard;
  account(f,ledgerAccountId,`${bank.name} — Credit card`,"liability","credit-card");
  b.cards.push({id:idCard,bankId:bank.id,limitMinor:action.limitMinor,balanceMinor:0,rateBps:bank.loanRateBps+500,ledgerAccountId,openedAtTurn:turn,status:"open"});
  creditChange(b,2,"Credit card facility opened",turn);
 }else if(action.type==="USE_CREDIT_CARD"){
  const item=b.cards.find(x=>x.id===action.cardId),amount=action.amountMinor;
  account(f,"cardExpense","Credit card purchases","expense","card-purchase");
  journal("CARD_PURCHASE","Credit card purchase",amount,[line("cardExpense",amount),line(item.ledgerAccountId,0,amount)],"credit");
  item.balanceMinor+=amount;
 }else if(action.type==="PAY_CREDIT_CARD"){
  const item=b.cards.find(x=>x.id===action.cardId),amount=action.amountMinor;
  journal("CARD_PAYMENT","Credit card payment",amount,[line(item.ledgerAccountId,amount),line("cash",0,amount)],"credit");
  item.balanceMinor-=amount;creditChange(b,2,"Credit card payment recorded",turn);
 }
 return {banking:b,finance:f};
}
export function advanceBanking(state){
 const b=state.banking;if(!b)return [];
 const events=[],f=state.finance,turn=state.calendar.turn,date=state.calendar.currentDate;
 for(const a of b.accounts){if(a.status!=="open"||a.type!=="savings"||a.balanceMinor<=0)continue;const bank=institution(a.bankId),interest=Math.floor(a.balanceMinor*bank.depositRateBps/10000/52);if(interest>0){account(f,"interestIncome","Interest income","income","interest");post(f,{id:`journal-bank-interest-${turn}-${a.id}`,date,turn,kind:"DEPOSIT_INTEREST",description:`Savings interest — ${bank.name}`,amountMinor:interest,category:"interest",relatedId:a.id,lines:[line(a.ledgerAccountId,interest),line("interestIncome",0,interest)]});a.balanceMinor+=interest;events.push({type:"SAVINGS_INTEREST",summary:`${(interest/100).toFixed(2)} Credits interest earned.`,details:{accountId:a.id,amountMinor:interest}});}}
 for(const d of b.fixedDeposits){if(d.status!=="active"||turn<d.maturityTurn)continue;const amount=d.principalMinor+d.interestMinor;post(f,{id:`journal-fixed-maturity-${turn}-${d.id}`,date,turn,kind:"FIXED_DEPOSIT_MATURED",description:"Fixed deposit principal and interest matured",amountMinor:amount,category:"interest",relatedId:d.id,lines:[line("cash",amount),line(d.ledgerAccountId,0,d.principalMinor),...(d.interestMinor?[line("interestIncome",0,d.interestMinor)]:[])]});if(d.interestMinor)account(f,"interestIncome","Interest income","income","interest");d.status="matured";events.push({type:"FIXED_DEPOSIT_MATURED",summary:`Fixed deposit matured with ${(d.interestMinor/100).toFixed(2)} Credits interest.`,details:{depositId:d.id,amountMinor:amount}});}
 for(const loan of b.loans){if(loan.status!=="active")continue;const interest=Math.ceil(loan.principalMinor*loan.rateBps/10000/52);if(interest>0){account(f,"interestExpense","Interest expense","expense","interest");post(f,{id:`journal-loan-interest-${turn}-${loan.id}`,date,turn,kind:"LOAN_INTEREST",description:`Accrued interest — ${loan.type} loan`,amountMinor:interest,category:"interest",relatedId:loan.id,lines:[line("interestExpense",interest),line(loan.ledgerAccountId,0,interest)]});loan.interestAccruedMinor+=interest;}
  if(turn>=loan.nextPaymentTurn){const due=Math.min(loan.paymentMinor,loan.principalMinor+loan.interestAccruedMinor),cash=f.accounts.find(a=>a.id==="cash")?.balanceMinor??0;if(cash>=due&&due>0){const interestPaid=Math.min(due,loan.interestAccruedMinor),principalPaid=due-interestPaid,lines=[];if(principalPaid)lines.push(line(loan.ledgerAccountId,principalPaid));if(interestPaid)lines.push(line(loan.ledgerAccountId,interestPaid)); // liability reduction covers total due
   lines.length=0;lines.push(line(loan.ledgerAccountId,due),line("cash",0,due));post(f,{id:`journal-loan-payment-${turn}-${loan.id}`,date,turn,kind:"LOAN_PAYMENT",description:`Scheduled loan payment — ${loan.type}`,amountMinor:due,category:"loan-payment",relatedId:loan.id,lines});
   loan.interestAccruedMinor-=interestPaid;loan.principalMinor-=principalPaid;loan.remainingPayments=Math.max(0,loan.remainingPayments-1);loan.nextPaymentTurn=turn+1;loan.missedPayments=0;creditChange(b,2,"Scheduled loan payment made",turn);
   events.push({type:"LOAN_PAYMENT_MADE",summary:`Scheduled loan payment of ${(due/100).toFixed(2)} Credits made.`,details:{loanId:loan.id,amountMinor:due,principalPaid,interestPaid}});
   if(loan.principalMinor===0&&loan.interestAccruedMinor===0){loan.status="paid";creditChange(b,8,"Loan fully repaid",turn);}
  }else{loan.missedPayments++;loan.nextPaymentTurn=turn+1;creditChange(b,-12,"Missed scheduled loan payment",turn);events.push({type:"LOAN_PAYMENT_MISSED",summary:"A scheduled loan payment was missed because available cash was insufficient.",details:{loanId:loan.id,dueMinor:due}});if(loan.missedPayments>=4){loan.status="defaulted";creditChange(b,-45,"Loan entered default",turn);events.push({type:"LOAN_DEFAULT",summary:"A loan entered default after four consecutive missed payments.",details:{loanId:loan.id}});}}
  }
 }
 for(const event of events)state.eventLog.push({id:`banking-${turn}-${event.type.toLowerCase()}-${events.indexOf(event)}`,turn,date,...event});
 return events;
}
export function getLoanTypes(){return clone(loanTypes);}
