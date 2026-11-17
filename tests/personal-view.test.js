import test from "node:test";
import assert from "node:assert/strict";
import {renderPersonalView,renderStartingProfilePreview} from "../js/views.js";
import {createGameState,resolveAction} from "../js/simulation-core.js";
test("Personal workspace prompts for a simulation before character creation",()=>{const html=renderPersonalView(null);assert.match(html,/SIMULATION REQUIRED/);assert.match(html,/Start a game first/);});
test("Personal workspace displays all four differentiated starting profiles",()=>{const html=renderPersonalView(createGameState());for(const label of ["Early-Career Graduate","Career Switcher","Family Provider","Independent Specialist"])assert.ok(html.includes(label));});
test("starting profile preview updates its tagline and profile details",()=>{const preview=renderStartingProfilePreview("family-provider");assert.match(preview.tagline,/responsibilities/);assert.match(preview.html,/DEPENDENTS/);});
test("created character view exposes well-being, skills, weekly planner and goals",()=>{const state=resolveAction(createGameState(),{type:"CREATE_CHARACTER",name:"Taylor Reed",age:29,profileId:"career-switcher"}).state;const html=renderPersonalView(state);for(const label of ["CHARACTER DOSSIER","Well-being","Skills & development","Allocate your time","Goals","112 waking hours"])assert.ok(html.includes(label),label);assert.match(html,/STARTING DEBT CONTEXT/);});
