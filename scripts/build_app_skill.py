#!/usr/bin/env python3
"""Build the single-folder `design-studio` skill for the Claude app / Skills API.

claude.ai and the Skills API accept exactly one SKILL.md per uploaded skill, so the
seven sibling skills in skills/ are folded into one skill: a router SKILL.md
(scripts/app_skill_SKILL.md) plus each skill's body as a reference file.

Usage: python scripts/build_app_skill.py            -> dist/design-studio/
       then zip it: (cd dist && zip -r design-studio.skill design-studio)
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
OUT = ROOT / "dist" / "design-studio"

REFS = {
    "design-core": "core-process.md",
    "design-director": "design-director.md",
    "software-design": "software-design.md",
    "image-design": "image-design.md",
    "3d-object-design": "3d-object-design.md",
    "motion-pictures": "motion-pictures.md",
    "virtual-worlds": "virtual-worlds.md",
}


def body(text: str) -> str:
    """Drop YAML frontmatter."""
    return re.sub(r"\A---\n.*?\n---\n", "", text, count=1, flags=re.S).lstrip()


def relink(text: str) -> str:
    """Rewrite sibling-skill paths to paths inside the bundled skill."""
    text = text.replace("../design-core/references/templates.md", "templates.md")
    text = text.replace("`references/templates.md`", "`templates.md`")
    text = text.replace("../design-core/SKILL.md", "core-process.md")
    text = text.replace("../<skill-name>/SKILL.md", "<skill-name>.md")
    text = text.replace("the repository's `docs/NEURALDEEP-INTEGRATIONS.md`",
                        "the router SKILL.md (optional integrations)")
    return text


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "references").mkdir(parents=True)
    shutil.copy(ROOT / "scripts" / "app_skill_SKILL.md", OUT / "SKILL.md")
    for skill, ref in REFS.items():
        src = (SKILLS / skill / "SKILL.md").read_text()
        (OUT / "references" / ref).write_text(relink(body(src)))
    shutil.copy(SKILLS / "design-core" / "references" / "templates.md",
                OUT / "references" / "templates.md")
    print(f"built {OUT}")


if __name__ == "__main__":
    main()
