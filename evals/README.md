# Design Studio evals

## What's here

- `tasks.jsonl` — the broad prompt suite (one line per task, no graders).
- `cases/<name>/` — graded cases in the `claude plugin eval` layout: `prompt.md`, `case.yaml`, and one verifiable statement per file in `graders/`. Run them by hand (with and without the skill) or with `claude plugin eval`.
- `trigger-evals.json` — should/shouldn't-trigger queries per skill, including near-misses, for tuning `description` fields.

Results from the v0.2 run are in `../docs/EVAL-RESULTS.md`. The v0.4 case `lean-unbranded-landing` tests the house style: Rapid depth stated, clean default character adopted and declared, one accent and one type family, light and dark at AA, reduction pass named, response under 400 words, honest render statement.

The v0.5 heritage cases test the heritage lens as behaviour, not recall. `heritage-swiss-rapid` and `heritage-targeted-revision-cheap` test cost (card plus one strand at Rapid, zero reads on a targeted revision); `heritage-vs-client-identity` tests that a client's identity wins over a named tradition; `heritage-bauhaus-guard` and `award-readiness-honest` are trap cases whose user prompts plant falsehoods or ask for invented research, so the agent must exercise judgement; `reveal-vs-restraint-speaker` covers 3D reveal, repair and off-state; `heritage-residue-audit` pins arithmetic (outliers 15, 17, 22, 30 at 4 px; 18 and 34 off a 1.25 scale) and is the only case that allows `Bash`. `lean-unbranded-landing` gained grader 10: adjectives alone do not open the heritage gate. `trigger-evals.json` has no per-entry note field, so the adjective-only entry ("timeless and classic, clean and minimal") is recorded as an ordinary `software-design` trigger; the check that it must NOT load `heritage.md` lives in that grader, and the history and licensing queries ("who coined form follows function", "is Helvetica free", the Bauhaus-dates quiz) are should-not-trigger entries. Run results are recorded in `../docs/EVAL-RESULTS.md` only after real runs.

These evals test whether the skills produce disciplined design behavior rather than stylish prose.

## Evaluation approach

Run each task:
1. without the relevant skill,
2. with the relevant skill,
3. compare outputs blind where possible.

## Rubric

Assess whether the response:
- correctly frames the brief,
- identifies unknowns without stalling,
- builds a plausible user panel without fabricating research,
- distinguishes evidence from inspiration,
- defines usable design DNA,
- explores genuinely distinct concepts,
- performs multi-lens critique,
- makes a reasoned synthesis,
- chooses an appropriate prototype,
- evaluates the real artifact when available,
- addresses accessibility/responsibility,
- addresses feasibility/performance/manufacturing,
- maintains cross-medium coherence,
- produces an actionable handoff.

Avoid collapsing this into a single aesthetic score. Record concrete wins, misses, and regressions.

## Regression rule

If a skill change improves one showcase example but degrades several unrelated tasks, do not merge it without narrowing the instruction.
