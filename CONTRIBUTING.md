# Contributing

Thank you for improving Neuraldeep Design Studio.

## Contribution types

Useful contributions include:
- improved skill workflows,
- discipline-specific references,
- design-research techniques,
- accessibility and inclusive-design guidance,
- manufacturing or implementation checks,
- evaluation tasks,
- worked examples,
- and optional tool/MCP adapters.

## Design philosophy

The repository is intentionally style-agnostic. A contribution should improve the quality of design reasoning rather than force every output toward the same visual language.

## Pull-request checklist

- The behavior is described clearly.
- The relevant `SKILL.md` remains concise enough to use operationally.
- User research is not fabricated.
- New requirements have a rationale.
- Proprietary integrations remain optional.
- At least one eval is added or updated when behavior materially changes.
- Examples distinguish facts, references, and design judgment.
- Heritage facts (dates, attributions, quotes, numbers, award criteria) enter only through `skills/design-core/references/heritage-ledger.md`, with a source URL, date and role; never from memory.

## Naming

Skill directories use lowercase kebab-case.

Each skill must begin with YAML frontmatter containing:
- `name`
- `description`

Descriptions should state when the skill should and should not trigger.
