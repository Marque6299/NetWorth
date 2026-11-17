import test from "node:test";
import assert from "node:assert/strict";
import {createGameState,resolveAction} from "../js/simulation-core.js";
import {createExport,parseImport} from "../js/persistence.js";
test("JSON export and import preserve a valid simulation",()=>{let state=createGameState({seed:"backup-test"});state=resolveAction(state,{type:"ADVANCE_TURN"}).state;const restored=parseImport(createExport(state));assert.deepEqual(restored.calendar,state.calendar);assert.deepEqual(restored.eventLog,state.eventLog);assert.equal(restored.meta.seed,state.meta.seed);});
test("JSON import rejects malformed data and tampered checksums",()=>{assert.throws(()=>parseImport("not json"),/valid JSON/);const payload=JSON.parse(createExport(createGameState()));payload.state.calendar.turn=7;assert.throws(()=>parseImport(JSON.stringify(payload)),/integrity check/);});
