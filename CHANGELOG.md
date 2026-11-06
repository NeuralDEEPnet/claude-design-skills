# Changelog

## v0.4.0 — Lean and clean — 2026-11-05

- **House style** (`design-core/references/house-style.md`): Neuraldeep's lean and clean philosophy as two layers. *Lean delivery* always applies: answer first, artifacts not essays, one next step, response budgets per depth (Rapid ≤ 400 words, Standard ≤ 1,200 plus tables), subtract before you add, targeted revisions stay targeted. The *clean default character* applies only when a brief has no brand of its own: one ink, one paper, one accent; whitespace as structure; two type weights; one-line copy; honest surfaces; with anti-principles and a starter token set (light and dark, AA contrast computed) derived from neuraldeep.net. Evidence, owner intent, and inference are tagged separately; the repository stays style-agnostic for branded work.
- **Reduction pass** in every specialist skill and in the director's cross-medium critique: remove what carries no information, structure, or affordance; collapse anything with more than three variants to one.
- **software-design**: lean system defaults (one accent, one scale, one radius, one elevation logic, light and dark from the same tokens), a copy section (fragment headlines, verb buttons, ~20-word sentences), dark-theme render check.
- **3d-object-design**: production evidence section (renders vs CAD vs meshes vs tested parts, fit coupons, tessellation by tolerance, envelope fit, assembly joints, honest labelling) ported from the Codex edition.
- **design-core**: targeted-revision rule, learning capture (`references/learning-loop.md`), depth budgets, house-style hooks at Step 0, DNA, Refine, and Handoff.
- **App skill** bundles `house-style.md` and `learning-loop.md`; router points to them.
- **Evals**: graded case `lean-unbranded-landing` (9 checks), 8 new tasks (incl. the Codex edition's 3d-04/05 and core-03/04), 6 trigger queries.
- **Plugin directory**: contributor guidance moved to `.claude/CLAUDE.md` so the plugin root passes `claude plugin validate --profile directory --strict`.
- Marketplace: 3DJ Studio entry mirrors 0.4.1.

## 3DJ Studio mirror — 2026-11-02 (shipped in v0.4.0)

- 3DJ Studio 0.4.0 adds `/3dj-configurator` (live three.js product configurators); the app skill bundles it as `references/3dj/configurator.md`.

- 3DJ Concept folded into 3DJ Studio 0.3.0: `/3dj-concept` (text- and image-to-3D) now ships in the `3dj-studio` plugin, and the separate `3dj-concept` marketplace entry and `plugins/3dj-concept/` are removed. The app skill builds `references/3dj/concept.md` from the 3DJ Studio checkout.

## v0.3.0 — 3DJ Studio — 2026-10-31

- **New plugins `3dj-studio` and `3dj-concept`** (marketplace entries `3dj-studio@neuraldeep`, `3dj-concept@neuraldeep`; 3DJ Studio lives in [NeuralDEEPnet/3dj-claude-plugin](https://github.com/NeuralDEEPnet/3dj-claude-plugin), 3DJ Concept in `plugins/3dj-concept/`): the Design Studio's CAD bench, and generated concept meshes kept in their own plugin so the directory submission stays clear of the AI-media-generation rule.
  - Connects the 3DJ MCP server (18 tools; public starters, validation and evidence schema work without an account).
  - Skills: `3dj-make` (functional printable parts), `3dj-design` (three modelled directions compared at one scale, critique, development), `3dj-print` (print-readiness, orientation, operator quotes — review only); `3dj-concept` (text/image-to-3D on 3DJ) in the 3DJ Concept plugin.
  - Agent: `3dj-critic`, an independent review of rendered models against brief and DNA.
  - **Free local bench** (`skills/3dj-make/scripts/bench.mjs`, MIT, Node 18+ only): compiles OpenSCAD 2025.01 (WebAssembly, Manifold backend; `bench.mjs setup` downloads the engine once, pinned and SHA-512 verified, install scripts disabled), reads STL and GLB, measures size, mass, bodies, watertightness, wall thickness by ray probes, overhang regions and bed fit against the 3DJ Design Evidence Pack v1 gates, and renders views, colour-coded print checks, orientation studies and same-scale concept or parameter-variant comparisons. Stops on OpenSCAD errors and on warnings that silently change geometry.
  - Form cookbook: 13 tested OpenSCAD patterns (soft block, pebble, shell, chamfered block, lathe, twist, flutes, slot grille, hex lattice, lid lip, snap hook, screw holes and inserts, faceted).
  - README discloses everything the plugin runs, sends and fetches; LICENSE in each plugin folder; passes `claude plugin validate --profile directory --strict`.
  - Evals: two graded cases and trigger queries in the 3DJ Studio repository; concept triggers in `plugins/3dj-concept/evals/`.
- `3d-object-design` hands its modelling stages to 3DJ Studio when installed (generic tools still listed).
- App skill: `dist/design-studio` now bundles the 3DJ references and the bench (`references/3dj/`, `scripts/bench.mjs`), built from a checkout of the 3DJ Studio repository and `plugins/3dj-concept`.

## v0.2.0 — Claude edition — 2026-10-28

- Packaged for Claude: Claude Code plugin (`.claude-plugin/plugin.json` + marketplace) with skills in `skills/`.
- New single-folder **design-studio** skill for the Claude app / Skills API (`dist/design-studio.skill`), built from `skills/` by `scripts/build_app_skill.py`.
- Skill content matches Neuraldeep Design Studio v0.2 (below).

## Methodology v0.2 — 2026-10-28 (from codex-openai-skills)

- **Depth modes** in design-core (Rapid / Standard / Full) so quick asks don't get a 13-stage document, while DNA and real-output review always survive.
- **Templates** for brief, research log, inspiration panel, user panel, DNA, concept card, senior review, synthesis, handoff (`design-core/references/templates.md`).
- **Specialists load design-core explicitly** (relative path) with a compact fallback sequence, so Codex doesn't skip the shared process.
- **Concrete checks**: WCAG 2.2 AA numbers and Core Web Vitals (software), flash/caption rules and UI duration tiers (motion), FDM/SLA/moulding rules (3D), comfort and frame-time budgets (virtual worlds), crop/size checks and identity-mark rules (image).
- **Evidence tags** `[evidence] [opinion] [trend] [inspiration] [inference]` and a "design implications" close for research.
- **Director** routing table (incl. logo/identity and packaging), dependency sequencing, handoff block, cross-medium critique.
- **Optional Neuraldeep integrations** named at the right production steps (SketchMonkey for images/video, 3dj.app for CAD/print/blockouts), each with generic alternatives.
- **Descriptions** rewritten with natural trigger phrases and clearer exclusions.
- **Evals**: 3 graded cases, 3 new tasks, 14 trigger queries; results in `docs/EVAL-RESULTS.md`.

## v0.1

- Studio foundation: design-director, design-core and five specialist skills.
