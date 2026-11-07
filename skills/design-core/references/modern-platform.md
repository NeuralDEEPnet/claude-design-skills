# Modern platform — what to use and how to check

Read before proposing a CSS or platform feature that is not Baseline "Widely available" (software-design lists the common ones). Statuses live only here.

## Tier rule
| Baseline status | May be |
|---|---|
| Widely available | on the critical path |
| Newly available | enhancement only: a named job and a fallback |
| Not Baseline | experiment; never required for comprehension or the primary action |

- Check the exact compat key: a badge covers the whole feature, not your syntax (`text-box` below).
- Newly available is not a reason to use it. WebGL is the fallback for WebGPU.
- More than 60 days after the as-of date, or offline: use a row, label it `[trend, checked 2026-11-07]`, keep the fallback, and fetch the URL if you can.

## Dated snapshot
As of 2026-11-07, web-features 3.45.0 (fetched `https://unpkg.com/web-features/data.json`); re-check after 60 days. Re-check: that URL, MDN compat tables, web.dev/baseline. Widely = 30 months after Newly.

| Feature (key) | Status | Date | Note |
|---|---|---|---|
| grid | Widely | 2020-04-17 | |
| subgrid | Widely | 2026-03-15 | Newly 2023-09-15 |
| container size queries (`container-queries`) | Widely | 2025-08-14 | name-only 2026-05-07, style queries 2026-05-19: Newly |
| `min()` `max()` `clamp()` | Widely | 2023-01-28 | |
| `pow()` `sqrt()` (`exp-functions`) | Widely | 2026-06-07 | `round()` `mod()`: Newly 2024-05-17 |
| `lh` `rlh` `cap` | Widely | 2026-05-21 / 06-11 | set explicit root `line-height` |
| oklch, `color-mix()` (`oklab`) | Widely | 2025-11-09 | relative colour: Newly 2024-09-16 |
| `contrast-color()` | Newly | 2026-04-10 | black/white only, not an AA guarantee |
| `light-dark()` | Newly | 2024-05-13 | Widely ~2026-11-13 `[inference]`; needs `color-scheme` |
| `@property` | Newly | 2024-07-09 | |
| `text-wrap: balance` | Newly | 2024-05-13 | Widely ~2026-11-13 `[inference]`; line caps differ by engine; polish only |
| `text-wrap: pretty` | not Baseline | n/a | no Firefox: polish only |
| `text-box-trim` | not Baseline (feature `text-box`) | key Newly 2026-08-18 | `text-edge` keywords cap/ex/alphabetic lack Firefox |
| view transitions, same-document | Newly | 2025-10-14 | cross-document: not Baseline |
| scroll-driven animations | Newly | 2026-10-27 | |
| anchor positioning | not Baseline | n/a | parts Newly 2026-01-13 to 2026-09-14 (`position-anchor`); `position-visibility` `anchor-valid`/`anchor-visible` not Baseline |
| `prefers-reduced-motion` | Widely | 2022-07-15 | honour it for any motion |
| `prefers-contrast` / `forced-colors` | Widely | 2024-11-30 / 2025-03-12 | |
| WebGPU, WebXR | not Baseline | n/a | keep WebGL fallback |

Source: `PL` C02-C13, C29-C30, refetched 2026-11-07.

## Standards that are not heritage
- WCAG 2.2: W3C Recommendation 5 Oct 2023; ISO/IEC 40500:2025 is the same text. Target size AA 24×24 CSS px; reflow at 320 px.
- WCAG 3.0 is a Working Draft (10 Sep 2026): contrast method undetermined, no APCA. Never cite its numbers as compliance.
- EAA covers consumer-facing products and services, not every website. Application date unverified here: confirm on a Commission page before stating one.
- ESPR (EU) 2024/1781 in force 18 Jul 2024; product rules arrive only by delegated act. Do not write "ESPR requires X".
- Right to Repair Directive (EU) 2024/1799 sets repair obligations and consumer remedies, not design for repairability.
- glTF 2.0 = ISO/IEC 12113:2022. OpenUSD Core 1.0 is not ISO. C2PA records provenance, not truth.
- Calm technology (Weiser and Brown, 1995/96) is the heritage of "unobtrusive".

## Not compliance
APCA or WCAG 3 numbers, `contrast-color()`, Baseline badges, awards, Rams or Bauhaus principles: none certify accessibility, safety or quality.
