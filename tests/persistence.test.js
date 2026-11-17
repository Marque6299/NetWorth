import test from "node:test";
import assert from "node:assert/strict";
import {createGameState,resolveAction,checksum,validateGameState} from "../js/simulation-core.js";
import {createExport,parseImport} from "../js/persistence.js";
test("JSON export and import preserve a valid simulation and character data",()=>{let state=createGameState({seed:"backup-test"});state=resolveAction(state,{type:"CREATE_CHARACTER",name:"Jordan Lee",age:31,profileId:"independent"}).state;state=resolveAction(state,{type:"ADVANCE_TURN"}).state;const restored=parseImport(createExport(state));assert.deepEqual(restored.calendar,state.calendar);assert.deepEqual(restored.eventLog,state.eventLog);assert.deepEqual(restored.life,state.life);assert.equal(restored.meta.seed,state.meta.seed);});
test("JSON import rejects malformed data and tampered checksums",()=>{assert.throws(()=>parseImport("not json"),/valid JSON/);const payload=JSON.parse(createExport(createGameState()));payload.state.calendar.turn=7;assert.throws(()=>parseImport(JSON.stringify(payload)),/integrity check/);});
test("Phase 2 version 1 JSON backups migrate to the current schema",()=>{const old=createGameState({seed:"legacy"});old.schemaVersion=1;old.simulationVersion="0.2.0";delete old.life;old.calendar.turn=3;const payload={format:"networth-save",schemaVersion:1,checksum:checksum(old),state:old};const restored=parseImport(JSON.stringify(payload));assert.equal(restored.schemaVersion,12);assert.equal(restored.calendar.turn,3);assert.equal(restored.life.character,null);assert.deepEqual(restored.life.goals,[]);});
test("invalid character data cannot be exported",()=>{const state=createGameState();state.life.character={name:"Broken"};assert.throws(()=>createExport(state),/invalid game state/i);});

test("Phase 3 schema v2 JSON backup migrates character finance without losing life data",()=>{let old=createGameState({seed:"phase-three"});old=resolveAction(old,{type:"CREATE_CHARACTER",name:"Morgan Lee",age:34,profileId:"independent"}).state;old.schemaVersion=2;old.simulationVersion="0.3.0";delete old.finance;const payload={format:"networth-save",schemaVersion:2,checksum:checksum(old),state:old};const restored=parseImport(JSON.stringify(payload));assert.equal(restored.schemaVersion,12);assert.equal(restored.life.character.name,"Morgan Lee");assert.equal(restored.finance.accounts.find(a=>a.id==="cash").balanceMinor,800000);assert.equal(restored.finance.accounts.find(a=>a.id==="loan").balanceMinor,250000);});

test("Phase 4 schema v3 JSON backups migrate to schema v12 and preserve finance",()=>{let old=createGameState({seed:"phase-four"});old=resolveAction(old,{type:"CREATE_CHARACTER",name:"Jordan Lee",age:31,profileId:"career-switcher"}).state;old.schemaVersion=3;old.simulationVersion="0.4.0";delete old.career;const payload={format:"networth-save",schemaVersion:3,checksum:checksum(old),state:old};const restored=parseImport(JSON.stringify(payload));assert.equal(restored.schemaVersion,12);assert.equal(restored.career.educationLevel,2);assert.deepEqual(restored.finance,old.finance);});

