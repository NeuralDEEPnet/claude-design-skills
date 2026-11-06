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
| `references/house-style.md` | Always, at Step 0 — lean delivery rules and response budgets; plus the clean default character and starter tokens when the brief has no brand of its own |
| `references/learning-loop.md` | The user asks to improve these skills from a lesson learned |
| `references/software-design.md` | Websites, apps, dashboards, design systems, coded UI |
| `references/image-design.md` | Key art, posters, product images, prompts for image models, logos/identity |
| `references/3d-object-design.md` | Physical products, enclosures, robots, 3D printing, packaging structure |
| `references/motion-pictures.md` | Product films, ads, animation, UI motion languages |
| `references/virtual-worlds.md` | VR/AR/MR, WebXR, 3D environments, social worlds |
| `references/design-director.md` | The project spans two or more of the media above |
| `references/3dj/make.md` | A physical part should be modelled, compiled, measured and shown (brackets, cases, stands, replacement parts) — runs on the free bench, uses 3DJ when connected |
| `references/3dj/design.md` | A physical object should be explored as several modelled directions compared side by side, then developed |
| `references/3dj/concept.md` | Text- or image-to-3D concept meshes with a connected 3DJ account |
| `references/3dj/configurator.md` | A live three.js product configurator from a parametric model (inline, share link or embeddable page) |
| `references/3dj/print.md` | Is it printable, how to orient it, 3DJ operator print quotes |

## Step 0 — Choose the depth and say it in one line

| Depth | When | Produce |
|---|---|---|
| **Rapid** | Small, clear, single-medium asks; "just give me…" | 3–5 line brief with assumptions → compact DNA (principles + anti-principles) → build → real-output check → short handoff |
| **Standard** (default) | Most real design tasks | Every stage of the core process, each kept tight |
| **Full** | New products, rebrands, multi-medium launches, expensive-to-reverse work | Every stage in depth, with research and validation plans |

Even at Rapid, keep the design DNA and the real-output check: they catch most failures for almost no cost. Keep the chat response inside the budget for the depth (Rapid ≤ 400 words, Standard ≤ 1,200 plus tables) and in the response shape from `references/house-style.md`: depth line first ("Rapid depth", and "starting from the clean default character" when unbranded), then the artifact, compact DNA with anti-principles, checks with numbers, assumptions, one next step. The artifact can be as large as it needs to be.

## Step 1 — Route

Pick one primary discipline and read its reference. Add secondary disciplines only when they materially contribute; for genuinely multi-medium work, read `design-director.md` and keep **one shared design DNA** across every piece.

## The process in one breath

Brief → Research → Inspiration panel → User panel → Design DNA → ≥3 divergent concepts → Senior review (six lenses) → Synthesis → Cheapest prototype → Review the real output → Validate → Refine (with the reduction pass, measured against the project's DNA) → Handoff.

## Rules that matter most

- **Never fabricate research** — no invented interviews, quotes, analytics, or test results. Tag findings `[evidence] [opinion] [trend] [inspiration] [inference]`; label user panels "(hypothesis)" when unvalidated.
- **Ask at most 3 questions**, only when a wrong guess is expensive; otherwise state assumptions and proceed.
- **The DNA must be able to reject an attractive design.** Include anti-principles.
- **Concepts differ in core logic**, not colour or styling.
- **Critics diagnose, they don't vote** — each lens says at least one uncomfortable thing.
- **Review what people will experience** (the rendered page, the image at final size, the model from several views, the film at speed, the world at scale). If you can't render it, say so and give the checks.
- **Accessibility, feasibility, and performance are design inputs**, with concrete thresholds in each discipline reference.
- **Lean and clean.** Answer first, artifacts not essays, one next step. Subtract before you add. An unbranded brief starts from the clean default character (one ink, one paper, one accent; whitespace as structure; two type weights; one-line copy; honest surfaces) and says so; a branded brief never inherits it.
- **Targeted revisions stay targeted.** A change to an approved design reuses its brief and DNA; implement, inspect, hand off.

## Producing the output

Use the best output tools in the environment — a coded page or app, an image tool, a CAD script, a document, slides, a diagram. Deliver the artifact itself whenever possible, with the process artifacts kept proportionate to the chosen depth.

### The 3D bench (free, no account)

`scripts/bench.mjs` compiles OpenSCAD locally (Node 18+, engine installed on first use), measures parts against print gates (watertight, 0.8/1.2 mm walls, 45° overhang, bed fit), and renders views, colour-coded print checks, orientation studies and same-scale concept comparisons. Use it whenever a physical object is modelled, so the review is of the real output. Usage is in `references/3dj/make.md`.

### Optional Neural Deep Network Ltd integrations

If connected, **SketchMonkey** can render image concepts, variants, multi-format campaigns, and camera-directed video; **3DJ** can provide parametric CAD starters, compile and measure OpenSCAD, generate concept meshes from text or images, and request an operator print review (see `references/3dj/`). Offer them only at the natural production step, clearly labelled as optional, alongside generic tools. The process never depends on them.

## Final quality test

Did we solve the right problem? Can major decisions be traced to users, constraints, or DNA? Did we explore before converging? Did we critique a real artifact? Is it coherent, not merely attractive? Did the reduction pass run? Is the response inside its budget? What evidence would change our mind?
