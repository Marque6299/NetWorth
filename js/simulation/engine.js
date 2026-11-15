/** Deterministic simulation scheduler. System order is phase, order, then stable id. */
export const SYSTEM_PHASES=Object.freeze(["world","household","employment","business","markets","government","finalize"]);
const clone=value=>structuredClone(value);
function requireState(state){if(!state?.simulation||!Number.isSafeInteger(state.simulation.tick)||state.simulation.tick<0)throw new TypeError("Invalid simulation state.");}
function compareSystems(a,b){return SYSTEM_PHASES.indexOf(a.phase)-SYSTEM_PHASES.indexOf(b.phase)||a.order-b.order||a.id.localeCompare(b.id);}
export function createSimulationEngine(){
 const systems=new Map(),eventHandlers=new Map();
 return Object.freeze({
  registerSystem({id,phase="world",order=0,update}){if(typeof id!=="string"||!id.trim())throw new TypeError("System id is required.");if(!SYSTEM_PHASES.includes(phase))throw new RangeError("Unknown simulation phase: "+phase);if(!Number.isFinite(order))throw new TypeError("System order must be finite.");if(typeof update!=="function")throw new TypeError("System update must be a function.");if(systems.has(id))throw new Error("Duplicate simulation system: "+id);systems.set(id,{id,phase,order,update});return this;},
  registerEventHandler(type,handler){if(typeof type!=="string"||!type.trim()||typeof handler!=="function")throw new TypeError("Event type and handler are required.");if(eventHandlers.has(type))throw new Error("Duplicate event handler: "+type);eventHandlers.set(type,handler);return this;},
  scheduleEvent(state,{id,type,atTick,priority=0,payload={}}){requireState(state);if(typeof id!=="string"||!id.trim()||typeof type!=="string"||!type.trim())throw new TypeError("Event id and type are required.");if(!Number.isSafeInteger(atTick)||atTick<=state.simulation.tick)throw new RangeError("Events must be scheduled for a future integer tick.");if(!Number.isFinite(priority))throw new TypeError("Event priority must be finite.");if(!eventHandlers.has(type))throw new Error("No handler registered for event type: "+type);const queue=state.world?.eventQueue??[];if(queue.some(e=>e.id===id))throw new Error("Duplicate scheduled event id: "+id);const sequence=(state.simulation.eventSequence??0)+1;return {...state,simulation:{...state.simulation,eventSequence:sequence},world:{...state.world,eventQueue:[...queue,{id,type,atTick,priority,sequence,payload:clone(payload)}]}};},
  step(inputState){
   requireState(inputState);if(inputState.simulation.paused)return clone(inputState);
   let state=clone(inputState);const sim={...state.simulation,tick:state.simulation.tick+1};if(sim.tick%sim.ticksPerDay===0){const d=new Date(state.simulation.date+"T00:00:00.000Z");if(Number.isNaN(d.getTime()))throw new TypeError("Invalid simulation calendar date.");d.setUTCDate(d.getUTCDate()+1);sim.date=d.toISOString().slice(0,10);}state.simulation=sim;
   const due=(state.world?.eventQueue??[]).filter(e=>e.atTick<=sim.tick).sort((a,b)=>a.atTick-b.atTick||a.priority-b.priority||a.sequence-b.sequence);
   const dueIds=new Set(due.map(e=>e.id));if(state.world)state.world.eventQueue=state.world.eventQueue.filter(e=>!dueIds.has(e.id));
   for(const event of due){const handler=eventHandlers.get(event.type);if(!handler)throw new Error("Missing handler for queued event type: "+event.type);const next=handler(clone(state),clone(event),{tick:sim.tick});if(!next||typeof next!=="object")throw new TypeError("Event handlers must return a state object.");state=next;}
   for(const system of [...systems.values()].sort(compareSystems)){const next=system.update(clone(state),{tick:sim.tick,date:sim.date,phase:system.phase,systemId:system.id});if(!next||typeof next!=="object")throw new TypeError("Simulation systems must return a state object: "+system.id);state=next;}
   return state;
  },
  listSystems(){return [...systems.values()].sort(compareSystems).map(({id,phase,order})=>({id,phase,order}));}
 });
}
