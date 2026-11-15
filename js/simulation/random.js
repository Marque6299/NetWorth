/** Stateless deterministic PRNG helpers. Every draw returns an updated counter. */
function assertRandomState(state){if(!state||!Number.isSafeInteger(state.seed)||!Number.isSafeInteger(state.randomCallCount)||state.randomCallCount<0||state.randomCallCount===Number.MAX_SAFE_INTEGER)throw new TypeError("Invalid or exhausted deterministic random state.");}
function mix32(value){let x=value>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);return (x^(x>>>15))>>>0;}
export function nextRandomUint32(state){assertRandomState(state);const value=mix32((state.seed>>>0)+Math.imul(state.randomCallCount+1,0x9e3779b9));return {value,state:{...state,randomCallCount:state.randomCallCount+1}};}
export function nextRandomFloat(state){const draw=nextRandomUint32(state);return {value:draw.value/0x100000000,state:draw.state};}
export function nextRandomInt(state,minInclusive,maxInclusive){
 assertRandomState(state);if(!Number.isSafeInteger(minInclusive)||!Number.isSafeInteger(maxInclusive)||maxInclusive<minInclusive)throw new RangeError("Invalid integer random range.");
 const range=maxInclusive-minInclusive+1;if(!Number.isSafeInteger(range)||range>0x100000000)throw new RangeError("Random integer range must contain at most 2^32 values.");
 const limit=Math.floor(0x100000000/range)*range;let cursor=state;
 while(true){const draw=nextRandomUint32(cursor);cursor=draw.state;if(draw.value<limit)return {value:minInclusive+(draw.value%range),state:cursor};}
}
export function pickRandom(state,items){if(!Array.isArray(items)||items.length===0)throw new RangeError("Cannot pick from an empty list.");const draw=nextRandomInt(state,0,items.length-1);return {value:items[draw.value],state:draw.state};}
