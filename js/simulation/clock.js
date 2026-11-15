/** Deterministic simulation clock; advancing one tick advances one configured day. */
export function createSimulationClock(simulationState) {
  if (!simulationState || !Number.isSafeInteger(simulationState.tick) || simulationState.tick < 0) {
    throw new TypeError("A valid simulation state is required.");
  }
  if (!Number.isSafeInteger(simulationState.ticksPerDay) || simulationState.ticksPerDay < 1) {
    throw new RangeError("ticksPerDay must be a positive integer.");
  }

  return Object.freeze({
    advance(state = simulationState) {
      if (state.paused) return { ...state };
      const next = { ...state, tick: state.tick + 1 };
      if (next.tick % next.ticksPerDay === 0) {
        const current = new Date(`${state.date}T00:00:00.000Z`);
        current.setUTCDate(current.getUTCDate() + 1);
        next.date = current.toISOString().slice(0, 10);
      }
      return next;
    },
    pause(state = simulationState) { return { ...state, paused: true }; },
    resume(state = simulationState) { return { ...state, paused: false }; }
  });
}
