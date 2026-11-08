# Repository guidance for agents

This repository contains public design skills for Claude (Claude Code plugin + Claude app skill). This file lives in `.claude/` rather than the repository root so the plugin root passes `claude plugin validate --profile directory --strict`; keep it here.

## When changing a skill

1. Preserve the distinction between shared methodology and discipline-specific execution.
2. Keep each `SKILL.md` operational: tell the agent what to do, in what order, what artifacts to create, and how to check its work.
3. Do not turn the skills into vague design philosophy or prompt collections.
4. Do not require a proprietary Neuraldeep service for the core workflow.
5. When adding an optional service, provide a generic fallback path.
6. Add or update an eval whenever a behavioral change is substantial.
7. Prefer evidence-backed design guidance over trend imitation.
8. Do not invent research participants, interviews, usability results, analytics, or market data.
9. For public-facing research, separate:
   - observed evidence,
   - attributed opinion,
   - trend signal,
   - inspiration,
   - and agent inference.
10. Keep specialist skills composable. Hybrid tasks should be coordinated through `design-director`.
11. Keep the house style (`skills/design-core/references/house-style.md`) in two layers: lean delivery always; the clean default character only for unbranded briefs. Never let it override a client's own identity.
12. The Codex edition (`NeuralDEEPnet/codex-openai-skills`, `.agents/skills/`) is a sister project with similar skill bodies. Port ideas to it as inspiration when useful; it is not a byte-for-byte mirror.
13. Heritage facts come from `skills/design-core/references/heritage-ledger.md`, whose ids resolve to `docs/heritage/verified-research.md`; add a row only with a source URL, date and role, and re-check `modern-platform.md` after 60 days.

## Quality bar

A change should make the skills more reliable, more teachable, or more useful across real projects. Avoid rules that merely encode one visual style.

## Building the app skill

`skills/` is the source of truth. After changing any skill, rebuild the single-folder app skill:

```bash
python3 scripts/build_app_skill.py && (cd dist && rm -f design-studio.skill && zip -qr design-studio.skill design-studio)
```

Edit `scripts/app_skill_SKILL.md` for the app skill's router. Skill names must not contain "claude" or "anthropic".

Validate before release:

```bash
claude plugin validate --profile directory --strict .
```

The app skill also bundles 3DJ Studio's references and bench. They come from a checkout of `NeuralDEEPnet/3dj-claude-plugin` next to this repository (or `THREEDJ_PLUGIN_DIR`); 3DJ Studio itself is maintained in that repository, not here.
