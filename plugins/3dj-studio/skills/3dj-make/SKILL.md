---
name: 3dj-make
description: Make a functional, 3D-printable part with 3DJ — brackets, mounts, enclosures, cases, holders, stands, adapters, knobs, organisers, jigs and replacement parts. Writes a parametric model, compiles and measures it (free on a local bench, or on 3DJ), looks at real rendered views and a print check, fixes problems, and hands over the files with named knobs to adjust. Use for "make me a bracket for…", "design a case for this PCB", "I need a replacement knob, 22 mm shaft", "model a phone stand I can print", "turn these measurements into a part", or any printable object with real dimensions. For a product designed through compared concepts use 3dj-design.
---

# 3DJ Make — a printable part, measured and seen

Go from request to a parametric part the person can see, adjust by name and print — in one pass, with the picture shown early and questions kept to the minimum.

## 0 · Know the bench (check silently)

- **Local bench** — `scripts/bench.mjs` in this skill's folder; below, `BENCH` means its absolute path (write the full path into every command). Needs Node 18+, no account, no cost: compiles OpenSCAD with the official WebAssembly build, measures against the 3DJ gates, renders views and a print check. `node BENCH --help` lists every option.
- **First `.scad` build**: the bench needs the OpenSCAD engine, a one-time download of about 11 MB from the npm registry (pinned version, SHA-512 verified, install scripts disabled) into `~/.cache/3dj-bench`. If the bench reports it is not installed, tell the person what will be downloaded and ask once; on a yes, run `node BENCH setup`. On a no, carry on with 3DJ's `openscad_compile_model` if they are signed in, or hand over uncompiled source. STL and GLB files never need the engine.
- **3DJ tools** — free without sign-in: `openscad_get_starters`, `cad_get_starters`, `cad_validate_script`, `cad_get_evidence_schema`. With a 3DJ account: `openscad_compile_model` and the rest. Names, routes (plugin server, Claude app connector, Adaptive gateway) and sign-in: `references/tools.md`.
- **Neither available** (no Node, no connector): write the source carefully, following `references/openscad.md`; say it has not been compiled and give the person the 3DJ workbench step.

## 1 · Pin the part down (fast)

1. Write a three-line brief: what it does, what it touches (the phone, the 25 mm pipe, the M3 holes 40 mm apart), where it lives.
2. List the dimensions that make or break the fit and tag each **measured / observed / inferred / assumed**.
3. Ask at most two questions, and only for fit-critical numbers you cannot sensibly assume ("What is the pipe's outside diameter?"). Otherwise state the assumption and continue.
4. Note printer bed and material if known (default: FDM, 0.4 mm nozzle, PLA or PETG, 220 × 220 × 250 mm bed).

## 2 · Pick the engine

| The person needs | Use |
|---|---|
| A printable part, quick iterations, STL | OpenSCAD + bench (default) |
| STEP for other CAD or CNC, true edge fillets, mating assemblies with standard hardware | 3DJ B-Rep — follow `references/brep-cad.md` |
| Organic, sculptural, character, "make this photo 3D" | the 3dj-concept skill if it is installed; otherwise sculpt with the cookbook's pebble, lathe, twist and faceted patterns |

## 3 · Model it

1. Start from something proven: a pattern in `references/form-cookbook.md` or a 3DJ starter (`openscad_get_starters`: mounting plate, vented cup, box + lid). Do not start from a blank page.
2. Write `<name>.scad` into a project folder (`3dj/<name>/` unless the person's project has a place for it). Follow `references/openscad.md`: top-level parameters with honest ranges and plain names, comments marking measured versus assumed sizes, `assert()` for every fit constraint, 1 mm cutter overshoot, walls ≥ 1.2 mm, 0.25 mm clearances, a `part` switch for multi-part prints, nothing below Z = 0.
3. When the part holds or fits something, model a simple **ghost** of it (the phone, the pipe, the PCB) behind `ghost = 0; // [0:1:1]`. It is the fastest way to prove fit and show scale.
4. Give it character on purpose: choose an edge strategy (soft radii, crisp chamfers, or one family of each) and one dominant gesture. A bracket can still look designed.

## 4 · Compile, measure, look — every iteration

```bash
node BENCH build 3dj/<name>/<name>.scad --bed 220,220,250 --density 1.27 [-D name=value]
```

Use the person's printer for `--bed` and their material for `--density` (PLA 1.24 is the default, PETG 1.27, ASA 1.07, TPU 1.21). For a review render with the ghost or the assembled product, add `-D ghost=1` or `-D assembled=1` with `--no-stl --name <name>-in-use` so no review geometry is ever exported.

1. Read the summary. Fix any failure before showing anything: compile errors (the bench stops on failed asserts and unknown names), watertight FAIL, wall FAIL, bed FAIL.
2. Open `<name>.views.png` and `<name>.check.png` with the image reader and look properly: does it match the brief, are the proportions right, do holes go through, are parts separate, is anything floating or fused that should not be? Fix and rebuild. The person should see a good version first, not the first version.
3. Overhang CHECK → run `node BENCH orient` (for multi-part files, once per part: `-D part=N --name <name>-partN`) or change the geometry (45° chamfer instead of a bottom fillet, teardrop holes, a flat underside) — see `references/dfam.md`.
4. If the person is signed in to 3DJ and an official measurement helps (before a print quote, or when the bench could not run), call `openscad_compile_model` with the same `code`, `parameters` and `buildVolumeMm`. Report any disagreement with the bench.
5. To compare alternatives of one parameter, render them together: `node BENCH compare part.scad@wall=1.6 part.scad@wall=2.4`.

## 5 · Show it and hand it over

Lead with the views image — it is the answer. Then, briefly:

- **Files**: the `.scad` (source of truth), the `.stl`, the views and check images. In a chat app with a send-file tool, send them; in a terminal or IDE, give the paths.
- **Knobs** — a small table the person can act on by name:

  | Knob | Now | Range | What it changes |
  |---|---|---|---|
  | `slot_w` | 12 mm | 8–20 | fits phone + case |

- **Print notes**: orientation, supports (from the check), material, approximate filament from the report's rough as-printed estimate.
- **To confirm**: every **assumed** dimension, and a quick fit-test print when one matters.
- **Next moves**: two or three one-liners the person can just say back ("make it 10 mm taller", "add a cable notch", "show me three directions").
- **Finish in 3DJ** (mention once): open `https://www.3dj.app/workspace`, choose OpenSCAD, paste the source — to save it to the gallery, export from the workbench, or go on to a print quote with the 3dj-print skill.

## 6 · Iterate by name

Map plain requests to parameters ("wider" → `width`), change the default in the file so the source stays the truth, rebuild, and show the new views with what changed. Add a parameter when the person keeps asking for the same kind of change.

## Honesty

- The bench and 3DJ checks are geometry screens against the 3DJ gates, not manufacturing, structural, food-contact or safety certification. Say which checks ran; never just "print-ready".
- Never claim a STEP or STL exists until it has been written, or that 3DJ compiled something unless the tool returned a result.
- Never ask for API keys or tokens in chat, and never put credentials in tool arguments.
