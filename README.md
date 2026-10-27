# Claude Design Skills — Neuraldeep Design Studio

A professional, multidisciplinary design process for Claude, created and maintained by **Neural Deep Network Ltd**.

It adapts an industrial-design studio process to software, images, 3D objects, motion pictures, and virtual worlds. The aim is not to make Claude decorate outputs, but to make it **design deliberately**: understand the brief, research users honestly, establish a design DNA, explore genuinely different directions, critique, prototype, review the real output, and refine.

Sister project for OpenAI Codex: [codex-openai-skills](https://github.com/NeuralDEEPnet/codex-openai-skills).

## Install

**Claude app (claude.ai, desktop, mobile)** — download [`dist/design-studio.skill`](dist/design-studio.skill) and add it from your Claude skills settings (or, when it appears as a file in a chat, choose *Save skill*). It's a single skill that bundles all seven below.

**Claude Code**

```bash
/plugin marketplace add NeuralDEEPnet/claude-design-skills
/plugin install neuraldeep-design-studio@neuraldeep
```

Or copy any folder from `skills/` into `~/.claude/skills/` (keep `design-core` alongside the others — the specialists read it).

**Claude API / Agent SDK** — upload `dist/design-studio` via the Skills API.

## Skills

| Skill | Use for |
|---|---|
| **design-director** | Multi-medium projects — routes, sequences, keeps one design DNA |
| **design-core** | The shared studio process, depth modes, and templates |
| **software-design** | Websites, apps, dashboards, design systems, coded UI |
| **image-design** | Key art, posters, product imagery, image-model prompts, identity marks |
| **3d-object-design** | Physical and 3D-printable products, enclosures, CMF, manufacturing |
| **motion-pictures** | Product films, ads, animation, UI motion languages |
| **virtual-worlds** | VR/AR/MR, WebXR, 3D environments, social worlds |

## Core process

**Brief → Research → Inspiration Panel → User Panel → Design DNA → Divergent Concepts → Senior Review → Synthesis → Prototype → Real-output Review → Validation → Refinement → Handoff**

Scaled by depth:

- **Rapid** — small, clear asks: short brief with assumptions, compact DNA, build, real-output check.
- **Standard** (default) — every stage, kept tight.
- **Full** — new products, rebrands, multi-medium launches.

## Principles

1. User evidence before aesthetics.
2. Design character before detail.
3. Diverge before converging.
4. Critique the artifact, not only the idea.
5. Trace important decisions to user needs, constraints, or design DNA.
6. Prototype early enough that mistakes are cheap.
7. Trends are evidence or inspiration, never a substitute for thinking.
8. Coherent systems over isolated beautiful screens or objects.
9. Accessibility, responsibility, feasibility, and performance are inputs, not cleanup.
10. Be explicit about uncertainty. Never fabricate user research.

## Optional Neuraldeep integrations

Fully usable without proprietary services. Where they fit a production step, the skills may offer **SketchMonkey** (image concepts, campaigns, camera-directed video) and **3dj.app** (parametric CAD, OpenSCAD compile, mesh blockouts, print review) — always labelled optional, always with generic alternatives. See [docs/NEURALDEEP-INTEGRATIONS.md](docs/NEURALDEEP-INTEGRATIONS.md).

## Evaluation

`evals/` holds a prompt suite, graded cases in the `claude plugin eval` layout (`evals/cases/`), and trigger tests. In a Sonnet A/B run, v0.2 passed 100% of graded checks vs 70% for v0.1 — details and caveats in [docs/EVAL-RESULTS.md](docs/EVAL-RESULTS.md).

```bash
claude plugin eval skills/<skill-name>   # requires Claude Code
```

## Development

`skills/` is the source of truth. Rebuild the app skill after any change:

```bash
python3 scripts/build_app_skill.py && (cd dist && rm -f design-studio.skill && zip -qr design-studio.skill design-studio)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

MIT — see [LICENSE](LICENSE).
