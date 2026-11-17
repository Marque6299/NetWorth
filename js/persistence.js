import {SAVE_SCHEMA_VERSION,checksum,migrateGameState,validateGameState} from "./simulation-core.js";
const DB_NAME="networth-local-saves",STORE_NAME="save-slots",AUTO_STORE_NAME="auto-save",MAX_SLOTS=3;
function openDatabase(){
 if(!globalThis.indexedDB)return Promise.reject(new Error("IndexedDB is not available in this browser."));
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,2);
  request.onupgradeneeded=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:"slot"});
   if(!db.objectStoreNames.contains(AUTO_STORE_NAME))db.createObjectStore(AUTO_STORE_NAME,{keyPath:"id"});
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error("Could not open local save storage."));
 });
}
async function withStore(mode,operation,storeName=STORE_NAME){
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  let result;
  let tx;
  try{
   tx=db.transaction(storeName,mode);
   result=operation(tx.objectStore(storeName));
  }catch(error){
   db.close();
   reject(error);
   return;
  }
  tx.oncomplete=()=>{db.close();resolve(result?.result);};
  tx.onerror=()=>{db.close();reject(tx.error||new Error("Local save transaction failed."));};
  tx.onabort=()=>{db.close();reject(tx.error||new Error("Local save transaction was aborted."));};
 });
}
function assertSlot(slot){if(!Number.isInteger(slot)||slot<1||slot>MAX_SLOTS)throw new Error(`Save slot must be between 1 and ${MAX_SLOTS}.`);}
function copy(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}
function validatedSnapshot(state,context){
 const validation=validateGameState(state);
 if(!validation.valid)throw new Error(`Cannot ${context} invalid game state: ${validation.errors.join(" ")}`);
 return copy(state);
}
function makeRecord(state,payload,key){
 return {
  ...key,
  schemaVersion:SAVE_SCHEMA_VERSION,
  savedAt:new Date().toISOString(),
  gameId:payload.meta.gameId,
  turn:payload.calendar.turn,
  currentDate:payload.calendar.currentDate,
  checksum:checksum(payload),
  state:payload
 };
}
function verifyRecord(record,label){
 if(!record?.state||checksum(record.state)!==record.checksum)throw new Error(`${label} failed its integrity check. The stored data may be damaged.`);
 let state;
 try{state=migrateGameState(record.state);}
 catch(error){throw new Error(`${label} cannot be migrated: ${error.message}`);}
 const validation=validateGameState(state);
 if(!validation.valid)throw new Error(`${label} is invalid: ${validation.errors.join(" ")}`);
 return state;
}
export async function saveGame(slot,state){
 assertSlot(slot);
 const payload=validatedSnapshot(state,"save");
 const record=makeRecord(state,payload,{slot});
 await withStore("readwrite",store=>store.put(record));
 return record;
}
export async function loadGame(slot){
 assertSlot(slot);
 const db=await openDatabase();
 const record=await new Promise((resolve,reject)=>{
  const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).get(slot);
  request.onsuccess=()=>resolve(request.result||null);
  request.onerror=()=>reject(request.error||new Error("Could not read save slot."));
 });
 db.close();
 if(!record)throw new Error(`Save slot ${slot} is empty.`);
 const state=verifyRecord(record,`Save slot ${slot}`);
 if(record.schemaVersion!==SAVE_SCHEMA_VERSION||record.state.schemaVersion!==SAVE_SCHEMA_VERSION)await saveGame(slot,state);
 return state;
}
export async function saveAutoGame(state){
 const payload=validatedSnapshot(state,"auto-save");
 const record=makeRecord(state,payload,{id:"active"});
 await withStore("readwrite",store=>store.put(record),AUTO_STORE_NAME);
 return record;
}
export async function loadAutoGame(){
 const db=await openDatabase();
 const record=await new Promise((resolve,reject)=>{
  const request=db.transaction(AUTO_STORE_NAME,"readonly").objectStore(AUTO_STORE_NAME).get("active");
  request.onsuccess=()=>resolve(request.result||null);
  request.onerror=()=>reject(request.error||new Error("Could not read the automatic recovery save."));
 });
 db.close();
 if(!record)return null;
 const state=verifyRecord(record,"Automatic recovery save");
 if(record.schemaVersion!==SAVE_SCHEMA_VERSION||record.state.schemaVersion!==SAVE_SCHEMA_VERSION)await saveAutoGame(state);
 return state;
}
export async function deleteAutoGame(){
 await withStore("readwrite",store=>store.delete("active"),AUTO_STORE_NAME);
}
export async function listSaveSlots(){
 const db=await openDatabase();
 const records=await new Promise((resolve,reject)=>{
  const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).getAll();
  request.onsuccess=()=>resolve(request.result||[]);
  request.onerror=()=>reject(request.error||new Error("Could not list save slots."));
 });
 db.close();
 return records.sort((a,b)=>a.slot-b.slot).map(({slot,savedAt,gameId,turn,currentDate})=>({slot,savedAt,gameId,turn,currentDate}));
}
export async function deleteSave(slot){assertSlot(slot);await withStore("readwrite",store=>store.delete(slot));}
export function createExport(state){
 const payload=validatedSnapshot(state,"export");
 return JSON.stringify({format:"networth-save",schemaVersion:SAVE_SCHEMA_VERSION,checksum:checksum(payload),state:payload},null,2);
}
export function parseImport(text){
 let payload;
 try{payload=JSON.parse(text);}
 catch{throw new Error("The selected file is not valid JSON.");}
 if(!payload||payload.format!=="networth-save"||![1,2,3,4,5,6,7,8,9,10,11,SAVE_SCHEMA_VERSION].includes(payload.schemaVersion)||!payload.state||payload.state.schemaVersion!==payload.schemaVersion)throw new Error("This file is not a supported Networth save.");
 if(checksum(payload.state)!==payload.checksum)throw new Error("The save file failed its integrity check.");
 let state;
 try{state=migrateGameState(payload.state);}
 catch(error){throw new Error(`The save file cannot be migrated: ${error.message}`);}
 const validation=validateGameState(state);
 if(!validation.valid)throw new Error(`The save file is invalid: ${validation.errors.join(" ")}`);
 return state;
}
