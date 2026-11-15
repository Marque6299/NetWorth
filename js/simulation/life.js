/** Deterministic household monthly settlement through the shared double-entry ledger. */
import { Ledger } from "./ledger.js";
const COST_ACCOUNT={utilities:"utilities-expense",food:"food-expense",transport:"transport-expense",healthcare:"healthcare-expense",communications:"communications-expense",childcare:"childcare-expense"};
export function settleHouseholdMonth(state,{month,transactionId}={}){
 if(!state?.player||!state?.ledger||!state?.systems?.household||!state?.systems?.employment)throw new TypeError("A complete player household state is required.");
 if(typeof month!=="string"||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new TypeError("month must use YYYY-MM format.");
 const household=state.systems.household;if(household.lastSettledMonth===month)throw new Error("Household month already settled: "+month);
 if(household.lastSettledMonth&&month<=household.lastSettledMonth)throw new RangeError("Household months must settle in chronological order.");
 const ledger=Ledger.fromJSON(state.ledger),employment=state.systems.employment.playerEmployment,costs=household.monthlyCosts,entries=[],expenses=[];
 const salary=employment.status==="employed"?employment.monthlyGrossMinor:0;
 if(salary){entries.push({accountId:"cash",side:"debit",amountMinor:salary},{accountId:"salary-income",side:"credit",amountMinor:salary});}
 const rent=household.housing.playerRentShareMinor??household.housing.monthlyRentMinor;if(rent)expenses.push({accountId:"rent-expense",amountMinor:rent,label:"rent"});
 for(const [key,accountId] of Object.entries(COST_ACCOUNT))if(costs[key]>0)expenses.push({accountId,amountMinor:costs[key],label:key});
 for(const liability of household.liabilities)if(liability.monthlyPaymentMinor>0){const principal=Math.min(liability.balanceMinor,liability.monthlyPaymentMinor);if(principal)expenses.push({accountId:"personal-debt",amountMinor:principal,label:"debt principal",liabilityId:liability.id,principal});}
 const outflow=expenses.reduce((sum,item)=>sum+item.amountMinor,0);
 if(ledger.getBalance("cash").minorUnits+salary<outflow)throw new RangeError("Insufficient cash to settle household obligations; no entries were posted.");
 for(const item of expenses){entries.push({accountId:item.accountId,side:"debit",amountMinor:item.amountMinor,memo:item.label},{accountId:"cash",side:"credit",amountMinor:item.amountMinor,memo:item.label});}
 if(!entries.length)throw new RangeError("This month has no income or obligations to settle.");
 ledger.postTransaction({id:transactionId??"household-"+month,date:month+"-01",description:"Household monthly income and obligations · "+month,entries});
 const next=structuredClone(state);next.ledger=ledger.toJSON();next.systems.household.lastSettledMonth=month;
 next.systems.household.liabilities=next.systems.household.liabilities.map(item=>({...item,balanceMinor:item.balanceMinor-(expenses.find(e=>e.liabilityId===item.id)?.principal??0)}));
 next.households[next.player.householdId].liabilities=structuredClone(next.systems.household.liabilities);return next;
}
export function getHouseholdMonthlyBudget(state){
 const h=state?.systems?.household,e=state?.systems?.employment?.playerEmployment;if(!h||!e)throw new TypeError("A complete player household state is required.");
 const costs={rent:h.housing.playerRentShareMinor??h.housing.monthlyRentMinor,...h.monthlyCosts};
 costs.debtPayments=h.liabilities.reduce((sum,item)=>sum+Math.min(item.balanceMinor,item.monthlyPaymentMinor),0);
 const totalOutflow=Object.values(costs).reduce((sum,n)=>sum+n,0),grossIncome=e.status==="employed"?e.monthlyGrossMinor:0;
 return {currency:"LU",grossIncomeMinor:grossIncome,costsMinor:costs,totalOutflowMinor:totalOutflow,projectedSurplusMinor:grossIncome-totalOutflow};
}
