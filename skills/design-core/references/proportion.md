# Proportion and base units

Figures are arithmetic [inference] from cited ids (`references/heritage-ledger.md`); no threshold is classic doctrine. Tag every adopted value `[standard: <name>]` `[platform-fixed]` `[house heuristic]` `[brief]`; tunables are declared in the brief.

## Declare first
Write before any value (shape: `references/heritage.md`).

| Declare | Example | Basis |
|---|---|---|
| unit `u` | 4 px | [house heuristic] |
| ratio family | type 1.25; space 1-8 x `u` | [house heuristic] |
| grid / module | 12 columns, 24 px line pitch | [brief] |
| exempt | 44 pt iOS control (PG c24); 36dp Material 1 button (archived) | [platform-fixed] |
| min target | 24 CSS px | [standard: WCAG 2.2 SC 2.5.8] |

No system in the DNA: pick and declare one; any consistent system beats an undeclared one. 4/8 steps are a convention (Material 1: 8dp components, 4dp icons/type; Apple HIG states no grid, PG c24). Never attribute 8 pt to Apple, Braun or Swiss.

## Ratio families
| Ratio | Value | Provenance [role] | Caveat |
|---|---|---|---|
| √2 | 1.4142 | Lichtenberg 25 Oct 1786; DIN 476 1922; ISO 216 1975; A0 = 1 m2 [evidence, PG c9-c11] | only ratio self-similar when halved; sizes drift -0.62% (A9) to +0.63% (A8) |
| φ | 1.6180 | Euclid VI Def. 3 [evidence, PG c1] | no evidence of ancient use, no reliable preference (PG c4-c8); 3:2, 16:10, 16:9, 4:3 are -7.3%, -1.1%, +9.9%, -17.6% off (PG c32 c33) |
| ISO 3 R5, R10, R20, R40 | 1.585, 1.259, 1.122, 1.059 | ISO 3:1973 [evidence, PG c15-c17] | "1.25" is -0.71% vs R10, -6.9% over ten steps |
| Modulor | 113 x φ = 182.84 | 1.83 m series [evidence, PG c12-c14] | published integers are additive (70+43=113), not φ powers; dates 1948/1950 |
| page canon | 2:3 page, margins 2:3:4:6 inner:top:outer:bottom | Van de Graaf/Rosarivo [evidence, PG c22 c23] | Tschichold also used 1:1:2:3: say which |

## Type scale
Declare ratio and base (16 px [brief]); step n = 16 x r^n. Cell = unrounded/rounded 0.5 px. Compare output to the unrounded step or +/-0.5 px [house heuristic], not +/-2% (rounded sizes fail).

| n | 1.125 | 1.2 | 1.25 | 1.333 | 1.5 | 1.618 |
|---|---|---|---|---|---|---|
| -2 | 12.64/12.5 | 11.11/11 | 10.24/10 | 9/9 | 7.11/7 | 6.11/6 |
| -1 | 14.22/14 | 13.33/13.5 | 12.80/13 | 12/12 | 10.67/10.5 | 9.89/10 |
| 0 | 16/16 | 16/16 | 16/16 | 16/16 | 16/16 | 16/16 |
| 1 | 18/18 | 19.20/19 | 20/20 | 21.33/21.5 | 24/24 | 25.89/26 |
| 2 | 20.25/20 | 23.04/23 | 25/25 | 28.43/28.5 | 36/36 | 41.89/42 |
| 3 | 22.78/23 | 27.65/27.5 | 31.25/31 | 37.90/38 | 54/54 | 67.77/68 |
| 4 | 25.63/25.5 | 33.18/33 | 39.06/39 | 50.52/50.5 | 81/81 | 109.66/109.5 |
| 5 | 28.83/29 | 39.81/40 | 48.83/49 | 67.34/67.5 | 121.5/121.5 | 177.42/177.5 |
| 6 | 32.44/32.5 | 47.78/48 | 61.04/61 | 89.76/90 | 182.25/182 | 287.07/287 |
| 7 | 36.49/36.5 | 57.33/57.5 | 76.29/76.5 | 119.66/119.5 | 273.38/273.5 | 464.48/464.5 |

## Space, baseline and the residue audit
- Space = multiples of `u` [house heuristic]. Baseline: 16 px type on 24 px line = 6u (u = 4). Block tops and heights land on multiples of line pitch B (residue `min(m, B - m)`); images and captions get a declared reset rule. WCAG 1.4.12 needs no content loss under overrides, not a baseline grid.
- **Residue** `min(v mod u, u - v mod u)`; 0 passes. By hand (<= 10 values): `v mod u`, then the smaller of it and `u - it`. Residue > 0 is an outlier unless `[platform-fixed]` or a named function; snap it or change `u`. Necessary, not sufficient.

