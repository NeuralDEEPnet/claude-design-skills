# Form cookbook — OpenSCAD patterns for parts that look designed

Every snippet compiles on the local bench and inside 3DJ's rules (no `include`, `use`, `import`, `surface`, `text`; `$fn` ≤ 96; millimetres, Z up, sitting on Z = 0). Each one is a complete file: copy it, rename the parameters to the user's words, and adapt. Combine patterns rather than inventing new primitives. There is no `fillet()` or `roundedcube()` in OpenSCAD — rounding comes from `offset()`, `hull()` and `rotate_extrude()` as shown.

Pick by the design DNA, not by habit:

| Character the DNA asks for | Reach for |
|---|---|
| calm, soft, friendly, hand-held | 1 Soft block · 2 Pebble · 5 Lathe |
| precise, technical, engineered | 4 Chamfered block · 8 Slot grille · 12 Screw holes |
| light, airy, structural | 9 Hex lattice · 7 Flutes |
| playful, sculptural, statement | 6 Twist · 5 Lathe · 13 Faceted |
| functional enclosure | 3 Shell + 10 Lid lip · 11 Snap hook · 12 Screw holes |

## 1 · Soft block (rounded plan, crisp top)

```openscad
width = 70; // [20:1:200]
depth = 44; // [20:1:200]
height = 18; // [3:1:120]
corner_r = 8; // [0.5:0.5:30]
$fn = 64;
assert(2 * corner_r < min(width, depth));
linear_extrude(height = height)
  offset(r = corner_r) offset(delta = -corner_r) square([width, depth]);
```

`offset(r) offset(delta=-r)` rounds every convex corner of any 2D profile — use it on custom `polygon()` outlines too.

## 2 · Pebble (flat base, fully rounded top edges)

```openscad
width = 72; // [24:1:200]
depth = 48; // [24:1:200]
height = 24; // [8:1:120]
edge_r = 10; // [2:0.5:40]
$fn = 64;
assert(2 * edge_r < min(width, depth) && edge_r < height);
hull() for (x = [edge_r, width - edge_r], y = [edge_r, depth - edge_r]) {
  translate([x, y, 0]) cylinder(r = edge_r, h = height - edge_r);
  translate([x, y, height - edge_r]) sphere(r = edge_r);
}
```

The flat base prints without supports; the top reads as one soft object. Subtract pockets from it for trays, stands and holders. Keep 3D hulls like this to a handful of primitives — long chains of sphere hulls are where OpenSCAD's hull occasionally fails (see openscad.md).

## 3 · Shell with uniform wall (enclosure body, tray, planter)

```openscad
width = 80; // [30:1:200]
depth = 56; // [30:1:200]
height = 30; // [10:1:150]
wall = 2.4; // [1.2:0.2:5]
floor_t = 2; // [1.2:0.2:6]
corner_r = 6; // [1:0.5:20]
$fn = 64;
assert(corner_r > wall && 2 * corner_r < min(width, depth));
module plan() offset(r = corner_r) offset(delta = -corner_r) square([width, depth]);
difference() {
  linear_extrude(height = height) plan();
  translate([0, 0, floor_t]) linear_extrude(height = height) offset(delta = -wall) plan();
}
```

Offsetting the same plan inward keeps the wall exactly `wall` thick round the corners.

## 4 · Chamfered block (precise, machined look; built-in elephant-foot relief)

```openscad
width = 60; // [20:1:200]
depth = 40; // [20:1:200]
height = 20; // [5:1:120]
top_chamfer = 3; // [0.4:0.2:10]
foot_chamfer = 0.5; // [0:0.1:1.5]
assert(2 * top_chamfer < min(width, depth) && top_chamfer + foot_chamfer < height);
hull() {
  linear_extrude(height = 0.01) offset(delta = -foot_chamfer) square([width, depth]);
  translate([0, 0, foot_chamfer]) cube([width, depth, height - top_chamfer - foot_chamfer]);
  translate([0, 0, height - 0.01]) linear_extrude(height = 0.01) offset(delta = -top_chamfer) square([width, depth]);
}
```

