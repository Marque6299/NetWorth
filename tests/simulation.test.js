import test from "node:test";
import assert from "node:assert/strict";
import { createMoney, parseMoney, addMoney, formatMoney } from "../js/simulation/money.js";
import { Ledger } from "../js/simulation/ledger.js";
import { createInitialGameState } from "../js/simulation/state.js";
import { createSimulationClock } from "../js/simulation/clock.js";
import { nextRandomUint32, nextRandomFloat, nextRandomInt, pickRandom } from "../js/simulation/random.js";
import { createSimulationEngine } from "../js/simulation/engine.js";
import { serializeGameState, deserializeGameState, migrateGameState } from "../js/simulation/persistence.js";

function basicLedger(){
 const ledger=new Ledger();
 ledger.createAccount({id:"cash",name:"Cash",type:"asset"});
 ledger.createAccount({id:"receivable",name:"Accounts Receivable",type:"asset"});
 ledger.createAccount({id:"inventory",name:"Inventory",type:"asset"});
 ledger.createAccount({id:"loan",name:"Loan Payable",type:"liability"});
 ledger.createAccount({id:"capital",name:"Owner Capital",type:"equity"});
 ledger.createAccount({id:"sales",name:"Sales Revenue",type:"income"});
 ledger.createAccount({id:"rent",name:"Rent Expense",type:"expense"});
 return ledger;
}

test("money uses integer minor units and rejects excess precision and overflow",()=>{
 assert.deepEqual(parseMoney("125.40"),{minorUnits:12540,currency:"LU"});
 assert.equal(formatMoney(addMoney(parseMoney("1.10"),parseMoney("2.25"))),"LU 3.35");
 assert.throws(()=>parseMoney("1.234"),RangeError);
 assert.throws(()=>parseMoney("90071992547409.92"),RangeError);
 assert.throws(()=>addMoney(createMoney(Number.MAX_SAFE_INTEGER),createMoney(1)),RangeError);
 assert.throws(()=>addMoney(createMoney(100,"LU"),createMoney(100,"USD")),RangeError);
});

test("ledger posts balanced opening capital and calculates normal balances",()=>{
 const ledger=basicLedger();
 ledger.postTransaction({id:"opening",date:"2026-01-01",description:"Opening capital",entries:[
  {accountId:"cash",side:"debit",amountMinor:100000},
  {accountId:"capital",side:"credit",amountMinor:100000}
 ]});
 assert.equal(ledger.getBalance("cash").minorUnits,100000);
 assert.equal(ledger.getBalance("capital").minorUnits,100000);
 assert.equal(ledger.getTransactions().length,1);
 assert.equal(ledger.getTrialBalance().balanced,true);
});

test("transfer, purchase, income, expense and debt lifecycle reconcile",()=>{
 const ledger=basicLedger();
 ledger.postTransaction({id:"funding",date:"2026-01-01",description:"Owner funding",entries:[
  {accountId:"cash",side:"debit",amountMinor:500000},
  {accountId:"capital",side:"credit",amountMinor:500000}
 ]});
 ledger.postTransaction({id:"loan-draw",date:"2026-01-02",description:"Loan proceeds",entries:[
  {accountId:"cash",side:"debit",amountMinor:200000},
  {accountId:"loan",side:"credit",amountMinor:200000}
 ]});
 ledger.postTransaction({id:"purchase-inventory",date:"2026-01-03",description:"Inventory purchase",entries:[
  {accountId:"inventory",side:"debit",amountMinor:75000},
  {accountId:"cash",side:"credit",amountMinor:75000}
 ]});
 ledger.postTransaction({id:"sale-on-credit",date:"2026-01-04",description:"Sale on credit",entries:[
  {accountId:"receivable",side:"debit",amountMinor:120000},
  {accountId:"sales",side:"credit",amountMinor:120000}
 ]});
 ledger.postTransaction({id:"rent-paid",date:"2026-01-05",description:"Rent payment",entries:[
  {accountId:"rent",side:"debit",amountMinor:25000},
  {accountId:"cash",side:"credit",amountMinor:25000}
 ]});
 ledger.postTransaction({id:"customer-payment",date:"2026-01-06",description:"Customer paid",entries:[
  {accountId:"cash",side:"debit",amountMinor:50000},
  {accountId:"receivable",side:"credit",amountMinor:50000}
 ]});
 ledger.postTransaction({id:"loan-repayment",date:"2026-01-07",description:"Principal repayment",entries:[
  {accountId:"loan",side:"debit",amountMinor:30000},
  {accountId:"cash",side:"credit",amountMinor:30000}
 ]});
 assert.equal(ledger.getBalance("cash").minorUnits,620000);
 assert.equal(ledger.getBalance("inventory").minorUnits,75000);
 assert.equal(ledger.getBalance("receivable").minorUnits,70000);
 assert.equal(ledger.getBalance("loan").minorUnits,170000);
 assert.equal(ledger.getBalance("sales").minorUnits,120000);
 assert.equal(ledger.getBalance("rent").minorUnits,25000);
 assert.equal(ledger.getTrialBalance().balanced,true);
});

