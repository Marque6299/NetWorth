/** Deterministic simulation clock; advancing a configured number of ticks advances one day. */
function validDateOnly(value){if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+"T00:00:00.000Z");return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;}
function validate(state){if(!state||!Number.isSafeInteger(state.tick)||state.tick<0)throw new TypeError("A valid simulation tick is required.");if(!Number.isSafeInteger(state.ticksPerDay)||state.ticksPerDay<1)throw new RangeError("ticksPerDay must be a positive integer.");if(!validDateOnly(state.date))throw new TypeError("date must be a valid YYYY-MM-DD date.");}
export function createSimulationClock(simulationState){
 validate(simulationState);
 return Object.freeze({
  advance(state=simulationState){validate(state);if(state.paused)return {...state};if(state.tick===Number.MAX_SAFE_INTEGER)throw new RangeError("Simulation tick counter exhausted.");const next={...state,tick:state.tick+1};if(next.tick%next.ticksPerDay===0){const current=new Date(state.date+"T00:00:00.000Z");current.setUTCDate(current.getUTCDate()+1);next.date=current.toISOString().slice(0,10);}return next;},
  pause(state=simulationState){validate(state);return {...state,paused:true};},
  resume(state=simulationState){validate(state);return {...state,paused:false};}
 });
}