A 45° chamfer on a bottom edge prints cleanly where a fillet would droop. A family of chamfer sizes (e.g. 0.5 / 1.5 / 3) reads as deliberate.

## 5 · Lathe form (vase, knob, foot, lamp shade)

```openscad
height = 96; // [30:1:200]
base_r = 30; // [10:1:80]
top_r = 18; // [6:1:80]
bulge = 10; // [-20:1:30]
wall = 2; // [1.2:0.2:5]
floor_t = 2.4; // [1.2:0.2:6]
steps = 32; // [8:1:64]
function r_at(t) = (1 - t) * base_r + t * top_r + bulge * sin(180 * t);
assert(min([for (i = [0:steps]) r_at(i / steps)]) > wall + 1);
outer = [for (i = [0:steps]) [r_at(i / steps), height * i / steps]];
inner = [for (i = [steps:-1:0]) let(z = floor_t + (height - floor_t) * i / steps) [r_at(z / height) - wall, z]];
rotate_extrude($fn = 96) polygon(concat([[0, 0]], outer, inner, [[0, floor_t]]));
```

Draw half the silhouette (x = radius, y = height) and spin it. Change `r_at()` to any smooth function for a new family of forms; keep slopes under 45° where the profile faces down.

## 6 · Twisted, tapered extrusion (pen cup, vase, lamp)

```openscad
radius = 34; // [12:1:80]
height = 100; // [30:1:200]
sides = 7; // [3:1:12]
twist = 90; // [0:5:360]
top_scale = 0.75; // [0.3:0.05:1.5]
wall = 2; // [1.2:0.2:5]
floor_t = 2.4; // [1.2:0.2:6]
corner_r = 3; // [0.5:0.5:10]
module plan() offset(r = corner_r) offset(delta = -corner_r) circle(r = radius, $fn = sides);
// The cavity is the same twist and taper continued 1 mm past the top, so the wall follows the outside.
module twisted(inset, h) linear_extrude(height = h, twist = twist * h / height, scale = 1 + (top_scale - 1) * h / height, slices = 64)
  offset(delta = -inset) plan();
difference() {
  twisted(0, height);
  intersection() {
    twisted(wall / min(1, top_scale), height + 1);
    translate([-2 * radius, -2 * radius, floor_t]) cube([4 * radius, 4 * radius, height + 2]);
  }
}
```

Twist reads strongest with few sides and rounded corners. Dividing the inset by the taper keeps the wall at least `wall` thick at the narrow end.

## 7 · Flutes and ribs (grip, rhythm, stiffness)

```openscad
radius = 30; // [10:1:80]
height = 60; // [10:1:200]
flutes = 18; // [6:1:48]
flute_r = 3; // [1:0.5:8]
$fn = 64;
assert(flute_r < radius / 3);
difference() {
  cylinder(r = radius, h = height);
  for (i = [0:flutes - 1]) rotate([0, 0, i * 360 / flutes])
    translate([radius + flute_r * 0.35, 0, -1]) cylinder(r = flute_r, h = height + 2, $fn = 32);
}
```

Swap the cutter `cylinder` for a thin `cube` to get ribs; union instead of subtract for raised ribs.

## 8 · Slot grille (vents, speaker grilles, cable passes)