test("ledger rejects invalid transactions atomically",()=>{
 const ledger=basicLedger();
 assert.throws(()=>ledger.postTransaction({id:"bad",date:"2026-01-01",description:"Unbalanced",entries:[
  {accountId:"cash",side:"debit",amountMinor:500},
  {accountId:"capital",side:"credit",amountMinor:400}
 ]}),/Unbalanced/);
 assert.equal(ledger.getTransactions().length,0);
 assert.equal(ledger.getBalance("cash").minorUnits,0);
 assert.throws(()=>ledger.postTransaction({id:"bad-date",date:"not-a-date",description:"Invalid date",entries:[]}),/date/);
});

test("account hierarchy validates parent and currency",()=>{
 const ledger=new Ledger();
 ledger.createAccount({id:"assets",name:"Assets",type:"asset"});
 ledger.createAccount({id:"cash",name:"Cash",type:"asset",parentId:"assets"});
 assert.equal(ledger.getAccount("cash").parentId,"assets");
 assert.throws(()=>ledger.createAccount({id:"foreign",name:"Foreign",type:"asset",currency:"USD",parentId:"assets"}),/same currency/);
 assert.throws(()=>ledger.createAccount({id:"orphan",name:"Orphan",type:"asset",parentId:"missing"}),/Unknown parent/);
});

test("ledger prevents duplicate ids, validates exact reversals and supports one reversal",()=>{
 const ledger=basicLedger();
 ledger.postTransaction({id:"opening",date:"2026-01-01",description:"Opening",entries:[
  {accountId:"cash",side:"debit",amountMinor:900},
  {accountId:"capital",side:"credit",amountMinor:900}
 ]});
 assert.throws(()=>ledger.postTransaction({id:"opening",date:"2026-01-01",description:"Duplicate",entries:[]}),/Duplicate/);
 assert.throws(()=>ledger.postTransaction({id:"forged-reversal",date:"2026-01-02",description:"Forged",reference:"opening",reversalOf:"opening",entries:[
  {accountId:"cash",side:"credit",amountMinor:800},
  {accountId:"capital",side:"debit",amountMinor:800}
 ]}),/exactly negate/);
 ledger.reverseTransaction("opening",{id:"reverse-opening",date:"2026-01-02"});
 assert.equal(ledger.getBalance("cash").minorUnits,0);
 assert.equal(ledger.getBalance("capital").minorUnits,0);
 assert.throws(()=>ledger.reverseTransaction("opening",{id:"reverse-again",date:"2026-01-03"}),/already reversed/);
});

test("ledger snapshot restores accounts, history and reconciled balances",()=>{
 const ledger=basicLedger();
 ledger.postTransaction({id:"opening",date:"2026-01-01",description:"Opening",entries:[
  {accountId:"cash",side:"debit",amountMinor:5000},
  {accountId:"capital",side:"credit",amountMinor:5000}
 ]});
 const restored=Ledger.fromJSON(JSON.parse(JSON.stringify(ledger.toJSON())));
 assert.equal(restored.getBalance("cash").minorUnits,5000);
 assert.equal(restored.getTransactions().length,1);
 assert.equal(restored.getTrialBalance().balanced,true);
});

