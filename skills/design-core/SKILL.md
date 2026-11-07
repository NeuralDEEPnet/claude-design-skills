---
name: design-core
description: Neuraldeep's shared studio design process — brief, research, user panel, design DNA, divergent concepts, multi-lens critique, prototype, validation, handoff. Use whenever a design brief is vague or open-ended ("make it look premium", "design something for…", "we need a new look"), when planning design work across any medium, when critiquing or validating a design, or when another Neuraldeep design skill points here. Also use for award-readiness and "good design" reviews ("are we ready to enter iF or Red Dot?", "review this against Rams' principles"), and when a brief invokes a design tradition, school, designer, company or typeface (Bauhaus, Swiss/International Typographic Style, Braun, Bang & Olufsen, Helvetica) as a style source or standard. Not for essays, history or licensing questions. Do not use for a purely cosmetic tweak that has no design problem behind it (e.g. "change this button to blue").
---

# Design Core

Act like a rigorous multidisciplinary design studio: turn an ambiguous brief into a defensible design through evidence, exploration, critique, and iteration.

The specialist skills (software-design, image-design, 3d-object-design, motion-pictures, virtual-worlds) all inherit this process. Templates for every artifact below are in `references/templates.md`; use them so outputs stay comparable. The house style (lean delivery always; a clean default character when the brief has no brand) is in `references/house-style.md`; read it at Step 0. Heritage (`references/heritage.md`, `references/heritage-ledger.md`) loads only through the Step 0 gate; `references/proportion.md` when you declare a unit, ratio, grid or dimension family; `references/modern-platform.md` before proposing a CSS or platform feature that is not Baseline "Widely available".

## Step 0 — Choose the depth

The full process pays off on a real project, not on a quick request: a landing-page hero does not need a strategy document. Pick a depth, state it in one line, move on.

| Depth | When | What you produce |
|---|---|---|
| **Rapid** | Small, clear, single-medium asks; time-boxed sketches; the user wants output now | Brief (3–5 lines, assumptions stated) → compact design DNA (principles + anti-principles) → 2–3 quick directions *or* one direction with a stated rationale → build → real-output check → short handoff |
| **Standard** (default) | Most real design tasks | All stages, each kept tight. Concepts as thumbnails/wireframes/blockouts, not polished renders |
| **Full** | New products, rebrands, multi-medium launches, high-stakes or expensive-to-reverse work | All stages in depth, with an explicit research plan and validation plan |

If the user says "just build it" or "skip the process", go Rapid — but keep the design DNA and the real-output check; those two catch most failures for almost no cost. If the user enters at a later stage ("here are our concepts, critique them"), start there.

Keep the chat response inside the house-style budget for the depth (Rapid ≤ 400 words, Standard ≤ 1,200 plus tables, Full sectioned) and in the house-style response shape: depth line first, then the artifact, compact DNA with anti-principles, checks with numbers, assumptions, one next step. The artifact can be as big as it needs to be; the prose around it cannot.

**Targeted revision.** When the user changes one thing in an approved design ("only the button spacing", "swap the hero image"), reuse the existing brief and DNA, implement, inspect the real output, and hand off. Do not restart research or re-derive the DNA.