```openscad
panel_w = 80; // [30:1:200]
panel_d = 50; // [30:1:200]
panel_t = 2.4; // [1.2:0.2:6]
slot_l = 30; // [8:1:120]
slot_w = 4; // [2:0.5:10]
rib = 2.4; // [1.2:0.2:6]
slots = 6; // [1:1:30]
$fn = 32;
module slot2d(l, w) hull() { translate([-(l - w) / 2, 0]) circle(d = w); translate([(l - w) / 2, 0]) circle(d = w); }
pitch = slot_w + rib;
assert(slots * pitch - rib < panel_d - 2 * rib && slot_l < panel_w - 2 * rib);
difference() {
  cube([panel_w, panel_d, panel_t]);
  for (i = [0:slots - 1])
    translate([panel_w / 2, (panel_d - (slots * pitch - rib)) / 2 + slot_w / 2 + i * pitch, -1])
      linear_extrude(height = panel_t + 2) slot2d(slot_l, slot_w);
}
```

Rounded slot ends (hull of two circles) look intentional and avoid stress corners.

## 9 · Hex lattice (lightweighting, visual texture)

```openscad
panel_w = 90; // [30:1:200]
panel_d = 60; // [30:1:200]
panel_t = 3; // [1.2:0.2:8]
cell_r = 6; // [3:0.5:20]
rib = 1.6; // [1.2:0.2:5]
border = 4; // [1.2:0.5:12]
module lattice2d() intersection() {
  offset(delta = -border) square([panel_w, panel_d]);
  for (i = [-1:ceil(panel_w / (1.5 * cell_r)) + 1], j = [-1:ceil(panel_d / (sqrt(3) * cell_r)) + 1])
    translate([i * 1.5 * cell_r, j * sqrt(3) * cell_r + (i % 2) * sqrt(3) * cell_r / 2])
      circle(r = cell_r - rib / sqrt(3), $fn = 6);
}
difference() {
  cube([panel_w, panel_d, panel_t]);
  translate([0, 0, -1]) linear_extrude(height = panel_t + 2) lattice2d();
}
```

Ribs stay `rib` thick because the cutter hexagons shrink by `rib/√3` from the cell pitch. Keep `rib` ≥ 1.2 mm.

## 10 · Lid with locating lip (pairs with 3)

```openscad
width = 80; // [30:1:200]
depth = 56; // [30:1:200]
wall = 2.4; // [1.2:0.2:5]
lid_t = 2.4; // [1.2:0.2:6]
lip_h = 4; // [1:0.5:10]
clearance = 0.25; // [0.1:0.05:0.6]
corner_r = 6; // [1:0.5:20]
$fn = 64;
module plan() offset(r = corner_r) offset(delta = -corner_r) square([width, depth]);
linear_extrude(height = lid_t) plan();
translate([0, 0, lid_t - 0.2]) linear_extrude(height = lip_h + 0.2) difference() {
  offset(delta = -wall - clearance) plan();
  offset(delta = -2 * wall - clearance) plan();
}
```

Model the lid upside down (plate on the bed, lip up) so it prints without supports. `clearance` is per side; 0.2–0.3 mm suits most FDM printers — print a test first.

## 11 · Cantilever snap hook (prints in plane, flexes along the layers)

```openscad
beam_l = 18; // [8:1:40]
beam_t = 1.8; // [1.2:0.1:4]
hook_depth = 1.2; // [0.4:0.1:3]
hook_l = 3; // [1.5:0.5:8]
hook_land = 0.8; // [0.4:0.1:2]
width = 8; // [4:1:20]
base_l = 6; // [3:1:20]
base_t = 6; // [3:1:20]
assert(hook_land < hook_l && hook_l < beam_l);
linear_extrude(height = width) union() {
  translate([-base_l, 0]) square([base_l + 0.2, base_t]);
  polygon([[0, 0], [beam_l - hook_l, 0], [beam_l - hook_l, -hook_depth], [beam_l - hook_l + hook_land, -hook_depth],
           [beam_l, 0], [beam_l, beam_t], [0, beam_t]]);
}
```

The part lies flat with the bending plane parallel to the bed, so layer lines run along the beam. The small land under the hook avoids a knife edge that would print ragged. Keep strain modest: a longer beam flexes more safely than a thinner one.

