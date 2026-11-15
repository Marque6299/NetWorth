/** Versioned, checksummed JSON save envelope and migration entry point. */
export const SAVE_FORMAT="mosaic-save";
export const SAVE_FORMAT_VERSION=1;
const clone=value=>structuredClone(value);
function canonical(value){
 if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
 if(value&&typeof value==="object")return "{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+canonical(value[k])).join(",")+"}";
 return JSON.stringify(value);
}
function checksum(text){let hash=0x811c9dc5;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193);}return (hash>>>0).toString(16).padStart(8,"0");}
export function migrateGameState(input){
 if(!input||typeof input!=="object")throw new TypeError("Save state must be an object.");
 let state=clone(input);
 if(state.schemaVersion===1){state.simulation.eventSequence=0;state.schemaVersion=2;}
 if(state.schemaVersion!==2)throw new RangeError("Unsupported game-state schema version: "+state.schemaVersion);
 if(!state.saveId||!state.simulation||!state.ledger||!state.world)throw new TypeError("Save state is missing required root sections.");
 state.simulation.eventSequence??=0;
 state.world.eventQueue??=[];
 return state;
}
export function serializeGameState(input){
 const state=migrateGameState(input);const body=canonical(state);
 const envelope={format:SAVE_FORMAT,formatVersion:SAVE_FORMAT_VERSION,checksum:checksum(body),state};
 return JSON.stringify(envelope);
}
export function deserializeGameState(serialized){
 if(typeof serialized!=="string")throw new TypeError("Serialized save must be a string.");
 let envelope;try{envelope=JSON.parse(serialized);}catch{throw new SyntaxError("Save file is not valid JSON.");}
 if(envelope?.format!==SAVE_FORMAT||envelope.formatVersion!==SAVE_FORMAT_VERSION)throw new RangeError("Unsupported save format.");
 if(checksum(canonical(envelope.state))!==envelope.checksum)throw new Error("Save checksum mismatch: data may be corrupted.");
 return migrateGameState(envelope.state);
}
