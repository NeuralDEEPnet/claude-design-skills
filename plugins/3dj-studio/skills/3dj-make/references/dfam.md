# Print gates and design-for-printing rules

## The 3DJ gates (Design Evidence Pack v1)

| Gate | Threshold | Bench field |
|---|---|---|
| Watertight shell | 0 open edges, 0 non-manifold edges | `watertight.closed` |
| Nozzle-safe wall | ≥ 0.8 mm | `walls.belowGate_mm2` (fail when a meaningful area is below) |
| Recommended wall | ≥ 1.2 mm | `walls.belowTarget_mm2` (check) |
| Overhang | ≤ 45° from vertical without support | `overhang.area_mm2`, `regions` |
| Bed | fits 220 × 220 × 250 mm unless the person's printer is known | `bed.fits`, `fitsRotated90` |
| Mass estimate | PLA 1.24 g/cm³ (PETG ≈ 1.27, ASA ≈ 1.07, TPU ≈ 1.21) | `mass_g` — solid; a sliced part is lighter |

Evidence labels for dimensions: **measured** (calipers, ±0.15 mm), **observed** (from photos or traces, ±0.35 mm), **inferred** (from conventions, ±0.8 mm), **assumed** (unconfirmed — confirm before printing anything fit-critical).

## Fixes that work

| Problem | Fix |
|---|---|
| Wall under 1.2 mm | Raise the wall parameter, or thicken locally with a rib; on sloped or curved walls the perpendicular thickness is less than the horizontal offset |
| Flat ceiling over a gap | Keep bridges short (≲ 20 mm), or add a 45° chamfer, or reorient |
| Horizontal hole > 8 mm | Teardrop or diamond top, or print the hole vertical |
| Bottom-edge fillet drooping | Replace with a 45° chamfer; add a 0.4–0.6 mm elephant-foot chamfer on the first layer |
| Part taller than it is wide | Wider base, brim, or lay it down (`node BENCH orient`) |
| Snap fit cracking | Longer beam, not thinner; keep layers along the beam |
| Threads | Heat-set inserts or captive nuts; printed threads only above ~M8 |
| Too big for the bed | Split along a flat, hidden plane with alignment pins (0.2 mm clearance) or dovetails |

## Orientation

Choose with `node BENCH orient`, then apply judgement: the bench ranks support area, bed contact and height, but strength depends on layer direction — keep layer lines along the main load path (a hook loaded in bending should print on its side), and put the cosmetic face either on the bed (smooth, flat) or facing up (no support scars).

## Slicer starting points (FDM, 0.4 mm nozzle — say they are starting points)

| Setting | Decorative | Functional |
|---|---|---|
| Layer height | 0.12–0.16 mm for visible curves | 0.2 mm |
| Perimeters | 2–3 | 4+ |
| Infill | 10–15 % gyroid | 25–40 % gyroid or cubic |
| Supports | only where the check shows amber | same, tree supports for organic shapes |
| Material | PLA | PETG (tougher, mild heat), ASA (outdoor, heat), TPU (feet, grips, bumpers) |

Use the filament's own temperature range. Print a fit test (the interface section only, a few millimetres tall) before a long print whenever a dimension is assumed.

## Never

- Call a part print-ready or manufacturable without naming the checks that ran.
- Treat the bench or a 3DJ tool result as a structural, food-contact, medical, pressure or safety certification.
- Give a price or lead time that is not an operator-issued 3DJ quote.
