# Phase 5 — Employment & Education

## Objective

Connect the existing Personal workspace, skill model and weekly time planner to a functional employment and education loop. Jobs provide opportunities and compensation; work hours influence pay, performance, skill development and career progression. Education programs consume tuition and study time, award credentials and can unlock more advanced job listings.

The phase reuses the Phase 4 household ledger. Payroll and tuition are posted through existing income and expense accounts; no parallel wallet or education balance is created.

## Job market

The local job market contains six fictional opportunities across technology services, business services, analytics, commercial, consulting and project services:
- Service Desk Associate
- Operations Coordinator
- Junior Data Analyst
- Sales Account Executive
- Business Analyst
- Project Coordinator

Each listing defines employer, industry, level, weekly pay in Credits, contract hours, minimum education level, experience requirement and relevant skill requirements. Listings are deterministic static simulation content in this phase; there is no external labor-market feed or hiring-company simulation.

## Applications and offers

- Applying for a job creates a persistent application record.
- The offer result uses the game's seeded random generator, so the same seed and action sequence reproduce the same outcome.
- Offer chance is calculated from the average fit across required skills, experience, education and reputation:
  - Skill fit is the average of min(1.25, actualSkill / requiredSkill).
  - Experience fit is capped at 1.0 against the role's required years (roles with no experience requirement receive 1.0).
  - Education fit is 1.0 when the character meets the requirement and 0.25 otherwise.
  - Chance = clamp(20 + skillFit × 45 + experienceFit × 12 + educationFit × 15 + reputation × 0.08, 5, 95).
  - A seeded integer roll from 0 through 99 receives an offer when it is lower than the calculated chance.
- The chance is a simulation estimate, not a real-world hiring probability.
- A rejected application can be retried after four turns.
- An offer must be explicitly accepted before employment begins.
- Accepting an offer closes other open offers. If already employed, the previous contract is added to employment history before the new contract begins.
- Resigning ends the active contract and records the reason and turn in employment history.

## Employment contract and payroll

An accepted role stores employer, title, industry, level, weekly salary, contracted hours and start turn.

At each weekly turn:
- Pay = round(weeklySalary × min(1, allocatedWorkHours / contractHours)).
- No pay is posted when allocated work hours are zero.
- Working more than contract hours does not create overtime pay in this phase.
- Payroll is posted as a normal INCOME journal entry in the Phase 4 ledger with category employment.
- Income, cash, net worth and cash flow therefore update through the same accounting rules as other income.

Work performance is bounded from 0 to 100:
- Meeting the full weekly contract adds 2 performance points.
- A shortfall of at least 16 hours removes 4 points; a smaller shortfall removes 2.
- Energy below 25 and stress above 80 each remove another 2 points.
- Relevant job skills improve each week in proportion to the fraction of contract hours worked.
- Each week with at least one work hour adds 1/52 year of experience.
- After every 12 worked weeks, a character with performance of at least 70 receives a promotion level and a 10% weekly salary increase.

This is a first-pass deterministic career model. There are no taxes, benefits, bonuses, commissions, overtime, layoffs, employer budgets, payroll deductions or employment-contract negotiations yet.

## Education and qualifications

Three fictional education programs are available:
- Business Operations Certificate — 4 equivalent study weeks, 6 study hours per week, tuition 450 Credits.
- Applied Data Analytics Diploma — 8 equivalent study weeks, 8 study hours per week, tuition 1,100 Credits; requires the Business Operations Certificate.
- Professional Management Diploma — 8 equivalent study weeks, 8 study hours per week, tuition 950 Credits; requires the Business Operations Certificate.

Each course defines its provider, award, tuition, duration, required education level, prerequisite and weekly skill gains.

Rules:
- Tuition is charged immediately from available cash through a Phase 4 expense journal entry categorized as education.
- Only one course can be active at a time.
- Entry-level education requirements and prerequisites are checked before enrollment.
- Weekly progress = study hours allocated / required weekly study hours. Progress is capped at the program's duration.
- Study below the required hours advances the program proportionally; no study hours means no course progress.
- Program skill gains are applied in proportion to weekly progress.
- Completion adds the award to the character's credentials, updates education level (never lowering it) and updates the dossier's education label.
- Completed programs cannot be enrolled in again. Tuition is not refunded if a program is not completed.

The education level is a game progression tier, not a claim that a short course is equivalent to a real-world degree or professional license.

## Save schema and migration

The save schema is now version 4:
- Schema v1 → v2: add the Phase 3 life container.
- Schema v2 → v3: initialize household finance.
- Schema v3 → v4: initialize career and education state from the existing character's education and experience; saves without a character keep career null.
- Phase 2, Phase 3 and Phase 4 JSON backups remain importable after checksum verification and migration.
- Existing character, calendar, RNG, life state, finance ledger, goals and event history are preserved.
- Career state is validated during save and import.

## Acceptance tests

- New characters receive a career profile with education tier based on their starting education.
- Job listings have unique IDs and valid compensation.
- Job application results are reproducible from the same seed and action sequence.
- Offers can be accepted; applications and employment history persist.
- Weekly payroll is posted to the household ledger and cash flow.
- Allocated work hours proportionally affect pay; work performance, experience and job skills progress.
- Resignation records the previous contract.
- Tuition is posted as an education expense; enrollment requires prerequisites, education tier and sufficient cash.
- Study hours advance programs proportionally; completion awards credentials and unlocks prerequisite-dependent programs.
- Promotions occur after 12 worked weeks when performance meets the threshold and increase salary by 10%.
- Invalid career actions do not partially mutate game state.
- Schema v3 saves migrate to v4 and preserve existing finance and life data.
- JSON import/export validates career state.

## Known limitations and next phase

- Job listings and course catalog are fixed fictional content, not live or procedurally changing markets.
- Hiring outcomes use a transparent first-pass fit formula; interviews, resumes, references and employer-specific selection are not implemented.
- Salary is gross in-game Credits; payroll taxes, deductions, benefits, commissions and bonuses are not modeled.
- Education is modeled as tuition plus weekly study time; attendance, exams, grades, scholarships and student loans are not implemented.
- The job market does not yet react to economic events, company performance or news.
- Banking, savings products, credit scores, loan contracts, interest and repayment schedules belong to Phase 6.
- Well-being and career coefficients require later balancing.
