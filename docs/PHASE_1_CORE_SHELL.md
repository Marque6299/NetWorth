# Phase 1 — Core Shell

## Objective

Deliver the navigable application frame for Networth before adding simulation behavior. Every planned top-level area must be reachable, visually consistent and honest about the absence of game data.

## Platform and implementation choices

- **Platform:** browser-first, responsive desktop and mobile web.
- **Implementation:** semantic HTML, CSS and native JavaScript ES modules.
- **Dependencies:** no runtime framework or third-party package.
- **Local workflow:** Node.js 18+ static development server and Node's built-in test runner.
- **Limulation and persistence:** deliberately deferred; this phase does not create a save, character, ledger or turn state.

The implementation keeps presentation separate from the simulation systems that will be introduced in later phases.

## Delivered workspaces

| Workspace | Phase 1 screen content | Planned functional expansion |
|---|---|---|
| Overview | Financial command center, snapshot placeholders, next-move links and empty activity state | Data-backed dashboard and turn preview |
| Personal | Character dossier, time planner, goals and well-being modules | Phase 3 |
| Finance | Accounts, budget, cash flow, debt and savings modules | Phase 4, then banking in Phase 6 |
| Markets | Instrument directory, research, order preview and holdings modules | Phase 7 |
| Businesses | Company directory, operating modules and governance modules | Phases 9–10 |
| Assets | Asset portfolio, property and collectibles modules | Phase 8 |
| Network | People, company connections and ownership network modules | Phases 10–11 |
| News | News feed, events and cause/effect modules | Phase 11 |
| Reports | Statements, performance analysis, forecasts and history modules | Expanded alongside simulation systems |

## Shared UI components

- Consistent application shell, brand, grouped navigation and active-route treatment.
- Shared icon, navigation-link, statistic-card, feature-card, panel-heading and empty-state renderers.
- Shared page heading, breadcrumb, save-status indicator and footer.
- Global workspace search with keyboard shortcut (`Ctrl/Cmd + K`), result filtering and keyboard navigation.
- Responsive horizontal navigation for narrow viewports.
- Visible focus states, semantic landmarks, accessible labels and reduced-motion support.

## Explicit exclusions

No world map, geographic exploration, travel progression, region unlocking, character creation, turn advancement, random events, money movement, banking calculations, trading, business operations, live data, cloud services or local save/load behavior are implemented in this phase.

No fake balances, market prices, news items or player activity are shown. Placeholder values use neutral dashes and clearly identify the absence of an active save.

## Acceptance gate

| Criterion | Result | Evidence |
|---|---|---|
| All nine planned workspaces are reachable | PASS | Navigation configuration and route tests |
| Navigation has a stable active state and safe fallback | PASS | Hash route handling tests and shared navigation component |
| Shared UI components are reused across screens | PASS | Shared component module and component tests |
| Each placeholder screen explains its purpose and future scope | PASS | Section content definitions and navigation tests |
| Clear empty states are provided without fabricated simulation data | PASS | Dashboard and section empty-state renderers; component tests |
| Responsive desktop/mobile layout | PASS — implementation review | Breakpoints at 1120px, 820px and 600px |
| Financial simulation and save systems remain out of scope | PASS | No simulation state or persistence module in Phase 1 |
| Automated tests pass | PASS | `npm test` |
| JavaScript syntax checks pass | PASS | `npm run check` |

## Files and structure

```text
assets/networth-mark.svg
index.html
styles.css
js/
  app.js
  components.js
  navigation.js
  views.js
scripts/serve.mjs
tests/
  components.test.js
  navigation.test.js
docs/
  PHASE_1_CORE_SHELL.md
  IMPLEMENTATION_ROADMAP.md
  design/                  # Original planning package, documents 01–10
package.json
README.md
```

## Handoff

Phase 1 establishes the interface only. Phase 2 may add the deterministic simulation core and persistence contracts behind these screens. Do not start Phase 2 until the user accepts this Phase 1 gate.
