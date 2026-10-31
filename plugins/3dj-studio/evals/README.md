# 3DJ Studio evals

- `cases/<name>/` — graded cases in the `claude plugin eval` layout (`prompt.md`, `case.yaml`, one statement per file in `graders/`). Run them with and without the plugin and compare.
- `trigger-evals.json` — should and shouldn't-trigger queries for the four skills, including near-misses, for tuning `description` fields.

The cases check behaviour that matters for physical work: the model is compiled and measured, the real rendered output is looked at before it is presented, directions differ in structure, and no certification is claimed.
