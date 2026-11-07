# Design Studio evals

## What's here

- `tasks.jsonl` — the broad prompt suite (one line per task, no graders).
- `cases/<name>/` — graded cases in the `claude plugin eval` layout: `prompt.md`, `case.yaml`, and one verifiable statement per file in `graders/`. Run them by hand (with and without the skill) or with `claude plugin eval`.
- `trigger-evals.json` — should/shouldn't-trigger queries per skill, including near-misses, for tuning `description` fields.

Results from the v0.2 run are in `../docs/EVAL-RESULTS.md`. The v0.4 case `lean-unbranded-landing` tests the house style: Rapid depth stated, clean default character adopted and declared, one accent and one type family, light and dark at AA, reduction pass named, response under 400 words, honest render statement.

The v0.5 heritage cases test the heritage lens as behaviour, not recall. There are seven: `heritage-swiss-rapid` and `heritage-targeted-revision-cheap` test cost (Rapid card plus one strand card and at most 60 words at Rapid; zero reads and about 120 words on a targeted revision); `heritage-vs-client-identity` tests that a client's identity wins over a named tradition; `heritage-bauhaus-guard`, `award-readiness-honest` and `heritage-rams-scorecard` are trap cases whose prompts plant falsehoods or ask for invented research or numeric scores, so the agent must exercise judgement; `reveal-vs-restraint-speaker` is Standard depth (two strand lines) and covers 3D reveal, repair and off-state. A residue-audit case (pinned arithmetic: outliers 15, 17, 22, 30 at 4 px; 18 and 34 off a 1.25 scale) was dropped after two runs: the skill never fires on an audit-only prompt, so both arms answer identically and the case cannot discriminate; the arithmetic in `proportion.md` was recomputed by script instead. Graders state one verifiable claim each; recall-type graders remain only where the trap is the point (`heritage-bauhaus-guard` 01, 03, 04).

`lean-unbranded-landing` gained graders 10 and 11 (split from one): 10 checks that the run opens none of the four reference files, 11 that neither reply nor page names a school, designer, company or award. Adjectives alone must not open the heritage gate. `trigger-evals.json` has no per-entry note field, so three entries that look heritage-related are recorded as ordinary triggers and the gate must stay shut for them: the adjective-only entry ("timeless and classic, clean and minimal"), the cafe called Bauhaus Coffee that keeps its own brand colours (a name, not a style source), and the site that already uses Helvetica (a font in use). The entry asking for copy in the style of a famous living designer is a trigger for `image-design`; the expected behaviour is no imitation, principles only. History, licence and quiz queries ("who coined form follows function", "is Helvetica free ... legal memo", the Bauhaus-dates quiz) are should-not-trigger entries. `tasks.jsonl` has one line per heritage case. Run results are recorded in `../docs/EVAL-RESULTS.md` only after real runs.

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
