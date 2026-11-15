/** Deterministic event-schedule journal for replaying a simulation from a known initial state. */
const clone=value=>structuredClone(value);
export function createReplayLog(initialState){
 if(!initialState?.simulation||!Number.isSafeInteger(initialState.simulation.tick))throw new TypeError("A valid initial simulation state is required.");
 if((initialState.world?.eventQueue??[]).length)throw new Error("Replay baseline must not contain pre-scheduled events; record them in the replay log.");
 return {version:1,initialState:clone(initialState),scheduledEvents:[]};
}
export function recordScheduledEvent(log,{id,type,atTick,priority=0,payload={}},scheduledAtTick){
 if(!log||log.version!==1||!Array.isArray(log.scheduledEvents))throw new TypeError("Invalid replay log.");
 if(!Number.isSafeInteger(scheduledAtTick)||scheduledAtTick<log.initialState.simulation.tick)throw new RangeError("Invalid event scheduling tick.");
 if(!Number.isSafeInteger(atTick)||atTick<=scheduledAtTick)throw new RangeError("Replay events must be scheduled for a future tick.");
 if(typeof id!=="string"||!id.trim()||typeof type!=="string"||!type.trim())throw new TypeError("Event id and type are required.");
 if(log.scheduledEvents.some(e=>e.id===id))throw new Error("Duplicate replay event id: "+id);
 const sequence=log.scheduledEvents.length+1;
 return {...log,scheduledEvents:[...log.scheduledEvents,{id,type,atTick,priority,sequence,scheduledAtTick,payload:clone(payload)}]};
}
export function replaySimulation(log,engine,{untilTick}={}){
 if(!log||log.version!==1||!log.initialState||!Array.isArray(log.scheduledEvents))throw new TypeError("Invalid replay log.");
 let state=clone(log.initialState);
 const target=untilTick??Math.max(state.simulation.tick,...log.scheduledEvents.map(e=>e.atTick));
 if(!Number.isSafeInteger(target)||target<state.simulation.tick)throw new RangeError("Replay target tick cannot precede the initial state.");
 while(state.simulation.tick<target){
  const schedulingTick=state.simulation.tick;
  const dueToSchedule=log.scheduledEvents.filter(e=>e.scheduledAtTick===schedulingTick).sort((a,b)=>a.sequence-b.sequence);
  for(const event of dueToSchedule)state=engine.scheduleEvent(state,event);
  if(state.simulation.paused)throw new Error("Replay cannot advance while the baseline simulation is paused.");
  state=engine.step(state);
 }
 return state;
}