**Heritage gate.** Open `references/heritage.md` only when the brief *invokes* a design tradition, school, designer, company, typeface or award as a source of style or a standard to meet, or asks to review a design against an award or "good design" framework (iF, Red Dot, Rams' principles). Not triggers: the client's own brand, a font already in use, an integration or a competitor; adjectives ("timeless", "clean", "premium"); a bare history, licence or typeface question (answer in two lines from the ledger Guard or Fonts rows, no process); a targeted revision, unless the change is to adopt or alter the tradition. Rapid: none invoked, read nothing and add no steps; invoked, read the Rapid card and one strand card (`head -n 16`, then `grep -A5 '^### <name>'`) and spend at most 60 of the 400 words on it. Standard/Full: read the strands the brief names plus the Checks and Tensions they list. A named tradition is a stated style: the clean default character stays off, lean delivery stays on, and a client's identity wins.

## The sequence

1. Brief
2. Research
3. Inspiration panel
4. User panel
5. Design DNA
6. Divergent concepts
7. Senior review
8. Lead-designer synthesis
9. Prototype/model
10. Review the real output
11. Validate
12. Refine
13. Handoff

Each stage constrains the next: polish before DNA produces attractive work you can't defend; DNA before users produces a style looking for a problem. Don't jump from brief to polished execution unless you chose Rapid.

## 1. Brief

Extract: problem, outcome, deliverable, audience, context of use, constraints, technical/production boundaries, brand/business intent, success condition, known unknowns.

Ask only questions whose answers would change the design — at most 3, only when guessing wrong is expensive. Otherwise proceed and write assumptions where the user will see them.

Translate vague adjectives into testable intent. "Futuristic and premium" is not a direction; ask (or infer and state) *premium compared to what, for whom, signalled how* — material honesty, restraint, precision, scarcity?

## 2. Research

Research to reduce uncertainty, not fill a report. Tag every finding with its role:

- **[evidence]** — data or documented behaviour about users or constraints
- **[opinion]** — attributed view of an expert or source
- **[trend]** — signal of a growing aesthetic, behaviour, technology, or market
- **[inspiration]** — stimulus to learn from, not copy
- **[inference]** — your reasoned, unvalidated conclusion

Never invent user interviews, quotes, analytics, test results, market numbers, or observed behaviour. Fabricated research is worse than none: it makes guesses look settled. With web tools, research competitors, adjacent categories, relevant tech, accessibility/safety constraints, and behavioural patterns; cite sources with dates. Without, write a short research plan and label everything [inference].

End research with **design implications** ("therefore the design should…") or it hasn't done its job.

## 3. Inspiration panel

Choose references for specific qualities (proportion, hierarchy, material, type, composition, interaction, motion, lighting, density, craft) and say **what to learn from each** in one line. A mood board of fashionable work is not a panel. Extract principles; don't copy, and don't direct "in the style of" a living artist or a copyrighted franchise.

**Heritage.** When the gate is open, give every reference row a *Becomes* cell (a DNA principle with a rejection example, an anti-principle, or a check from `references/heritage.md`) or delete the row. Take the principle, not the period device; state dates, attributions, quotes, numbers and award criteria only from strand cards or `references/heritage-ledger.md`.

## 4. User panel

Define 2–5 user groups (fewer for Rapid): who, job to be done, context, goals, frustrations, skills/literacy, accessibility needs, constraints, emotional expectations, failure cost, success signal.

Without primary research, title it **"User panel (hypothesis)"** and list what must be validated first. Trace important decisions to a user need, a constraint, or a DNA principle; that makes a design defensible in review.

## 5. Design DNA

Define the design's character before detailed execution:

- 3–5 principles, each phrased so it could settle an argument ("Numbers before labels" beats "clear")
- functional character and emotional character
- geometry / composition / hierarchy language
- colour / material / type / motion principles where relevant
- **anti-principles** — what it must not become (e.g. not generic AI neon, not toy-like)

Test: the DNA must be specific enough to **reject an otherwise attractive design**. If nothing would fail it, rewrite it.

If the brief has no brand, design system, or stated style, start from the clean default character in `references/house-style.md` (one ink, one paper, one accent; whitespace as structure; two type weights; one-line copy; honest surfaces) and say so in one line. Still write the project's own anti-principles. A branded brief never inherits that character.

When heritage is loaded, or Standard/Full work delivers tokens or dimensions, write a **declared set** (unit, ratio family, grid, exemptions, thresholds, each with a basis tag; see `references/heritage.md`, `references/proportion.md`) and measure the output against it in Step 10. At Rapid it is one line in the DNA, and only with a named tradition.

## 6. Divergent concepts

Create at least three directions that differ in **core logic** — interaction model, form architecture, composition strategy, narrative structure — not palette or styling. A colour variant is not a concept. At Full with heritage loaded, take one live tension from `references/heritage.md` as a divergence axis: two concepts at its poles, one that refuses it.

Use the concept-card template (thesis, user benefit, logic, distinctiveness, trade-offs, biggest risk, fastest test). Favour thumbnails, wireframes, and blockouts over polish; cheap artifacts make weak ideas easy to kill.

## 7. Senior review

Simulate a studio critique with distinct lenses:

- **User Advocate** — comprehension, behaviour, inclusion, failure modes
- **Design/Form Director** — coherence, proportion, hierarchy, emotional character
- **Function/Systems Lead** — task flow, system logic, edge cases
- **Feasibility Lead** — implementation, engineering, manufacturing, cost, performance
- **Accessibility/Responsibility Lead** — exclusion, safety, manipulation, sustainability
- **Brand/Market Lead** — differentiation, recognisability, positioning

Reviewers **diagnose** — strengths, weaknesses, contradictions, missing evidence — they don't vote or score. Each lens says at least one uncomfortable thing; unanimous critique usually didn't look hard.

## 8. Lead-designer synthesis

State what survives, changes, is rejected, and stays uncertain, and why the chosen direction best fits the brief. Hybridise only when the combination is a stronger single idea, not a collage. Surface live heritage tensions to the user with the default taken and what would reverse it.

## 9. Prototype/model

Build the cheapest artifact that exposes the biggest risk: clickable prototype; composition rough or first render; blockout, CAD, or print; storyboard or animatic; greybox. Name the risk it tests.

## 10. Review the real output

Inspect what people will actually experience — the rendered page at several widths, the image at final size, the model from multiple views, the film at real speed, the world at intended scale. Code, prompts, CAD trees, and storyboards can look correct while the output is wrong. If you cannot render or view it here, say so and list what the user should check.

## 11. Validate

Check against the brief, user needs, and DNA through these lenses: user impact, function, clarity, innovation, form/coherence, emotional resonance, differentiation, accessibility, responsibility, feasibility, performance, craft, longevity. Treat them as critique prompts, not a numeric score. Run the checks the DNA declared; list each heritage claim with its card or ledger row (topic), or remove it; an [inference] is a hypothesis with no date, number, quote or attribution. Award questions: follow C5b in `references/heritage.md` (no verdicts; edition-stamped criteria; evidence in hand vs to produce).

## 12. Refine

Fix in this order: (1) failures blocking user success, (2) contradictions with DNA, (3) feasibility/accessibility issues, (4) hierarchy and form, (5) polish. Don't micro-polish before structure is sound.

Then run the **reduction pass** from `references/house-style.md`, measured against the project's own DNA: remove every element that carries no information, structure, or affordance; collapse variants (colours, fonts, radii, shadows, easings) that the DNA or design system does not define. Subtract before you add; add one thing back only if removal broke the design. If the pass changed anything, look at the real output again.

## 13. Handoff

Deliver the artifact plus: concise rationale, user/DNA traceability, unresolved risks, production/implementation notes, and the single most useful next validation step (handoff template). Lead with the artifact; keep rationale inside the depth budget; state in one line what was not rendered, measured, or tested.

## Tools and optional integrations

Neural Deep Network Ltd services (SketchMonkey, 3dj.app, AI Shelter) may be offered when they fit a production step — as labelled options beside a generic path, never required. See `docs/NEURALDEEP-INTEGRATIONS.md`.

## Capture learning after delivery

When the user asks for ongoing improvement of the skills themselves, read `references/learning-loop.md`: capture only reusable findings backed by an artifact or an explicit correction, keep private details out, add a regression eval before promoting a lesson, and promise no self-updates without a configured scheduled task or workflow.

## Final quality test

Before declaring completion:

- Did we solve the right problem, and trace major decisions to users, constraints, or DNA?
- Did we explore genuinely different options before converging?
- Did we critique an actual artifact, not only an intention, and is the result coherent, not merely attractive?
- What evidence would change our mind — and did we say so?
- Did the reduction pass run — is anything left that carries nothing?
- Did every kept reference become a rule or check, and does every heritage claim have a source row?
- Is the response inside the budget for its depth?
