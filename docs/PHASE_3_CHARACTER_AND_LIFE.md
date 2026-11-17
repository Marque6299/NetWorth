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

- Starting financial figures are not yet spendable balances and do not appear in a ledger.
- Work hours are time-allocation inputs only; jobs, salary, performance and career history are Phase 5.
- No family-member simulation, dependents' needs, health-care expenses or social relationship actions are implemented.
- Well-being coefficients are first-pass deterministic rules and require balancing.
- Browser IndexedDB migration and save/load still require real-browser acceptance testing.