| v | 12 | 15 | 16 | 17 | 22 | 30 | 44 |
|---|---|---|---|---|---|---|---|
| u = 4 | 0 | 1 | 0 | 1 | 2 | 2 | 0 |
| u = 8 | 4 | 1 | 0 | 1 | 2 | 2 | 4 |

u = 4, 44 `[platform-fixed]`: outliers 15, 17, 22, 30. u = 8: 12 gives 4.
- **Field arithmetic** `fields x k + (fields - 1) gap lines = column lines` [SW c2 c3]: 57 lines, 4 fields: (57 - 3)/4 = 13.5, k = 13, 4 x 13 + 3 = 55, 2 spare. Do not attribute a baseline grid or two-weight cap to Müller-Brockmann.

## Fluid scale as code
One ratio property; steps via `calc()`, no `pow()`:

```css
:root{
  --r:1.25; /* [brief] */
  --s0:clamp(1rem,.9583rem + .2083vw,1.125rem); /* 16 @320, 18 @1280 px */
  --sm1:calc(var(--s0) / var(--r));
  --s1:calc(var(--s0) * var(--r));
  --s2:calc(var(--s1) * var(--r));
  --s3:calc(var(--s2) * var(--r));
  line-height:1.5; /* explicit, for rlh */
}
```
- `pow(var(--r), 2)` in place of the chain [trend]: not in the fact base; matched in Chromium 153 only (2026-11-07). Ship the chain; see `references/modern-platform.md`.
- `vw = (max - min)/(1280 - 320) x 100`; `rem = (min - vw x 3.2)/16`. 320 px = reflow width [standard: WCAG 2.2 SC 1.4.10]. Two ratios r1, r2: min = 16 x r1^n, max = 18 x r2^n.
- Measured (Chromium 153, computed `font-size` px, steps -1/0/+1/+2/+3, within 0.01 of arithmetic): 320 px 12.80/16.00/20.00/25.00/31.25; 1280 px 14.40/18.00/22.50/28.12/35.15.
- Zoom: on-screen size at 200% = 2 x size@(W/2)/size@W = 1.852 at 1280, 2.000 at 320. A positive `vw` slope lands below 2.0: judge by actually zooming (WCAG 1.4.4); MDN's "max >= 2x min" is a heuristic, not WCAG (PG c21). Fixed `rem` keeps 2.0. Headless emulation (viewport W/2, scale 2) is not real zoom: confirm headed.
- `rlh` needs an explicit root `line-height` (`normal` is unpredictable): measured 1rlh = 24 px.

## Physical dimensions
- **Renard (ISO 17):** choose the coarsest series that works (PG c15-c17). Computed 10^(n/k) [house heuristic]: radii R10 from 2 mm: 2.0, 2.5, 3.2, 4.0, 5.0, 6.3, 8.0, 10.0; housing widths R20 from 100 mm: 100, 112, 126, 141, 158, 178, 200.
- **Modules:** Vitsœ 606 (company copy) is a two-width kit, not a single-module grid: bay centres 66.7 and 91.2 cm (PG c27). Braun Atelier 1/L1 "same proportions as the SK4" = family compatibility, not a module (BR av Atelier).
- **Provenance** for every body-contact dimension: quantity, source, tolerance; start from a proven type; invent no anthropometric samples; else "unknown" (Klint, OL kl1 kl2).

| Dimension | Value | Basis |
|---|---|---|
| door clear width | 32 in = 812.8 mm min; 36 in = 914.4 mm if doorway deeper than 24 in | [standard: 2010 ADA 404.2.3] |
| operable parts | 34-48 in = 863.6-1219.2 mm above floor | [standard: 2010 ADA 404.2.7] |

80 in / 2030 mm is headroom (ADA 307.4), not a door rule (PG c35).

## Image, motion and world
- **Aspect:** 1:1 1.000; 4:3 1.333; 3:2 1.500; 16:9 1.778; 9:16 0.5625 (centred crop of 16:9 keeps 31.6%); "21:9" is a Philips label for ~64:27 = 2.370; 1.91:1 is 1200x630 = 1.905 (PG c32 c33).
- **Composition grid:** declared columns x rows; edges, focal points on lines or listed exceptions.
- **Motion:** declare a duration ramp, e.g. 100/150/200/300 ms (ratios 1.50, 1.33, 1.50) [house heuristic], one easing family.
- **World:** human-scale anchors only from verified sources (ADA rows above); the rest `[brief]`.
- **Rubrics** [inference, simulated reviewer], yes/no: edges and focal points on a declared line or exception? every transition on the ramp and declared easing? every scale anchor sourced or `[brief]`?
