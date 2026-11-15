/** Canonical versioned root state for a MOSAIC save; presentation state is excluded. */
export const GAME_STATE_SCHEMA_VERSION=2;
export function createInitialGameState({saveId,worldId="aurel",startingCityId="meridian",seed=1,startDate="0001-01-01"}){
 if(typeof saveId!=="string"||!saveId.trim())throw new TypeError("saveId is required.");
 if(!Number.isSafeInteger(seed))throw new TypeError("seed must be a safe integer.");
 if(typeof startDate!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||Number.isNaN(Date.parse(startDate+"T00:00:00.000Z")))throw new TypeError("startDate must be a valid YYYY-MM-DD date.");
 return {schemaVersion:GAME_STATE_SCHEMA_VERSION,saveId:saveId.trim(),worldId,createdAt:new Date().toISOString(),simulation:{date:startDate,tick:0,ticksPerDay:1,paused:true,seed,randomCallCount:0,eventSequence:0},player:null,households:{},entities:{},ledger:{currency:"LU",accounts:{},transactions:[]},world:{activeCityId:startingCityId,unlockedRegionIds:["meridian-coast"],eventQueue:[]},systems:{employment:{},businesses:{},banking:{},markets:{},government:{}}};
}
