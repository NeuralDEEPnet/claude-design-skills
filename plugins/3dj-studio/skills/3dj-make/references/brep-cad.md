# B-Rep CAD in 3DJ (STEP-grade parts)

Use 3DJ's parametric B-Rep engine (Replicad on OpenCascade, compiled in the browser workbench) instead of OpenSCAD when the person needs:

- a **STEP** file for other CAD tools, CNC, injection-moulding quotes or engineering hand-off;
- true **fillets and chamfers** on selected edges, shells, lofts and sweeps;
- **assemblies** with connectors, clearance fits and standard hardware (screws, nuts, heat-set pockets, 2020 extrusion profiles) from 3DJ's `lib`.

## Workflow

1. Call `cad_get_starters` (free; optionally `category`) and read `dslReference` — it is the authoritative language reference. Start from the closest starter (project box, extrusion foot, bolt flange, hinge, gripper, planetary reducer, cradle, lathe profile …) instead of a blank page.
2. Write the script: `Param.number/bool/choice` declarations first, Z up, millimetres, solids on Z = 0, then geometry, then `return` a shape, an array, or named parts `[{ name, shape, color }]`. Keep mating parts separate and seat them with connectors (`withConnectors`, `matchTo`) or references (`withReferences`, `attachTo`).
3. Call `cad_validate_script` with the code and fix every reported problem. It always checks syntax, safety and parameters; the live server may also build the solid and return `buildValidation` and `measuredGeometry` (body count, size, volume, bed fit). Report exactly what it returned — a build check is not an exported file and not a print inspection.
4. Hand over the `.js` script and the parameter values. The person opens `https://www.3dj.app/workspace`, chooses the CAD script editor and pastes it; the workbench compiles it with OpenCascade and exports genuine STEP, binary STL or USDA. Say plainly that no STEP or STL file exists until they export it.
5. If they export an STL and share it, run it through the bench (`node BENCH build part.stl`) for views and the print check.

## Quick reference (see `dslReference` for everything)

```js
// Validated with cad_validate_script (solid build passed: 1 body, 80 × 40 × 6 mm).
const width = Param.number("Width", 80, { min: 50, max: 160, unit: "mm" });
const screw = Param.choice("Screw", "M3", ["M3", "M4"]);
let plate = roundedRect(width, 40, 4).extrude(6);
plate = fillet(plate, 1, { atZ: 6 });                      // round only the top edges
const cutter = lib.screwCutter(screw, { head: "countersunk", length: 8 });
plate = plate.subtract(cutter.translate(-width / 2 + 10, 0, 6), cutter.translate(width / 2 - 10, 0, 6));
return [{ name: "Plate", shape: plate, color: "#5b6b7a" }];
```

- Primitives: `box(w,d,h)` (centred XY, base on Z = 0), `cylinder(h, r, rTop?)`, `sphere(r)`, `torus(R, r)`; 2D: `rect`, `roundedRect`, `circle2d`, `ngon`, `slot`, `polygon`, `path()…`, then `.extrude(h, { twist, scaleTop })`, `.revolve()`, `.loftTo()`.
- Features: `fillet(shape, r, edgeQuery)`, `chamfer(shape, s, edgeQuery)`, `shape.shell(t)`, patterns (`linearPattern`, `circularPattern`, `mirrorCopy`).
- Placement: `attachTo`, `onFace`, `hole("top", { diameter, through, counterbore, countersink })`.
- Printing helpers: `tolerance(shape, mm)`, `chamferBottomEdges(shape, 0.4)`, `minWall(shape, mm)`.
- No imports, no file system, no `fetch` — everything is already in scope.
