/** Integrated, data-driven player start scenarios for Meridian. */
import { createInitialGameState } from "./state.js";
import { Ledger } from "./ledger.js";
const clone = value => structuredClone(value);
const SCENARIOS = {
"meridian-newcomer": {id:"meridian-newcomer",name:"The Meridian Newcomer",description:"A single adult arrives in Meridian with a steady entry-level job, a modest rental home and manageable personal debt.",player:{id:"player-1",name:"Alex Rowan",age:24,traits:["practical","ambitious"]},household:{id:"household-1",name:"Rowan Household",members:[{id:"player-1",role:"player",relationship:"self",age:24,financiallyDependent:false}]},employment:{status:"employed",employerId:"meridian-services-co",role:"Operations Associate",industry:"professional-services",monthlyGrossMinor:280000,payDay:1},housing:{arrangement:"renting",propertyId:null,bedrooms:1,monthlyRentMinor:85000,securityDepositPaid:true},cashMinor:240000,liabilities:[{id:"personal-loan",type:"personal-loan",balanceMinor:120000,monthlyPaymentMinor:12000,creditor:"Meridian Community Finance"}],monthlyCosts:{utilities:14000,food:42000,transport:16000,healthcare:8000,communications:5000},startDate:"2026-01-01"},
"family-provider": {id:"family-provider",name:"The Family Provider",description:"A working adult supports a partner and child while renting a family apartment and repaying a larger loan.",player:{id:"player-1",name:"Jordan Vale",age:31,traits:["reliable","protective"]},household:{id:"household-1",name:"Vale Household",members:[{id:"player-1",role:"player",relationship:"self",age:31,financiallyDependent:false},{id:"partner-1",role:"partner",relationship:"partner",age:30,financiallyDependent:true},{id:"child-1",role:"child",relationship:"child",age:6,financiallyDependent:true}]},employment:{status:"employed",employerId:"meridian-port-services",role:"Dispatch Coordinator",industry:"port-logistics",monthlyGrossMinor:390000,payDay:1},housing:{arrangement:"renting",propertyId:null,bedrooms:2,monthlyRentMinor:125000,securityDepositPaid:true},cashMinor:300000,liabilities:[{id:"family-loan",type:"personal-loan",balanceMinor:260000,monthlyPaymentMinor:24000,creditor:"Meridian Mutual"}],monthlyCosts:{utilities:22000,food:85000,transport:28000,healthcare:18000,communications:7000,childcare:22000},startDate:"2026-01-01"},
"career-transition": {id:"career-transition",name:"The Career Transition",description:"A recently displaced worker is between jobs, shares a small rental and must stretch limited savings while servicing debt.",player:{id:"player-1",name:"Casey North",age:27,traits:["resourceful","resilient"]},household:{id:"household-1",name:"North Household",members:[{id:"player-1",role:"player",relationship:"self",age:27,financiallyDependent:false},{id:"roommate-1",role:"roommate",relationship:"roommate",age:26,financiallyDependent:false}]},employment:{status:"unemployed",employerId:null,role:null,industry:null,monthlyGrossMinor:0,payDay:1},housing:{arrangement:"shared-rental",propertyId:null,bedrooms:2,monthlyRentMinor:48000,securityDepositPaid:true,playerRentShareMinor:24000},cashMinor:55000,liabilities:[{id:"education-loan",type:"education-loan",balanceMinor:180000,monthlyPaymentMinor:9000,creditor:"Aurel Learning Fund"}],monthlyCosts:{utilities:6000,food:26000,transport:9000,healthcare:5000,communications:3000},startDate:"2026-01-01"}
};
function validateScenario(s) {
 if(!s||typeof s!=="object")throw new TypeError("A starting scenario is required.");
 for(const [label,value] of [["starting cash",s.cashMinor],["monthly salary",s.employment?.monthlyGrossMinor],["rent",s.housing?.monthlyRentMinor]])if(!Number.isSafeInteger(value)||value<0)throw new RangeError(label+" must be a non-negative integer in minor units.");
 if(!["employed","unemployed"].includes(s.employment.status))throw new RangeError("Unsupported employment status.");
 if(s.employment.status==="unemployed"&&s.employment.monthlyGrossMinor!==0)throw new RangeError("An unemployed scenario cannot have salary income.");
 if(!["renting","shared-rental","owned","family-home"].includes(s.housing.arrangement))throw new RangeError("Unsupported housing arrangement.");
 if(!Array.isArray(s.household?.members)||!s.household.members.length)throw new TypeError("A household must have at least one member.");
 if(!Array.isArray(s.liabilities)||!s.monthlyCosts)throw new TypeError("Scenario liabilities and monthly costs are required.");
 for(const item of s.liabilities)for(const key of ["balanceMinor","monthlyPaymentMinor"])if(!Number.isSafeInteger(item[key])||item[key]<0)throw new RangeError("Liability values must be non-negative integer minor units.");
 for(const value of Object.values(s.monthlyCosts))if(!Number.isSafeInteger(value)||value<0)throw new RangeError("Monthly costs must be non-negative integer minor units.");
 return true;
}
export function listStartingScenarios(){return Object.values(SCENARIOS).map(({id,name,description,employment,household,housing})=>({id,name,description,employmentStatus:employment.status,householdSize:household.members.length,housingArrangement:housing.arrangement}));}
export function getStartingScenario(id="meridian-newcomer"){if(!SCENARIOS[id])throw new RangeError("Unknown starting scenario: "+id);return clone(SCENARIOS[id]);}
export function createPlayerStart({saveId,scenarioId="meridian-newcomer",seed=1,startDate}={}) {
 const s=getStartingScenario(scenarioId);if(startDate)s.startDate=startDate;validateScenario(s);
 const state=createInitialGameState({saveId,seed,startDate:s.startDate}),ledger=new Ledger();
 const accounts=[["cash","Cash on hand","asset"],["personal-assets","Personal assets","asset"],["personal-debt","Personal liabilities","liability"],["opening-equity","Opening net worth","equity"],["salary-income","Employment income","income"],["rent-expense","Housing expense","expense"],["utilities-expense","Utilities expense","expense"],["food-expense","Food expense","expense"],["transport-expense","Transport expense","expense"],["healthcare-expense","Healthcare expense","expense"],["communications-expense","Communications expense","expense"],["childcare-expense","Childcare expense","expense"]];
 for(const [id,name,type] of accounts)ledger.createAccount({id,name,type});
 const debt=s.liabilities.reduce((sum,item)=>sum+item.balanceMinor,0),equity=s.cashMinor-debt;
 const entries=[{accountId:"cash",side:"debit",amountMinor:s.cashMinor}];
 if(debt)entries.push({accountId:"personal-debt",side:"credit",amountMinor:debt});
 if(equity>0)entries.push({accountId:"opening-equity",side:"credit",amountMinor:equity});
 if(equity<0)entries.push({accountId:"opening-equity",side:"debit",amountMinor:-equity});
 ledger.postTransaction({id:"opening-position",date:s.startDate,description:"Opening player financial position",entries});
 state.player={...clone(s.player),householdId:s.household.id,employmentStatus:s.employment.status,housingArrangement:s.housing.arrangement};
 state.households[s.household.id]={...clone(s.household),monthlyCosts:clone(s.monthlyCosts),housing:clone(s.housing),liabilities:clone(s.liabilities)};
 state.systems.employment={playerEmployment:clone(s.employment)};
 state.systems.household={monthlyCosts:clone(s.monthlyCosts),housing:clone(s.housing),liabilities:clone(s.liabilities),lastSettledMonth:null};
 state.ledger=ledger.toJSON();state.startingScenario={id:s.id,name:s.name};return state;
}
export function getPlayerFinancialSnapshot(state){
 if(!state?.ledger||!state.player)throw new TypeError("A player-start state is required.");
 const ledger=Ledger.fromJSON(state.ledger),cash=ledger.getBalance("cash").minorUnits,liabilities=ledger.getBalance("personal-debt").minorUnits,assets=cash+ledger.getBalance("personal-assets").minorUnits,household=state.households[state.player.householdId],employment=state.systems.employment.playerEmployment,costs=household.monthlyCosts;
 const recurringCosts=Object.values(costs).reduce((a,b)=>a+b,0)+(household.housing.playerRentShareMinor??household.housing.monthlyRentMinor)+household.liabilities.reduce((a,item)=>a+item.monthlyPaymentMinor,0);
 return {currency:"LU",cashMinor:cash,assetsMinor:assets,liabilitiesMinor:liabilities,netWorthMinor:assets-liabilities,monthlyGrossIncomeMinor:employment.monthlyGrossMinor,monthlyRecurringOutflowMinor:recurringCosts,monthlySurplusMinor:employment.monthlyGrossMinor-recurringCosts,employmentStatus:employment.status,householdSize:household.members.length,housingArrangement:household.housing.arrangement};
}
