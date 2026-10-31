# Changelog

## v0.3.0 — 3DJ Studio — 2026-10-31

- **New plugin `3dj-studio`** (`plugins/3dj-studio/`, marketplace entry `3dj-studio@neuraldeep`): the Design Studio's CAD bench.
  - Connects the 3DJ MCP server (18 tools; public starters, validation and evidence schema work without an account).
  - Skills: `3dj-make` (functional printable parts), `3dj-design` (three modelled directions compared at one scale, critique, development), `3dj-concept` (text/image-to-3D on 3DJ), `3dj-print` (print-readiness, orientation, operator quotes — review only).
  - Agent: `3dj-critic`, an independent review of rendered models against brief and DNA.
  - **Free local bench** (`skills/3dj-make/scripts/bench.mjs`, MIT, Node 18+ only): compiles OpenSCAD 2025.01 (WebAssembly, Manifold backend, installed on first use), reads STL and GLB, measures size, mass, bodies, watertightness, wall thickness by ray probes, overhang regions and bed fit against the 3DJ Design Evidence Pack v1 gates, and renders views, colour-coded print checks, orientation studies and same-scale concept or parameter-variant comparisons. Stops on OpenSCAD errors and on warnings that silently change geometry.
  - Form cookbook: 13 tested OpenSCAD patterns (soft block, pebble, shell, chamfered block, lathe, twist, flutes, slot grille, hex lattice, lid lip, snap hook, screw holes and inserts, faceted).
  - Evals: two graded cases and trigger queries in `plugins/3dj-studio/evals/`.
- `3d-object-design` hands its modelling stages to 3DJ Studio when installed (generic tools still listed).
- App skill: `dist/design-studio` now bundles the 3DJ references and the bench (`references/3dj/`, `scripts/bench.mjs`), built from the plugin sources.

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
