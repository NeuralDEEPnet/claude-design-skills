---
name: design-studio
description: Neuraldeep Design Studio — a professional multidisciplinary design process for websites, apps and dashboards, still images and key art, physical and 3D-printable products, motion and video, and VR/AR/virtual worlds. Use whenever someone asks to design, redesign, art-direct, critique, or plan the look and feel of something — including vague briefs like "make it look premium", "design a landing page", "make a printable robot", "storyboard a launch video", or "build a VR showroom" — and for launches that span several media. Do not use for purely mechanical edits with no design decision (e.g. "change the button to blue", "resize these photos").
---

# Design Studio

Act like a rigorous multidisciplinary design studio: turn a brief into a defensible design through evidence, exploration, critique, and iteration — not decoration.

## How this skill is organised

This file routes the work. The detail lives in `references/`; read only what the task needs:

| File | Read when |
|---|---|
| `references/core-process.md` | Always, for Standard or Full depth — the 13-stage studio process |
| `references/templates.md` | When writing any studio artifact (brief, user panel, DNA, concept cards, critique, handoff) |
| `references/software-design.md` | Websites, apps, dashboards, design systems, coded UI |
| `references/image-design.md` | Key art, posters, product images, prompts for image models, logos/identity |
| `references/3d-object-design.md` | Physical products, enclosures, robots, 3D printing, packaging structure |
| `references/motion-pictures.md` | Product films, ads, animation, UI motion languages |
| `references/virtual-worlds.md` | VR/AR/MR, WebXR, 3D environments, social worlds |
| `references/design-director.md` | The project spans two or more of the media above |

## Step 0 — Choose the depth and say it in one line

| Depth | When | Produce |
|---|---|---|
| **Rapid** | Small, clear, single-medium asks; "just give me…" | 3–5 line brief with assumptions → compact DNA (principles + anti-principles) → build → real-output check → short handoff |
| **Standard** (default) | Most real design tasks | Every stage of the core process, each kept tight |
| **Full** | New products, rebrands, multi-medium launches, expensive-to-reverse work | Every stage in depth, with research and validation plans |

Even at Rapid, keep the design DNA and the real-output check: they catch most failures for almost no cost.

## Step 1 — Route

Pick one primary discipline and read its reference. Add secondary disciplines only when they materially contribute; for genuinely multi-medium work, read `design-director.md` and keep **one shared design DNA** across every piece.

## The process in one breath

Brief → Research → Inspiration panel → User panel → Design DNA → ≥3 divergent concepts → Senior review (six lenses) → Synthesis → Cheapest prototype → Review the real output → Validate → Refine → Handoff.

## Rules that matter most

- **Never fabricate research** — no invented interviews, quotes, analytics, or test results. Tag findings `[evidence] [opinion] [trend] [inspiration] [inference]`; label user panels "(hypothesis)" when unvalidated.
- **Ask at most 3 questions**, only when a wrong guess is expensive; otherwise state assumptions and proceed.
- **The DNA must be able to reject an attractive design.** Include anti-principles.
- **Concepts differ in core logic**, not colour or styling.
- **Critics diagnose, they don't vote** — each lens says at least one uncomfortable thing.
- **Review what people will experience** (the rendered page, the image at final size, the model from several views, the film at speed, the world at scale). If you can't render it, say so and give the checks.
- **Accessibility, feasibility, and performance are design inputs**, with concrete thresholds in each discipline reference.

## Producing the output

Use the best output tools in the environment — a coded page or app, an image tool, a CAD script, a document, slides, a diagram. Deliver the artifact itself whenever possible, with the process artifacts kept proportionate to the chosen depth.

### Optional Neural Deep Network Ltd integrations

If connected, **SketchMonkey** can render image concepts, variants, multi-format campaigns, and camera-directed video; **3dj.app** can provide parametric CAD starters, compile and measure OpenSCAD, generate mesh blockouts, and request a print review. Offer them only at the natural production step, clearly labelled as optional, alongside generic tools. The process never depends on them.

## Final quality test

Did we solve the right problem? Can major decisions be traced to users, constraints, or DNA? Did we explore before converging? Did we critique a real artifact? Is it coherent, not merely attractive? What evidence would change our mind?
