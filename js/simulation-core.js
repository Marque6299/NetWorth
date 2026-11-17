import { createOpeningFinance, validateFinance, validateFinanceAction, applyFinanceAction } from "./finance.js";
import { createCareerState, validateCareer, validateCareerAction, applyCareerAction, advanceCareer } from "./career.js";
import { createBankingState, validateBanking, validateBankingAction, applyBankingAction, advanceBanking } from "./banking.js";
import { createMarketState, validateMarkets, validateMarketAction, applyMarketAction, advanceMarkets } from "./markets.js";
import { createAssetState, validateAssets, validateAssetAction, applyAssetAction, advanceAssets } from "./assets.js";
import { createBusinessState, validateBusinesses, validateBusinessAction, applyBusinessAction, advanceBusinesses } from "./businesses.js";
export const SAVE_SCHEMA_VERSION = 8;
export const SIMULATION_VERSION = "0.9.0";
export const DAYS_PER_TURN = 7;
export const WEEKLY_TIME_BUDGET = 112;
export const SKILL_KEYS = ["financialLiteracy","negotiation","management","sales","technical","research","leadership","networking","operations"];
export const TIME_KEYS = ["work","study","rest","family","networking","research","sideWork","recreation"];
export const DEFAULT_TIME_ALLOCATION = Object.freeze({work:40,study:10,rest:14,family:10,networking:6,research:6,sideWork:10,recreation:16,studyFocus:"financialLiteracy"});
export const STARTING_PROFILES = Object.freeze([
 {id:"early-career",name:"Early-Career Graduate",tagline:"Education and potential, with limited capital.",education:"Bachelor's degree",experienceYears:1,employment:"Entry-level employee",startingCapital:1800,startingDebt:12000,monthlyExpenseContext:1400,dependents:0,health:82,energy:84,stress:26,happiness:74,reputation:18,contacts:2,skills:{financialLiteracy:38,negotiation:24,management:18,sales:22,technical:52,research:42,leadership:20,networking:25,operations:28}},
 {id:"career-switcher",name:"Career Switcher",tagline:"Transferable experience and a new direction.",education:"Vocational / professional qualification",experienceYears:6,employment:"Employed; exploring a transition",startingCapital:6500,startingDebt:4000,monthlyExpenseContext:1900,dependents:1,health:77,energy:76,stress:36,happiness:69,reputation:42,contacts:8,skills:{financialLiteracy:46,negotiation:48,management:42,sales:38,technical:48,research:34,leadership:40,networking:39,operations:56}},
 {id:"family-provider",name:"Family Provider",tagline:"Established responsibilities and a household to support.",education:"High school / secondary education",experienceYears:9,employment:"Full-time employee",startingCapital:3200,startingDebt:9000,monthlyExpenseContext:2600,dependents:3,health:72,energy:68,stress:49,happiness:73,reputation:38,contacts:6,skills:{financialLiteracy:34,negotiation:38,management:44,sales:36,technical:30,research:28,leadership:45,networking:34,operations:50}},
 {id:"independent",name:"Independent Specialist",tagline:"More autonomy, variable work and self-managed risk.",education:"Some college / specialist training",experienceYears:5,employment:"Independent freelancer",startingCapital:8000,startingDebt:2500,monthlyExpenseContext:1800,dependents:0,health:81,energy:79,stress:43,happiness:78,reputation:35,contacts:10,skills:{financialLiteracy:50,negotiation:52,management:36,sales:58,technical:62,research:48,leadership:32,networking:54,operations:44}}
]);
const WELLBEING_KEYS=["health","energy","stress","happiness"];
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,value));
const isIsoDate=value=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))&&new Date(`${value}T00:00:00.000Z`).toISOString().slice(0,10)===value;
const clone=value=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));
export function normalizeSeed(seed){if(typeof seed==="number"&&Number.isFinite(seed))return seed>>>0;const input=String(seed??"networth");let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return hash>>>0;}
export function createGameState({seed="networth",startDate="2026-01-05"}={}){
 if(!isIsoDate(startDate))throw new Error("Start date must be a valid YYYY-MM-DD date.");
 const normalizedSeed=normalizeSeed(seed),now=new Date().toISOString();
 return {schemaVersion:SAVE_SCHEMA_VERSION,simulationVersion:SIMULATION_VERSION,meta:{gameId:`nw-${normalizedSeed.toString(16).padStart(8,"0")}`,seed:normalizedSeed,createdAt:now,updatedAt:now},calendar:{currentDate:startDate,turn:0,daysPerTurn:DAYS_PER_TURN},rng:{state:normalizedSeed},life:{character:null,timeAllocation:null,goals:[]},finance:null,career:null,banking:null,markets:null,assets:null,businesses:null,eventLog:[{id:"system-0",turn:0,date:startDate,type:"GAME_CREATED",summary:"A new Networth simulation was created.",details:{seed:normalizedSeed}}],actionCount:0};
}
export function drawRandom(rng,maxExclusive){if(!rng||!Number.isInteger(rng.state)||!Number.isInteger(maxExclusive)||maxExclusive<1)throw new Error("A valid RNG state and positive integer range are required.");let value=(rng.state+0x6D2B79F5)>>>0;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return {value:Math.floor(((t^(t>>>14))>>>0)/4294967296*maxExclusive),rng:{state:value}};}
function appendEvent(state,type,summary,details={}){const id=state.actionCount+1;state.actionCount=id;state.eventLog.push({id:`action-${id}`,turn:state.calendar.turn,date:state.calendar.currentDate,type,summary,details});}
function validName(value){return typeof value==="string"&&value.trim().length>=2&&value.trim().length<=40&&!/[<>]/.test(value);}
function validateAllocation(allocation){
 if(!allocation||typeof allocation!=="object")return {valid:false,reason:"Time allocation is missing."};
 for(const key of TIME_KEYS)if(!Number.isInteger(allocation[key])||allocation[key]<0||allocation[key]>WEEKLY_TIME_BUDGET)return {valid:false,reason:`Enter a whole number of hours between 0 and ${WEEKLY_TIME_BUDGET} for ${key}.`};
 const total=TIME_KEYS.reduce((sum,key)=>sum+allocation[key],0);
 if(total>WEEKLY_TIME_BUDGET)return {valid:false,reason:`Your weekly allocation is ${total} hours; the limit is ${WEEKLY_TIME_BUDGET}.`};
 if(!SKILL_KEYS.includes(allocation.studyFocus))return {valid:false,reason:"Choose a valid skill focus for study time."};
 return {valid:true,total,unallocated:WEEKLY_TIME_BUDGET-total};
}
function validateGoal(goal){
 if(!goal||typeof goal!=="object"||!validName(goal.title))return {valid:false,reason:"Enter a goal title between 2 and 40 characters."};
 if(typeof goal.metric!=="string")return {valid:false,reason:"Choose a goal metric."};
 const [kind,key]=goal.metric.split(":");
 if(kind==="skill"&&SKILL_KEYS.includes(key)&&Number.isFinite(goal.target)&&goal.target>=1&&goal.target<=100)return {valid:true,kind,key};
 if(kind==="wellbeing"&&WELLBEING_KEYS.includes(key)&&Number.isFinite(goal.target)&&goal.target>=1&&goal.target<=100)return {valid:true,kind,key};
 if(kind==="turns"&&key==="turn"&&Number.isInteger(goal.target)&&goal.target>=1&&goal.target<=500)return {valid:true,kind,key};
 return {valid:false,reason:"The selected goal metric or target is invalid."};
}
export function validateAction(state,action){
 if(!state||typeof state!=="object")return {valid:false,reason:"No active game is loaded."};
 if(!action||typeof action!=="object"||typeof action.type!=="string")return {valid:false,reason:"Action must include a type."};
 if(action.type==="ADVANCE_TURN"){
  if(!Number.isInteger(state.calendar?.turn)||!isIsoDate(state.calendar?.currentDate)||state.calendar.daysPerTurn!==DAYS_PER_TURN)return {valid:false,reason:"The game calendar is invalid."};
  return {valid:true};
 }
 if(action.type==="CREATE_CHARACTER"){
  if(state.life?.character)return {valid:false,reason:"This save already has a character."};
  if(!validName(action.name))return {valid:false,reason:"Character name must be between 2 and 40 characters."};
  if(!Number.isInteger(action.age)||action.age<18||action.age>80)return {valid:false,reason:"Character age must be between 18 and 80."};
  if(!STARTING_PROFILES.some(profile=>profile.id===action.profileId))return {valid:false,reason:"Choose a valid starting profile."};
  return {valid:true};
 }
 if(action.type==="SET_TIME_ALLOCATION"){
  if(!state.life?.character)return {valid:false,reason:"Create a character before planning your time."};
  return validateAllocation(action.allocation);
 }
 if(action.type.startsWith("RECORD_")||["TRANSFER_FUNDS","BORROW_MONEY","REPAY_DEBT","SET_BUDGET"].includes(action.type))return validateFinanceAction(state.finance,action);
 if(["OPEN_BANK_ACCOUNT","CREATE_FIXED_DEPOSIT","WITHDRAW_BANK_FUNDS","APPLY_FOR_LOAN","PAY_LOAN_INSTALLMENT","APPLY_FOR_CREDIT_CARD","USE_CREDIT_CARD","PAY_CREDIT_CARD"].includes(action.type))return validateBankingAction(state.banking,state.finance,state.life?.character,state.career,action,state.calendar.turn);
 if(["MARKET_BUY","MARKET_SELL","MARKET_WATCHLIST"].includes(action.type))return validateMarketAction(state.markets,state.finance,action);
  if(["ASSET_BUY_PROPERTY","ASSET_SELL_PROPERTY","ASSET_SET_PROPERTY_USE","ASSET_MAINTAIN_PROPERTY","ASSET_BUY_COLLECTIBLE","ASSET_SELL_COLLECTIBLE","ASSET_MAINTAIN_COLLECTIBLE"].includes(action.type))return validateAssetAction(state.assets,state.finance,state.banking,state.career,action);
 if(["BUSINESS_ACCEPT_MANDATE","BUSINESS_SET_PRICE","BUSINESS_SET_STAFFING","BUSINESS_ORDER_INVENTORY","BUSINESS_MARKETING_CAMPAIGN","BUSINESS_END_MANDATE"].includes(action.type))return validateBusinessAction(state.businesses,state.life?.character,action);
 if(["APPLY_FOR_JOB","ACCEPT_JOB_OFFER","RESIGN_FROM_JOB","ENROLL_COURSE"].includes(action.type))return validateCareerAction(state.career,state.life?.character,state.finance,action,state.calendar.turn);
 if(action.type==="ADD_GOAL"){
  if(!state.life?.character)return {valid:false,reason:"Create a character before adding goals."};
  const result=validateGoal(action.goal);return result.valid?result:{valid:false,reason:result.reason};
 }
 return {valid:false,reason:`Unknown action type: ${action.type}`};
}
function addDays(isoDate,days){const date=new Date(`${isoDate}T00:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);}
function progressLife(state){
 const character=state.life.character;if(!character)return;
 const allocation=state.life.timeAllocation??DEFAULT_TIME_ALLOCATION,stats=character.wellbeing;
 const workload=allocation.work+allocation.study+allocation.sideWork;
 stats.energy=clamp(stats.energy+Math.round((allocation.rest-14)*0.7+(allocation.recreation-8)*0.25-Math.max(0,workload-55)*0.45));
 stats.stress=clamp(stats.stress+Math.round((workload-55)*0.3-(allocation.rest-10)*0.35-allocation.recreation*0.1));
 stats.health=clamp(stats.health+Math.round((allocation.rest-12)*0.12+(allocation.recreation-8)*0.1-Math.max(0,stats.stress-60)*0.08));
 stats.happiness=clamp(stats.happiness+Math.round((allocation.family-6)*0.25+(allocation.recreation-8)*0.2-Math.max(0,stats.stress-60)*0.12));
 const skills=character.skills;
 skills[allocation.studyFocus]=clamp(skills[allocation.studyFocus]+allocation.study*0.3,0,100);
 skills.research=clamp(skills.research+allocation.research*0.3,0,100);
 skills.financialLiteracy=clamp(skills.financialLiteracy+allocation.research*0.1,0,100);
 skills.networking=clamp(skills.networking+allocation.networking*0.3,0,100);
 skills.negotiation=clamp(skills.negotiation+allocation.networking*0.1,0,100);
 skills.operations=clamp(skills.operations+allocation.sideWork*0.2,0,100);
 skills.sales=clamp(skills.sales+allocation.sideWork*0.1,0,100);
 for(const goal of state.life.goals){if(goal.status==="completed")continue;let current=0;if(goal.metric.startsWith("skill:"))current=skills[goal.metric.split(":")[1]];else if(goal.metric.startsWith("wellbeing:"))current=stats[goal.metric.split(":")[1]];else current=state.calendar.turn;if(goal.metric==="wellbeing:stress"?current<=goal.target:current>=goal.target){goal.status="completed";goal.completedAtTurn=state.calendar.turn;state.eventLog.push({id:`goal-${goal.id}-completed`,turn:state.calendar.turn,date:state.calendar.currentDate,type:"GOAL_COMPLETED",summary:`Goal completed: ${goal.title}`,details:{goalId:goal.id,metric:goal.metric,target:goal.target}});}}
}
export function resolveAction(state,action){
 const validation=validateAction(state,action);if(!validation.valid)return {ok:false,reason:validation.reason,state};
 const next=clone(state);
 if(action.type==="ADVANCE_TURN"){
  const previousDate=next.calendar.currentDate;next.calendar.turn+=1;next.calendar.currentDate=addDays(previousDate,next.calendar.daysPerTurn);next.actionCount+=1;
  const previousMonth=previousDate.slice(0,7),currentMonth=next.calendar.currentDate.slice(0,7);
  if(previousMonth!==currentMonth)next.eventLog.push({id:`month-${currentMonth}-turn-${next.calendar.turn}`,turn:next.calendar.turn,date:next.calendar.currentDate,type:"MONTH_BOUNDARY",summary:`A new in-game month began (${currentMonth}).`,details:{previousMonth,currentMonth}});
  progressLife(next);advanceCareer(next);if(next.assets){const assetResult=advanceAssets(next.assets,next.finance,{date:next.calendar.currentDate,turn:next.calendar.turn,regime:next.markets?.regime});next.assets=assetResult.assets;next.finance=assetResult.finance;for(const event of assetResult.events)next.eventLog.push({id:"asset-event-"+next.calendar.turn+"-"+event.type+"-"+next.eventLog.length,turn:next.calendar.turn,date:next.calendar.currentDate,type:event.type,summary:event.summary,details:event.details});}advanceBanking(next);if(next.markets){const marketResult=advanceMarkets(next.markets,next.finance,{date:next.calendar.currentDate,turn:next.calendar.turn,sequence:next.actionCount});next.markets=marketResult.markets;next.finance=marketResult.finance;for(const event of marketResult.events)next.eventLog.push({id:"market-event-"+next.calendar.turn+"-"+event.type,turn:next.calendar.turn,date:next.calendar.currentDate,type:event.type,summary:event.summary,details:event.details});}if(next.businesses){const businessResult=advanceBusinesses(next.businesses,next.finance,{date:next.calendar.currentDate,turn:next.calendar.turn,character:next.life.character,timeAllocation:next.life.timeAllocation,marketRegime:next.markets?.regime});next.businesses=businessResult.businesses;next.finance=businessResult.finance;for(const event of businessResult.events)next.eventLog.push({id:"business-event-"+next.calendar.turn+"-"+event.type+"-"+next.eventLog.length,turn:next.calendar.turn,date:next.calendar.currentDate,type:event.type,summary:event.summary,details:event.details});}next.eventLog.push({id:`turn-${next.calendar.turn}-advance`,turn:next.calendar.turn,date:next.calendar.currentDate,type:"TURN_ADVANCED",summary:`Turn ${next.calendar.turn} began.`,details:{previousDate,currentDate:next.calendar.currentDate,daysElapsed:next.calendar.daysPerTurn}});
 }else if(action.type==="CREATE_CHARACTER"){
  const profile=STARTING_PROFILES.find(item=>item.id===action.profileId);
  next.life.character={id:`character-${next.meta.seed.toString(16)}`,name:action.name.trim(),age:action.age,profileId:profile.id,profileName:profile.name,education:profile.education,experienceYears:profile.experienceYears,employment:profile.employment,startingContext:{capital:profile.startingCapital,debt:profile.startingDebt,monthlyExpense:profile.monthlyExpenseContext,dependents:profile.dependents},skills:clone(profile.skills),wellbeing:{health:profile.health,energy:profile.energy,stress:profile.stress,happiness:profile.happiness},reputation:profile.reputation,contacts:profile.contacts,createdAtTurn:next.calendar.turn};
  next.life.timeAllocation=clone(DEFAULT_TIME_ALLOCATION);
  next.finance=createOpeningFinance(next.life.character.startingContext,next.calendar.currentDate,next.calendar.turn);
  next.career=createCareerState(next.life.character);next.banking=createBankingState(next.life.character);next.markets=createMarketState(next.meta.seed);next.assets=createAssetState(next.meta.seed);next.businesses=createBusinessState(next.meta.seed);
  appendEvent(next,"CHARACTER_CREATED",`${action.name.trim()} began as a ${profile.name.toLowerCase()}.`,{profileId:profile.id,age:action.age});
 }else if(action.type==="SET_TIME_ALLOCATION"){
  next.life.timeAllocation={...Object.fromEntries(TIME_KEYS.map(key=>[key,action.allocation[key]])),studyFocus:action.allocation.studyFocus};
  appendEvent(next,"TIME_ALLOCATED","Weekly time allocation was updated.",{...next.life.timeAllocation,totalHours:TIME_KEYS.reduce((sum,key)=>sum+next.life.timeAllocation[key],0)});
 }else if(action.type==="ADD_GOAL"){
  const goal={id:`goal-${next.actionCount+1}`,title:action.goal.title.trim(),metric:action.goal.metric,target:action.goal.target,status:"active",createdAtTurn:next.calendar.turn};
  next.life.goals.push(goal);appendEvent(next,"GOAL_ADDED",`New goal added: ${goal.title}`,{goalId:goal.id,metric:goal.metric,target:goal.target});
 }else if(action.type.startsWith("RECORD_")||["TRANSFER_FUNDS","BORROW_MONEY","REPAY_DEBT","SET_BUDGET"].includes(action.type)){
  next.finance=applyFinanceAction(next.finance,action,{date:next.calendar.currentDate,turn:next.calendar.turn,sequence:next.actionCount+1});
  appendEvent(next,action.type,action.description||action.type.replaceAll("_"," ").toLowerCase(),{amountMinor:action.amountMinor??null,category:action.category??null});
 }else if(["OPEN_BANK_ACCOUNT","CREATE_FIXED_DEPOSIT","WITHDRAW_BANK_FUNDS","APPLY_FOR_LOAN","PAY_LOAN_INSTALLMENT","APPLY_FOR_CREDIT_CARD","USE_CREDIT_CARD","PAY_CREDIT_CARD"].includes(action.type)){
  const result=applyBankingAction(next.banking,next.finance,action,{date:next.calendar.currentDate,turn:next.calendar.turn,sequence:next.actionCount+1});next.banking=result.banking;next.finance=result.finance;appendEvent(next,action.type,action.type.replaceAll("_"," ").toLowerCase(),{amountMinor:action.amountMinor??action.limitMinor??null,bankId:action.bankId??null});
 }else if(["MARKET_BUY","MARKET_SELL","MARKET_WATCHLIST"].includes(action.type)){
  const result=applyMarketAction(next.markets,next.finance,action,{date:next.calendar.currentDate,turn:next.calendar.turn,sequence:next.actionCount+1});next.markets=result.markets;next.finance=result.finance;appendEvent(next,action.type,action.type==="MARKET_WATCHLIST"?"Market watchlist updated.":action.type==="MARKET_BUY"?"Market purchase executed.":"Market sale executed.",{securityId:action.securityId,quantityUnits:action.quantityUnits??null});
 }else if(["ASSET_BUY_PROPERTY","ASSET_SELL_PROPERTY","ASSET_SET_PROPERTY_USE","ASSET_MAINTAIN_PROPERTY","ASSET_BUY_COLLECTIBLE","ASSET_SELL_COLLECTIBLE","ASSET_MAINTAIN_COLLECTIBLE"].includes(action.type)){
   const result=applyAssetAction(next.assets,next.finance,next.banking,action,{date:next.calendar.currentDate,turn:next.calendar.turn,sequence:next.actionCount+1});next.assets=result.assets;next.finance=result.finance;next.banking=result.banking;appendEvent(next,action.type,action.type.replaceAll("_"," ").toLowerCase(),{propertyId:action.propertyId??null,collectibleId:action.collectibleId??null,listingId:action.listingId??null,catalogId:action.catalogId??null});
  }else if(["BUSINESS_ACCEPT_MANDATE","BUSINESS_SET_PRICE","BUSINESS_SET_STAFFING","BUSINESS_ORDER_INVENTORY","BUSINESS_MARKETING_CAMPAIGN","BUSINESS_END_MANDATE"].includes(action.type)){
  const result=applyBusinessAction(next.businesses,next.finance,next.life.character,action,{date:next.calendar.currentDate,turn:next.calendar.turn,sequence:next.actionCount+1});next.businesses=result.businesses;next.finance=result.finance;appendEvent(next,result.event.type,result.event.summary,result.event.details);
 }else if(["APPLY_FOR_JOB","ACCEPT_JOB_OFFER","RESIGN_FROM_JOB","ENROLL_COURSE"].includes(action.type)){
  let roll=0;if(action.type==="APPLY_FOR_JOB"){const draw=drawRandom(next.rng,100);roll=draw.value;next.rng=draw.rng;}
  const result=applyCareerAction(next.career,next.life.character,next.finance,action,{turn:next.calendar.turn,roll,date:next.calendar.currentDate,sequence:next.actionCount+1});
  next.career=result.career;if(result.finance)next.finance=result.finance;
  appendEvent(next,result.event.type,result.event.summary,result.event.details);
 }
 return {ok:true,state:next,event:next.eventLog[next.eventLog.length-1]};
}
export function migrateGameState(input){
 const state=clone(input);
 if(state.schemaVersion===1){state.life={character:null,timeAllocation:null,goals:[]};state.schemaVersion=2;}
 if(state.schemaVersion===2){state.finance=state.life?.character?createOpeningFinance(state.life.character.startingContext,state.calendar.currentDate,state.calendar.turn):null;state.schemaVersion=3;}
 if(state.schemaVersion===3){state.career=state.life?.character?createCareerState(state.life.character):null;state.schemaVersion=4;}
 if(state.schemaVersion===4){state.banking=state.life?.character?createBankingState(state.life.character):null;state.schemaVersion=5;}
 if(state.schemaVersion===5){state.markets=state.life?.character?createMarketState(state.meta.seed):null;state.schemaVersion=6;}
 if(state.schemaVersion===6){state.assets=state.life?.character?createAssetState(state.meta.seed):null;state.schemaVersion=7;}
 if(state.schemaVersion===7){state.businesses=state.life?.character?createBusinessState(state.meta.seed):null;state.schemaVersion=8;state.simulationVersion=SIMULATION_VERSION;}
 if(state.schemaVersion!==SAVE_SCHEMA_VERSION)throw new Error(`Unsupported save schema version: ${state.schemaVersion}`);
 return state;
}
export function validateGameState(state){
 const errors=[];if(!state||typeof state!=="object")return {valid:false,errors:["Save data must be an object."]};
 if(state.schemaVersion!==SAVE_SCHEMA_VERSION)errors.push(`Unsupported save schema version: ${state.schemaVersion}`);
 if(!state.meta||!Number.isInteger(state.meta.seed))errors.push("Save metadata or seed is missing.");
 if(!state.calendar||!isIsoDate(state.calendar.currentDate)||!Number.isInteger(state.calendar.turn)||state.calendar.turn<0||state.calendar.daysPerTurn!==DAYS_PER_TURN)errors.push("Calendar data is invalid.");
 if(!state.rng||!Number.isInteger(state.rng.state))errors.push("Random generator state is invalid.");
 if(!Array.isArray(state.eventLog))errors.push("Event log is invalid.");
 if(!Number.isInteger(state.actionCount)||state.actionCount<0)errors.push("Action count is invalid.");
 if(!state.life||!Array.isArray(state.life.goals))errors.push("Character and life data is invalid.");
 if(state.life?.character){const c=state.life.character;if(!validName(c.name)||!Number.isInteger(c.age)||!c.skills||!c.wellbeing||!c.startingContext)errors.push("Character profile is invalid.");else{for(const key of SKILL_KEYS)if(!Number.isFinite(c.skills[key])||c.skills[key]<0||c.skills[key]>100)errors.push(`Character skill ${key} is invalid.`);for(const key of WELLBEING_KEYS)if(!Number.isFinite(c.wellbeing[key])||c.wellbeing[key]<0||c.wellbeing[key]>100)errors.push(`Character well-being ${key} is invalid.`);}if(!state.life.timeAllocation||!validateAllocation(state.life.timeAllocation).valid)errors.push("Character time allocation is invalid.");}
 for(const goal of state.life?.goals??[]){if(!validateGoal(goal).valid||!["active","completed"].includes(goal.status))errors.push("A character goal is invalid.");}
 if(state.life?.character){const financeCheck=validateFinance(state.finance);if(!financeCheck.valid)errors.push(...financeCheck.errors);const careerCheck=validateCareer(state.career);if(!careerCheck.valid)errors.push(...careerCheck.errors);const bankingCheck=validateBanking(state.banking,state.finance);if(!bankingCheck.valid)errors.push(...bankingCheck.errors);const marketCheck=validateMarkets(state.markets,state.finance);if(!marketCheck.valid)errors.push(...marketCheck.errors);const assetCheck=validateAssets(state.assets,state.finance,state.banking);if(!assetCheck.valid)errors.push(...assetCheck.errors);const businessCheck=validateBusinesses(state.businesses,state.finance);if(!businessCheck.valid)errors.push(...businessCheck.errors);}else if(state.finance!==null||state.career!==null||state.banking!==null||state.markets!==null||state.assets!==null||state.businesses!==null)errors.push("Finance, career, banking and markets must remain uninitialized until a character is created.");
 return {valid:errors.length===0,errors};
}
export function stableStringify(value){if(value===null||typeof value!=="object")return JSON.stringify(value);if(Array.isArray(value))return `[${value.map(stableStringify).join(",")}]`;return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;}
export function checksum(value){const input=stableStringify(value);let hash=2166136261;for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,"0");}
