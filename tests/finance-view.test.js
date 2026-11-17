import test from "node:test";
import assert from "node:assert/strict";
import {createGameState,resolveAction} from "../js/simulation-core.js";
import {renderFinanceView} from "../js/views.js";
test("Finance workspace requires a simulation and character before showing accounts",()=>{assert.match(renderFinanceView(null),/SIMULATION REQUIRED/);assert.match(renderFinanceView(createGameState()),/CHARACTER REQUIRED/);});
test("Finance workspace displays accounts, balanced journal controls and cash-flow rules",()=>{const state=resolveAction(createGameState(),{type:"CREATE_CHARACTER",name:"Riley Stone",age:28,profileId:"family-provider"}).state;const html=renderFinanceView(state);for(const text of ["HOUSEHOLD BALANCE SHEET","Cash","Savings","Record income","Record expense","Transfer between accounts","Borrow money","Repay loan principal","Investment holdings","Open Markets","Monthly budgets","IMMUTABLE POSTED HISTORY","Transfers, borrowing and valuation changes are excluded"])assert.ok(html.includes(text),text);assert.match(html,/CREDITS/);});
