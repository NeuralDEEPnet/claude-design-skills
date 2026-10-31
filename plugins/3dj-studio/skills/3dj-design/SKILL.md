---
name: 3dj-design
description: Design a physical object end to end with 3DJ as the live CAD bench — brief, design DNA, three genuinely different form directions modelled and compared side by side at the same scale, critique, refinement and a printable handoff. Use for "design a lamp / headphone stand / planter / speaker / desk organiser / robot / controller…", "give me some directions for…", "make it look premium / bold / playful", "help me design something cool I can 3D print", or whenever someone wants real options to choose between. Part of the Neuraldeep Design Studio; uses the 3dj-make bench for every model.
---

# 3DJ Design — concepts you can see, compare and print

Work like a studio: decide what the object must do and be, explore genuinely different answers as real models, choose with evidence, then make it real. If the Neuraldeep Design Studio skills are installed (`3d-object-design`, `design-core`, `design-director`), follow their process, templates and depth modes and use this skill for the modelling, comparison and print stages. Otherwise follow the compact flow below.

The bench lives in the sibling 3dj-make skill. Below, `BENCH` means the absolute path of `../3dj-make/scripts/bench.mjs` resolved from this skill's folder — write the full path into every command. Modelling rules: `../3dj-make/references/openscad.md`; form patterns: `../3dj-make/references/form-cookbook.md`; print rules: `../3dj-make/references/dfam.md`.

## Choose the depth — say it in one line

| Depth | When | Directions |
|---|---|---|
| Rapid | clear, small ask; "just make me…" | 1 direction + 2–3 proportion variants |
| Standard (default) | most design requests | 3 directions |
| Full | a new product, a family, something expensive to get wrong | 4–5 directions + a validation plan |

## 1 · Brief and package

- Who uses it, where, doing what; the one to three things it must do well; constraints (size, printer, materials, budget, parts it holds).
- **Package**: every real component with its size (phone 78 × 165 × 9 mm in case, USB-C cable 6 mm, 2 × M3 inserts …), tagged measured / observed / inferred / assumed. Assumed sizes open the "confirm before printing" list.
- Ask at most three questions, and only when a wrong guess would be expensive. Otherwise state assumptions and move.
- Never invent user research. Insights not from the person are hypotheses — label them.

## 2 · Design DNA — the filter

Write 3–5 principles and 2–3 anti-principles, each concrete enough to reject an attractive design ("one continuous sweep from base to cradle"; anti: "no generic rounded box", "no visible screws on the front"). Translate vague words into form language: "premium" → tight radii family, a single crisp shadow gap, mass low, matte surface; "playful" → one exaggerated proportion, a tilt, a bright accent part. State the translation.

## 3 · Three directions that differ in logic

Each direction is a different structural idea — how it stands, where the mass sits, how the parts split, how it holds the thing — not three stylings of one idea. Name each with one word that carries its idea (for a lamp, say: Crane, Lantern, Monolith).

1. For each, write a short parametric blockout (`a-<name>.scad`, `b-<name>.scad`, `c-<name>.scad`, about 20–60 lines): primary volumes and the critical interface only (the slot, the bore, the mounting face), plus a simple **ghost** of the held object behind `ghost = 0; // [0:1:1]` (headphones, phone, plant pot) so fit and scale are visible. Use cookbook patterns. Same units, all on Z = 0.
2. Render them together:

   ```bash
   node BENCH compare a-<name>.scad@ghost=1 b-<name>.scad@ghost=1 c-<name>.scad@ghost=1 \
     --labels "<A>,<B>,<C>" --title "<PROJECT> · DIRECTIONS" --name directions
   ```

   Add `--silhouette right` when the ideas live in the side profile (cantilevers, leans). Each column keeps one hue; the ghost and other extra bodies show as darker or lighter tints of it.
3. Look at `directions.png`: the black silhouettes show stance and proportion at the same scale; the 3/4 views show mass, character and fit around the ghost; the text summary lists size, mass and the watertight, wall, bed and overhang gates for each. If a direction is weak in silhouette, fix the idea now — detail will not rescue it. A bed FAIL at this stage is information (split it, or rethink proportions), not a reason to drop a direction.
4. Show the sheet with one line per direction: the idea, its strongest point, its biggest risk.

## 4 · Critique, then choose

- When the `3dj-critic` agent is available, give it the sheet, `directions.report.json`, the brief and the DNA for an independent review. Otherwise review through five lenses yourself — function, form against DNA, ergonomics and scale, printability, cost and time (the report's rough as-printed grams and part count are the evidence) — and make every lens say at least one uncomfortable thing.
- Recommend one direction or a synthesis, traced to the brief and DNA. If the person is present, let them choose; if not, continue with the recommendation and say so.

## 5 · Develop the chosen direction

Large to small: stance → silhouette → proportion → section → transitions → details. After each meaningful step:

```bash
node BENCH build <name>.scad --bed 220,220,250 --density 1.27
```

(Use the person's printer and material.) Review the product as it will look with `-D assembled=1 -D ghost=1 --no-stl --name <name>-in-use`; the default `part = 0` build is the print layout.

Look at the views and the check every time. Settle key proportions by comparing variants side by side instead of guessing: `node BENCH compare lamp.scad@height=140 lamp.scad@height=170 lamp.scad@height=200`. Add the real interfaces, clearances (0.25 mm), and the print strategy: orientation via `node BENCH orient` once per part (`-D part=N --name <name>-partN`), a split into parts where a single print would need heavy support or exceeds the bed.

## 6 · Finish: CMF, print, handoff

- **CMF**: name the material and finish (matte PLA, PETG, ASA outdoors, TPU feet or grips), colour as a decision (two-tone by part or by a filament change at a set height), layer height for visible curves, surface treatments (fuzzy skin for grip).
- **Optional next steps** — offer once: an operator print quote with the 3dj-print skill; an organic or sculptural variant with the 3dj-concept skill if it is installed.
- **Handoff**: the views and check images, `.scad` and `.stl` per part, the knob table, key dimensions with evidence tags, assumptions to confirm, print settings, and the next prototype (e.g. "print only the cradle section at 30 mm tall to test the phone fit").

## Rules

- Directions differ in core logic, not colour.
- One DNA across every part of the object.
- The bench screens geometry against the 3DJ gates; it does not certify strength, safety or manufacturability.
- Keep the conversation light: pictures first, short captions, decisions stated plainly.