test("initial save has versioned namespaces and excludes presentation state",()=>{
 const state=createInitialGameState({saveId:"save-test",seed:42});
 assert.equal(state.schemaVersion,2);
 assert.equal(state.world.activeCityId,"meridian");
 assert.deepEqual(state.ledger.transactions,[]);
 assert.equal(state.simulation.seed,42);
 assert.equal(state.simulation.eventSequence,0);
 assert.equal("ui" in state,false);
});

test("legacy v1 save state migrates to v2",()=>{
 const legacy={schemaVersion:1,saveId:"old-save",simulation:{tick:0},ledger:{},world:{}};
 const migrated=migrateGameState(legacy);
 assert.equal(migrated.schemaVersion,2);
 assert.equal(migrated.simulation.eventSequence,0);
 assert.deepEqual(migrated.world.eventQueue,[]);
});

test("save serialization round-trips and detects corruption",()=>{
 const state=createInitialGameState({saveId:"save-roundtrip",seed:123});
 const serialized=serializeGameState(state);
 const restored=deserializeGameState(serialized);
 assert.equal(restored.saveId,state.saveId);
 assert.equal(restored.schemaVersion,2);
 const corrupted=serialized.replace('"seed":123','"seed":124');
 assert.throws(()=>deserializeGameState(corrupted),/checksum mismatch/);
 assert.throws(()=>deserializeGameState("{broken"),/valid JSON/);
});

test("deterministic random draws repeat and advance explicit state",()=>{
 const initial={seed:12345,randomCallCount:0};
 const a=nextRandomUint32(initial),b=nextRandomUint32(initial);
 assert.deepEqual(a,b);
 assert.equal(a.state.randomCallCount,1);
 const f=nextRandomFloat(initial);
 assert.ok(f.value>=0&&f.value<1);
 const integer=nextRandomInt(initial,5,9);
 assert.ok(integer.value>=5&&integer.value<=9);
 const pick=pickRandom(initial,["a","b","c"]);
 assert.ok(["a","b","c"].includes(pick.value));
});

test("simulation engine orders systems and due events deterministically",()=>{
 const engine=createSimulationEngine();const log=[];
 engine.registerEventHandler("notice",(state,event)=>({...state,log:[...state.log,"event:"+event.id]}));
 engine.registerSystem({id:"markets",phase:"markets",update:state=>({...state,log:[...state.log,"markets"]})});
 engine.registerSystem({id:"world",phase:"world",update:state=>({...state,log:[...state.log,"world"]})});
 let state=createInitialGameState({saveId:"engine-test",seed:1});
 state={...state,log:[],simulation:{...state.simulation,paused:false}};
 state=engine.scheduleEvent(state,{id:"event-a",type:"notice",atTick:1,payload:{hello:true}});
 state=engine.step(state);
 assert.deepEqual(state.log,["event:event-a","world","markets"]);
 assert.equal(state.simulation.tick,1);
 assert.equal(state.world.eventQueue.length,0);
});

test("simulation engine does not advance while paused and orders queued events",()=>{
 const engine=createSimulationEngine();engine.registerEventHandler("mark",(state,event)=>({...state,marks:[...(state.marks??[]),event.id]}));
 let state=createInitialGameState({saveId:"paused-test"});
 state=engine.scheduleEvent(state,{id:"later",type:"mark",atTick:2,priority:5});
 state=engine.scheduleEvent(state,{id:"first",type:"mark",atTick:1,priority:10});
 const paused=engine.step(state);
 assert.equal(paused.simulation.tick,0);
 state={...state,simulation:{...state.simulation,paused:false}};
 state=engine.step(state);
 assert.deepEqual(state.marks,["first"]);
 state=engine.step(state);
 assert.deepEqual(state.marks,["first","later"]);
});