test("Phase 10 schema v9 JSON backups restore company ownership and migrate the company ledger",()=>{
 let old=createGameState({seed:"phase-ten-import"});
 const character=resolveAction(old,{type:"CREATE_CHARACTER",name:"Jordan Lee",age:31,profileId:"independent"});
 assert.equal(character.ok,true,character.reason);
 old=character.state;
 const founding=resolveAction(old,{type:"OWNERSHIP_FOUND_COMPANY",name:"Legacy Analytics Ltd",sector:"Technology",amountMinor:50000,shares:100000,description:"A schema migration fixture."});
 assert.equal(founding.ok,true,founding.reason);
 old=founding.state;
 old.schemaVersion=9;
 old.simulationVersion="0.10.0";
 delete old.ownership.investorAccounts;
 for(const company of old.ownership.companies){
  delete company.operations;
  delete company.operatingPayablesMinor;
  delete company.ledger;
  delete company.ledgerAccounts;
  delete company.ledgerSequence;
 }
 const payload={format:"networth-save",schemaVersion:9,checksum:checksum(old),state:old};
 const restored=parseImport(JSON.stringify(payload));
 const company=restored.ownership.companies[0];
 assert.equal(restored.schemaVersion,12);
 assert.equal(company.name,"Legacy Analytics Ltd");
 assert.equal(company.ledger.length,1);
 assert.equal(company.ledger[0].kind,"OPENING_BALANCE");
 const debits=company.ledger[0].lines.reduce((sum,line)=>sum+line.debitMinor,0);
 const credits=company.ledger[0].lines.reduce((sum,line)=>sum+line.creditMinor,0);
 assert.equal(debits,credits);
 assert.equal(company.ledgerAccounts.find(account=>account.id==="cash").balanceMinor,company.cashMinor);
 assert.equal(validateGameState(restored).valid,true);
});


test("Phase 10 schema v10 JSON backups initialize portfolio-wide investor cash on import", () => {
  let old = createGameState({ seed: "phase-ten-v10-import" });
  old = resolveAction(old, { type: "CREATE_CHARACTER", name: "Jordan Lee", age: 31, profileId: "independent" }).state;
  old = resolveAction(old, { type: "OWNERSHIP_FOUND_COMPANY", name: "Legacy Capital Studio", sector: "Technology", amountMinor: 50000, shares: 100000 }).state;
  const companyId = old.ownership.companies[0].id;
  old = resolveAction(old, { type: "OWNERSHIP_ISSUE_SHARES", companyId, investorId: "mira-chen", shares: 15000 }).state;
  old.schemaVersion = 10;
  old.simulationVersion = "0.10.1";
  delete old.ownership.investorAccounts;
  for (const company of old.ownership.companies) {
    delete company.operations;
    delete company.operatingPayablesMinor;
    company.ledgerAccounts = company.ledgerAccounts.filter(account => !["operatingPayables", "operatingRevenue", "operatingExpenses"].includes(account.id));
  }
  const payload = { format: "networth-save", schemaVersion: 10, checksum: checksum(old), state: old };
  const restored = parseImport(JSON.stringify(payload));
  const wallet = restored.ownership.investorAccounts.find(item => item.investorId === "mira-chen");
  assert.equal(restored.schemaVersion, 12);
  assert.equal(wallet.cashMinor, 25000000 - 15000);
  assert.equal(validateGameState(restored).valid, true);
});


test("Phase 10 schema v11 JSON backups migrate company operations to schema v12", () => {
  let old = createGameState({ seed: "phase-ten-v11-import" });
  old = resolveAction(old, { type: "CREATE_CHARACTER", name: "Jordan Lee", age: 31, profileId: "independent" }).state;
  old = resolveAction(old, { type: "OWNERSHIP_FOUND_COMPANY", name: "Legacy Operations Studio", sector: "Technology", amountMinor: 50000, shares: 100000 }).state;
  old.schemaVersion = 11;
  old.simulationVersion = "0.11.0";
  for (const company of old.ownership.companies) {
    delete company.operations;
    delete company.operatingPayablesMinor;
    company.ledgerAccounts = company.ledgerAccounts.filter(account => !["operatingPayables", "operatingRevenue", "operatingExpenses"].includes(account.id));
  }
  const payload = { format: "networth-save", schemaVersion: 11, checksum: checksum(old), state: old };
  const restored = parseImport(JSON.stringify(payload));
  assert.equal(restored.schemaVersion, 12);
  assert.equal(restored.ownership.companies[0].operations.productLabel, "Client projects");
  assert.equal(validateGameState(restored).valid, true);
});