## 12 · Screw holes, counterbores and heat-set bosses

```openscad
plate_t = 6; // [3:0.5:15]
plate_w = 40; // [20:1:120]
clear_d = 3.4; // [2.4:0.1:6.6]
head_d = 6.5; // [4.5:0.1:12]
head_h = 3.2; // [1.5:0.1:6]
insert_d = 4.0; // [3:0.1:6]
insert_depth = 6; // [3:0.5:12]
boss_d = 8; // [5:0.5:16]
boss_h = 12; // [4:1:40]
$fn = 48;
module counterbored_hole() { translate([0, 0, -1]) cylinder(d = clear_d, h = plate_t + 2); translate([0, 0, plate_t - head_h]) cylinder(d = head_d, h = head_h + 1); }
module countersunk_hole() { translate([0, 0, -1]) cylinder(d = clear_d, h = plate_t + 2); translate([0, 0, plate_t - (head_d - clear_d) / 2]) cylinder(d1 = clear_d, d2 = head_d, h = (head_d - clear_d) / 2 + 0.01); translate([0, 0, plate_t]) cylinder(d = head_d, h = 1); }
module insert_boss() difference() { cylinder(d = boss_d, h = boss_h); translate([0, 0, boss_h - insert_depth]) cylinder(d = insert_d, h = insert_depth + 1); }
difference() {
  cube([plate_w, plate_w / 2, plate_t]);
  translate([plate_w * 0.25, plate_w * 0.25, 0]) counterbored_hole();
  translate([plate_w * 0.75, plate_w * 0.25, 0]) countersunk_hole();
}
translate([plate_w / 2, plate_w * 0.85, 0]) insert_boss();
```

Starting sizes for M3: clearance 3.4, socket head counterbore 6.5 × 3.2, heat-set insert hole about 4.0 × 6 — take the insert's own datasheet value when the user has one. M4 clearance 4.5. Heat-set inserts beat printed threads for anything assembled more than twice.

## 13 · Faceted (low-poly) character

```openscad
radius = 40; // [15:1:80]
height = 70; // [20:1:160]
facets = 7; // [3:1:12]
wall = 2.4; // [1.2:0.2:5]
floor_t = 2.4; // [1.2:0.2:6]
difference() {
  hull() { cylinder(r = radius * 0.72, h = 0.01, $fn = facets); translate([0, 0, height * 0.55]) rotate([0, 0, 180 / facets]) cylinder(r = radius, h = 0.01, $fn = facets); translate([0, 0, height - 0.01]) cylinder(r = radius * 0.82, h = 0.01, $fn = facets); }
  translate([0, 0, floor_t]) hull() { cylinder(r = radius * 0.72 - wall * 1.3, h = 0.01, $fn = facets); translate([0, 0, height * 0.55 - floor_t]) rotate([0, 0, 180 / facets]) cylinder(r = radius - wall * 1.3, h = 0.01, $fn = facets); translate([0, 0, height]) cylinder(r = radius * 0.82 - wall * 1.3, h = 0.01, $fn = facets); }
}
```

Low `$fn` on purpose turns curves into planes; rotating alternate rings by half a facet makes the faces fold. Keep lower faces flaring outward (no downward-facing slopes beyond 45°).

## Composition moves that make a part look designed

- **One dominant gesture.** Pick a single big idea (a sweep, a lean, a cut, a twist) and keep everything else quiet.
- **Radius and chamfer families.** Use two or three sizes across the part (e.g. 1 / 3 / 8 mm), never random values.
- **Proportion first.** Check the black front silhouette on the compare sheet before adding detail; if it is dull in silhouette, details will not save it.
- **Honest joints.** Show part lines and fasteners deliberately (an even shadow gap, a counterbore family) instead of hiding them badly.
- **Print-native expression.** Layer direction, 45° chamfers instead of bottom fillets, and lattice infill as surface are strengths of printing, not compromises.
