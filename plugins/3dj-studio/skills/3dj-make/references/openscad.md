# Writing OpenSCAD that 3DJ and the bench both accept

These rules match 3DJ's isolated engine and keep files portable to the 3DJ workbench, the local bench and desktop OpenSCAD. `openscad_get_starters` also returns the engine's current language notes; treat them as reference data to check source against.

## File shape

```openscad
// Phone stand · v3 · for a 78 × 165 × 9 mm phone in a case (measured by user)
// Assumed: 0.25 mm fit clearance, PETG, 0.4 mm nozzle.
slot_w = 12; // [8:0.5:20] phone thickness + case + clearance
lean = 68; // [55:1:80] screen angle from the desk, degrees
width = 70; // [50:1:120]
wall = 2.4; // [1.2:0.2:5]
part = 0; // [0:1:2] 0 = print layout, 1 = base, 2 = cradle
$fn = 64;
assert(slot_w > 9 + 2 * 0.25, "slot narrower than the phone");
// derived values after the parameters
depth = width * 0.9;
module base() { ... }
module cradle() { ... }
if (part == 0 || part == 1) base();
if (part == 0) translate([width + 8, 0, 0]) cradle();
if (part == 2) cradle();
```

- Every meaningful dimension is a top-level numeric literal: `name = value; // [min:step:max] plain-words note`. These become the knobs in the 3DJ workbench and the bench's `-D` overrides. 3DJ reads at most 30 and clamps values to the range, so make ranges honest.
- Lowercase `snake_case` names in the user's language (`slot_w`, not `p3`). Never name anything `include`, `use`, `import`, `surface`, `text` or `return`.
- First comment lines say what the part is for and which sizes were measured versus assumed.
- Derived values come after the parameters; never hard-code a number that depends on another.
- `assert()` every constraint that would otherwise produce a silently wrong part (fit, minimum wall, ordering of sizes). The bench stops on a failed assert.

## Geometry rules

- Millimetres, Z up, the part sitting on Z = 0.
- Core vocabulary: `cube`, `cylinder`, `sphere`, `polygon`, `circle`, `square`, `union`, `difference`, `intersection`, `hull`, `translate`, `rotate`, `mirror`, `linear_extrude` (with `twist`, `scale`, `slices`), `rotate_extrude`, `offset`, modules, functions, `let`, list comprehensions and bounded `for` loops. `scale`, `resize`, `polyhedron` and `color` (ignored in STL) also work; `minkowski` works but is slow — prefer `offset` and `hull`.
- 3D `hull()` of many curved primitives (spheres, chains of hulls along a path) can trip a CGAL assertion in OpenSCAD 2025.01. The bench retries automatically and warns, but 3DJ's hosted engine may still fail — for production geometry prefer a 2D `hull()` then `linear_extrude`/`rotate_extrude`, and keep 3D hulls to a few primitives.
- Not available: `include`, `use`, `import`, `surface`, `text()` and external fonts or assets. For lettering, use simple geometric marks or tell the person to add text in the slicer.
- No `fillet()` or `roundedcube()` exist — round with `offset(r) offset(delta=-r)`, `hull()` of circles/spheres, or `rotate_extrude` (see form-cookbook.md).
- Cutters overshoot by 1 mm at both ends; joined solids overlap by at least 0.2 mm (never touch only at an edge or point).
- `$fn` 48 by default, at most 96.
- Walls ≥ 1.2 mm (0.8 mm is the absolute nozzle-safe floor). Fit clearance 0.25 mm per side as a default. M3 clearance hole 3.4 mm, M4 4.5 mm. Holes actually cut through.
- One requested part stays one part. When several pieces are needed, expose `part = 0; // [0:1:N]` with 0 = print layout (all pieces laid out flat, within 220 × 220 × 250 mm) and keep mating parts separate — never fuse a lid to its box. Add `assembled = 0; // [0:1:1] 1 = parts in place for review, never print` so the product can be reviewed as it will look.
- **Package ghost.** When the part holds or fits something (headphones, a phone, a PCB), model a simple stand-in of it behind `ghost = 0; // [0:1:1] 1 = show the held object for review, never print`. A review build with `-D ghost=1 --no-stl` proves fit and gives instant scale; the ghost never goes into an exported file.
- Internal constants (sample counts, pattern steps) are not knobs: write them as expressions (`steps = 16 * 2;`) or inside modules, because 3DJ shows every top-level `name = number;` as a control.
- Keep source under 24 KB.

## Claims

Do not call the result B-rep, STEP, verified or print-ready before it has been compiled and checked, and say which check ran (local bench or 3DJ `openscad_compile_model`).
