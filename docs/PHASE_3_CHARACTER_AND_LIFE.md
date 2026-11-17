# Phase 3 — Character & Life

## Objective

Make the Personal workspace a functional character and life-management system. The phase introduces distinct starting profiles, character attributes, skills, a weekly time planner, well-being simulation and measurable personal goals.

## Starting profiles

Four starting backgrounds are available:

- **Early-Career Graduate:** degree-qualified, limited experience, higher education debt and strong technical/research potential.
- **Career Switcher:** professional experience and transferable operational capabilities, with moderate capital and one dependent.
- **Family Provider:** established work experience, multiple dependents, higher household expense context and tighter recovery capacity.
- **Independent Specialist:** self-managed freelance context, stronger initial capital and technical/sales/networking capabilities, with variable-work exposure represented as a profile description.

Profiles vary in education, experience, employment context, starting capital/debt/expense context, dependents, skills, well-being, reputation and contacts.

## Character dossier

A save can contain one character. The dossier records name, age, profile, education, experience, employment context, initial scenario circumstances, nine skill scores, four well-being attributes, reputation and contacts.

Starting capital, debt and monthly expenses are descriptive scenario context only in this phase. They are not ledger accounts, cash balances, loan contracts or posted transactions. Phase 4 establishes authoritative financial records; Phase 5 introduces functional employment.

## Skills

Skills are tracked from 0 to 100:

- Financial literacy
- Negotiation
- Management
- Sales
- Technical expertise
- Research
- Leadership
- Networking
- Operations

Study develops the selected study focus. Research improves research and financial literacy; networking improves networking and negotiation; side work improves operations and sales. Skills are capped at 100.

## Weekly time allocation

The character receives 112 waking hours per standard week after baseline sleep. The player may allocate hours among work, study, rest, family, networking, research, side work and recreation. Allocations must be whole, non-negative hours and cannot exceed 112. Unallocated hours remain flexible. Study includes a selectable skill focus.

## Well-being rules

Health, energy, stress and happiness are bounded from 0 to 100 and updated deterministically when a turn advances. Work, study and side-work hours contribute to workload. Rest, family and recreation contribute to recovery and quality of life. Sustained workload without recovery can raise stress and reduce energy. The rules are intentionally transparent and will be balanced in the later learning/balance phase.


### First-pass weekly formulas

Let `W = work + study + sideWork`. After each turn, the current values are updated and clamped to 0–100:

- Energy: `energy += round((rest - 14) × 0.7 + (recreation - 8) × 0.25 - max(0, W - 55) × 0.45)`.
- Stress: `stress += round((W - 55) × 0.3 - (rest - 10) × 0.35 - recreation × 0.1)`.
- Health: `health += round((rest - 12) × 0.12 + (recreation - 8) × 0.1 - max(0, stress - 60) × 0.08)`.
- Happiness: `happiness += round((family - 6) × 0.25 + (recreation - 8) × 0.2 - max(0, stress - 60) × 0.12)`.

Skill gains per week are: study focus +0.3 per study hour; research +0.3 per research hour; financial literacy +0.1 per research hour; networking +0.3 per networking hour; negotiation +0.1 per networking hour; operations +0.2 per side-work hour; sales +0.1 per side-work hour. Each skill is capped at 100. These are initial balancing coefficients, not real-world health or career advice.

## Goals

Goals can target:
- A skill score (target at or above a value).
- A well-being score (target at or above a value).
- Stress (target at or below a value).
- A future in-game turn milestone.

Goals are checked during turn advancement. Completion is written to the event log and remains part of the character's saved history.

## Save compatibility

The save schema is now version 2. Phase 2 schema-v1 local saves and JSON backups are checksum-verified and migrated by adding an empty life record while preserving the calendar, seed, event log and action count. Migrated IndexedDB saves are rewritten in the new schema after a successful validation. New backups use schema v2.

## Acceptance tests

- Four starting profiles contain meaningfully different attributes and circumstances.
- Character creation validates name, age and profile and rejects duplicate character creation.
- Invalid actions do not partially mutate game state.
- Time allocation enforces the 112-hour weekly limit.
- Weekly progression updates well-being and skills deterministically.
- Heavy workload without recovery raises stress and reduces energy.
- Skill and stress goals complete using their respective target directions.
- Save validation rejects malformed character data.
- Phase 2 schema-v1 saves and JSON backups migrate to schema v2 without losing existing simulation history.

## Known limitations

- Starting financial figures are converted into authoritative opening balances by Phase 4.
- Work hours are shared with the employment system introduced in Phase 5; the Personal workspace now includes jobs, salary, performance and career history.
- No family-member simulation, dependents' needs, health-care expenses or social relationship actions are implemented.
- Well-being coefficients are first-pass deterministic rules and require balancing.
- Browser IndexedDB migration and save/load still require real-browser acceptance testing.
