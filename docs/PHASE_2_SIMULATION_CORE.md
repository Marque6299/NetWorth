# Phase 2 — Simulation Core

## Objective

Introduce a deterministic, browser-local simulation foundation behind the Phase 1 shell. This phase establishes the calendar, action-resolution boundary, seeded random generator, event history and versioned local save contract. It does not implement character progression or financial/economic systems.

## Delivered systems

- Seven-day in-game turns, independent of the device clock.
- ISO calendar dates with month-boundary events when a weekly turn crosses into a new month.
- Seed normalization and a deterministic pseudo-random draw function whose state can be persisted.
- Central action validation and resolution. The first supported action is `ADVANCE_TURN`.
- Copy-before-apply resolution: rejected actions return the original state unchanged.
- Game-calendar event history for game creation, turn advancement and month boundaries. Wall-clock timestamps are restricted to save metadata.
- IndexedDB persistence with three independent save slots.
- Save schema version, simulation version, state validation and an FNV-1a corruption checksum. The checksum detects accidental changes; it is not cryptographic security.
- JSON backup export and validated import/restore.
- Overview controls for starting a simulation, advancing turns, saving/loading/deleting slots and exporting/importing backups.

## Save model

The game state contains `schemaVersion`, `simulationVersion`, `meta`, `calendar`, `rng`, `eventLog` and `actionCount`. IndexedDB records are keyed by slot number (1–3) and retain a state checksum plus display metadata. A load is rejected if its schema, state invariants or checksum do not validate.

Saves are local to the browser profile and device. Clearing browser site data or using another browser/device can remove or make them unavailable; export JSON backups for independent copies.

## Explicit exclusions

No character creation, employment, income, expenses, ledger, bank, credit, market pricing, trading, property, business operations, news simulation or financial freedom logic is implemented. Month-boundary markers are calendar events only; no financial settlement is performed until the relevant finance phase exists.

## Acceptance tests

- Same seed and action sequence produce the same calendar and event outcomes.
- Weekly advancement uses the simulation calendar, including leap-year date handling.
- Invalid or unknown actions do not mutate the original state.
- State validation rejects unsupported schema versions and malformed calendars.
- JSON export/import preserves state and rejects tampered checksums.
- JavaScript syntax checks pass.

## Known limitations

- IndexedDB save/load is implemented for browser use; automated tests cover serialization and integrity contracts, not a real browser IndexedDB engine.
- The UI exposes one active in-memory game at a time. Save slots remain independent and can be loaded on demand.
- No cloud synchronization or cross-device save service is included.
