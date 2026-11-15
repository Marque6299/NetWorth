/**
 * Canonical, versioned root state for a new MOSAIC save.
 * Domain systems add records under their own namespaces; UI state is excluded.
 */
export const GAME_STATE_SCHEMA_VERSION = 1;

export function createInitialGameState({ saveId, worldId = "aurel", startingCityId = "meridian", seed = 1, startDate = "0001-01-01" }) {
  if (!saveId || typeof saveId !== "string") throw new TypeError("saveId is required.");
  if (!Number.isSafeInteger(seed)) throw new TypeError("seed must be a safe integer.");
  if (Number.isNaN(Date.parse(startDate))) throw new TypeError("startDate must be a valid date string.");
  return {
    schemaVersion: GAME_STATE_SCHEMA_VERSION,
    saveId,
    worldId,
    createdAt: new Date().toISOString(),
    simulation: {
      date: startDate,
      tick: 0,
      ticksPerDay: 1,
      paused: true,
      seed,
      randomCallCount: 0
    },
    player: null,
    households: {},
    entities: {},
    ledger: {
      currency: "LU",
      accounts: {},
      transactions: []
    },
    world: {
      activeCityId: startingCityId,
      unlockedRegionIds: ["meridian-coast"],
      eventQueue: []
    },
    systems: {
      employment: {},
      businesses: {},
      banking: {},
      markets: {},
      government: {}
    }
  };
}
