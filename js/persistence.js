import {SAVE_SCHEMA_VERSION,checksum,migrateGameState,validateGameState} from "./simulation-core.js";
const DB_NAME="networth-local-saves",STORE_NAME="save-slots",MAX_SLOTS=3;
function openDatabase(){
 if(!globalThis.indexedDB)return Promise.reject(new Error("IndexedDB is not available in this browser."));
 return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:"slot"});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||new Error("Could not open local save storage."));});
}
async function withStore(mode,operation){
 const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE_NAME,mode),store=tx.objectStore(STORE_NAME);let result;try{result=operation(store);}catch(error){db.close();reject(error);return;}tx.oncomplete=()=>{db.close();resolve(result?.result);};tx.onerror=()=>{db.close();reject(tx.error||new Error("Local save transaction failed."));};tx.onabort=()=>{db.close();reject(tx.error||new Error("Local save transaction was aborted."));};});
}
function assertSlot(slot){if(!Number.isInteger(slot)||slot<1||slot>MAX_SLOTS)throw new Error(`Save slot must be between 1 and ${MAX_SLOTS}.`);}
function copy(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
export async function saveGame(slot,state){
 assertSlot(slot);const validation=validateGameState(state);if(!validation.valid)throw new Error(`Cannot save invalid game state: ${validation.errors.join(" ")}`);
 const payload=copy(state),record={slot,schemaVersion:SAVE_SCHEMA_VERSION,savedAt:new Date().toISOString(),gameId:payload.meta.gameId,turn:payload.calendar.turn,currentDate:payload.calendar.currentDate,checksum:checksum(payload),state:payload};
 await withStore("readwrite",store=>store.put(record));return record;
}
export async function loadGame(slot){
 assertSlot(slot);const db=await openDatabase();
 const record=await new Promise((resolve,reject)=>{const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).get(slot);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error||new Error("Could not read save slot."));});
 db.close();if(!record)throw new Error(`Save slot ${slot} is empty.`);
 if(!record.state||checksum(record.state)!==record.checksum)throw new Error(`Save slot ${slot} failed its integrity check. The stored data may be damaged.`);
 let state;try{state=migrateGameState(record.state);}catch(error){throw new Error(`Save slot ${slot} cannot be migrated: ${error.message}`);}
 const validation=validateGameState(state);if(!validation.valid)throw new Error(`Save slot ${slot} is invalid: ${validation.errors.join(" ")}`);
 if(record.schemaVersion!==SAVE_SCHEMA_VERSION||record.state.schemaVersion!==SAVE_SCHEMA_VERSION)await saveGame(slot,state);
 return state;
}
export async function listSaveSlots(){
 const db=await openDatabase();const records=await new Promise((resolve,reject)=>{const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).getAll();request.onsuccess=()=>resolve(request.result||[]);request.onerror=()=>reject(request.error||new Error("Could not list save slots."));});
 db.close();return records.sort((a,b)=>a.slot-b.slot).map(({slot,savedAt,gameId,turn,currentDate})=>({slot,savedAt,gameId,turn,currentDate}));
}
export async function deleteSave(slot){assertSlot(slot);await withStore("readwrite",store=>store.delete(slot));}
export function createExport(state){
 const validation=validateGameState(state);if(!validation.valid)throw new Error(`Cannot export invalid game state: ${validation.errors.join(" ")}`);
 return JSON.stringify({format:"networth-save",schemaVersion:SAVE_SCHEMA_VERSION,checksum:checksum(state),state},null,2);
}
export function parseImport(text){
 let payload;try{payload=JSON.parse(text);}catch{throw new Error("The selected file is not valid JSON.");}
 if(!payload||payload.format!=="networth-save"||![1,2,3,4,SAVE_SCHEMA_VERSION].includes(payload.schemaVersion)||!payload.state||payload.state.schemaVersion!==payload.schemaVersion)throw new Error("This file is not a supported Networth save.");
 if(checksum(payload.state)!==payload.checksum)throw new Error("The save file failed its integrity check.");
 let state;try{state=migrateGameState(payload.state);}catch(error){throw new Error(`The save file cannot be migrated: ${error.message}`);}
 const validation=validateGameState(state);if(!validation.valid)throw new Error(`The save file is invalid: ${validation.errors.join(" ")}`);
 return state;
}
