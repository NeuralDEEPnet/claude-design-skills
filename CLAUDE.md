# Repository guidance for agents

This repository contains public design skills for Claude (Claude Code plugin + Claude app skill).

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

## Quality bar

A change should make the skills more reliable, more teachable, or more useful across real projects. Avoid rules that merely encode one visual style.

## Building the app skill

`skills/` is the source of truth. After changing any skill, rebuild the single-folder app skill:

```bash
python3 scripts/build_app_skill.py && (cd dist && rm -f design-studio.skill && zip -qr design-studio.skill design-studio)
```

Edit `scripts/app_skill_SKILL.md` for the app skill's router. Skill names must not contain "claude" or "anthropic".
