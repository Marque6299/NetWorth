export const SAVE_SCHEMA_VERSION = 1;
export const SIMULATION_VERSION = "0.2.0";
export const DAYS_PER_TURN = 7;
const isIsoDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0,10) === value;
const clone = value => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
export function normalizeSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) return seed >>> 0;
  const input=String(seed ?? "networth"); let hash=2166136261;
  for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return hash>>>0;
}
export function createGameState({seed="networth",startDate="2026-01-05"}={}) {
  if(!isIsoDate(startDate)) throw new Error("Start date must be a valid YYYY-MM-DD date.");
  const normalizedSeed=normalizeSeed(seed), now=new Date().toISOString();
  return {schemaVersion:SAVE_SCHEMA_VERSION,simulationVersion:SIMULATION_VERSION,meta:{gameId:`nw-${normalizedSeed.toString(16).padStart(8,"0")}`,seed:normalizedSeed,createdAt:now,updatedAt:now},calendar:{currentDate:startDate,turn:0,daysPerTurn:DAYS_PER_TURN},rng:{state:normalizedSeed},eventLog:[{id:"system-0",turn:0,date:startDate,type:"GAME_CREATED",summary:"A new Networth simulation was created.",details:{seed:normalizedSeed}}],actionCount:0};
}
export function drawRandom(rng,maxExclusive) {
  if(!rng||!Number.isInteger(rng.state)||!Number.isInteger(maxExclusive)||maxExclusive<1) throw new Error("A valid RNG state and positive integer range are required.");
  let value=(rng.state+0x6D2B79F5)>>>0; let t=value;
  t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61);
  return {value:Math.floor(((t^(t>>>14))>>>0)/4294967296*maxExclusive),rng:{state:value}};
}
export function validateAction(state,action) {
  if(!state||typeof state!=="object") return {valid:false,reason:"No active game is loaded."};
  if(!action||typeof action!=="object"||typeof action.type!=="string") return {valid:false,reason:"Action must include a type."};
  if(action.type==="ADVANCE_TURN") {
    if(!Number.isInteger(state.calendar?.turn)||!isIsoDate(state.calendar?.currentDate)) return {valid:false,reason:"The game calendar is invalid."};
    if(state.calendar.daysPerTurn!==DAYS_PER_TURN) return {valid:false,reason:"The configured turn length is not supported."};
    return {valid:true};
  }
  return {valid:false,reason:`Unknown action type: ${action.type}`};
}
function addDays(isoDate,days){const date=new Date(`${isoDate}T00:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);}
export function resolveAction(state,action) {
  const validation=validateAction(state,action);
  if(!validation.valid) return {ok:false,reason:validation.reason,state};
  const next=clone(state);
  if(action.type==="ADVANCE_TURN") {
    const previousDate=next.calendar.currentDate;
    next.calendar.turn+=1; next.calendar.currentDate=addDays(previousDate,next.calendar.daysPerTurn); next.actionCount+=1;
    const previousMonth=previousDate.slice(0,7),currentMonth=next.calendar.currentDate.slice(0,7);
    if(previousMonth!==currentMonth) next.eventLog.push({id:`month-${currentMonth}`,turn:next.calendar.turn,date:next.calendar.currentDate,type:"MONTH_BOUNDARY",summary:`A new in-game month began (${currentMonth}).`,details:{previousMonth,currentMonth}});
    next.eventLog.push({id:`turn-${next.calendar.turn}-advance`,turn:next.calendar.turn,date:next.calendar.currentDate,type:"TURN_ADVANCED",summary:`Turn ${next.calendar.turn} began.`,details:{previousDate,currentDate:next.calendar.currentDate,daysElapsed:next.calendar.daysPerTurn}});
  }
  return {ok:true,state:next,event:next.eventLog[next.eventLog.length-1]};
}
export function validateGameState(state) {
  const errors=[];
  if(!state||typeof state!=="object") return {valid:false,errors:["Save data must be an object."]};
  if(state.schemaVersion!==SAVE_SCHEMA_VERSION) errors.push(`Unsupported save schema version: ${state.schemaVersion}`);
  if(!state.meta||!Number.isInteger(state.meta.seed)) errors.push("Save metadata or seed is missing.");
  if(!state.calendar||!isIsoDate(state.calendar.currentDate)||!Number.isInteger(state.calendar.turn)||state.calendar.turn<0||state.calendar.daysPerTurn!==DAYS_PER_TURN) errors.push("Calendar data is invalid.");
  if(!state.rng||!Number.isInteger(state.rng.state)) errors.push("Random generator state is invalid.");
  if(!Array.isArray(state.eventLog)) errors.push("Event log is invalid.");
  if(!Number.isInteger(state.actionCount)||state.actionCount<0) errors.push("Action count is invalid.");
  return {valid:errors.length===0,errors};
}
export function stableStringify(value) {
  if(value===null||typeof value!=="object") return JSON.stringify(value);
  if(Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}
// FNV-1a detects accidental corruption; it is not a cryptographic security boundary.
export function checksum(value) {
  const input=stableStringify(value);let hash=2166136261;
  for(let i=0;i<input.length;i++){hash^=input.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(16).padStart(8,"0");
}
