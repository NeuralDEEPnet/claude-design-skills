#!/usr/bin/env python3
"""Build the single-folder `design-studio` skill for the Claude app / Skills API.

claude.ai and the Skills API accept exactly one SKILL.md per uploaded skill, so the
seven sibling skills in skills/ are folded into one skill: a router SKILL.md
(scripts/app_skill_SKILL.md) plus each skill's body as a reference file.

Usage: python scripts/build_app_skill.py            -> dist/design-studio/
       then zip it: (cd dist && zip -r design-studio.skill design-studio)
"""
import os
import re
import shutil
import sys
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

# Heritage references added in 0.5.0, with size caps in bytes (warn above the cap, fail at cap + 10%).
NEW_REFS = ("heritage.md", "heritage-ledger.md", "proportion.md", "modern-platform.md")
CAPS = {
    "core-process.md": 13300,
    "heritage.md": 10500,
    "heritage-ledger.md": 10000,
    "proportion.md": 7000,
    "modern-platform.md": 4000,
}
FORBIDDEN_FONT_PREFIXES = ("helvetica", "arial", "nimbus")


def body(text: str) -> str:
    """Drop YAML frontmatter."""
    return re.sub(r"\A---\n.*?\n---\n", "", text, count=1, flags=re.S).lstrip()


def relink(text: str) -> str:
    """Rewrite sibling-skill paths to paths inside the bundled skill."""
    text = text.replace("../design-core/references/templates.md", "templates.md")
    text = text.replace("`references/templates.md`", "`templates.md`")
    text = text.replace("../design-core/references/house-style.md", "house-style.md")
    text = text.replace("`references/house-style.md`", "`house-style.md`")
    for new in NEW_REFS:
        text = text.replace(f"../design-core/references/{new}", new)
        text = text.replace(f"`references/{new}`", f"`{new}`")
    text = text.replace("`references/learning-loop.md`", "`learning-loop.md`")
    text = text.replace("../design-core/SKILL.md", "core-process.md")
    text = text.replace("../<skill-name>/SKILL.md", "<skill-name>.md")
    text = text.replace("the repository's `docs/NEURALDEEP-INTEGRATIONS.md`",
                        "the router SKILL.md (optional integrations)")
    text = text.replace("If the **3DJ Studio** plugin is installed, hand the modelling stages to it:",
                        "For the modelling stages, use the bundled 3D bench and 3DJ references:")
    text = re.sub(r"`3dj-(make|design|concept|print|configurator)`", r"`references/3dj/\1.md`", text)
    return text


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "references").mkdir(parents=True)
    shutil.copy(ROOT / "scripts" / "app_skill_SKILL.md", OUT / "SKILL.md")
    for skill, ref in REFS.items():
        src = (SKILLS / skill / "SKILL.md").read_text()
        (OUT / "references" / ref).write_text(relink(body(src)))
    for ref in ("templates.md", "house-style.md", "learning-loop.md", *NEW_REFS):
        src = (SKILLS / "design-core" / "references" / ref).read_text()
        (OUT / "references" / ref).write_text(relink(src))
    build_3dj()
    print(f"built {OUT}")
    if not check_build():
        sys.exit(1)


def check_build() -> bool:
    """Print sizes, warn above caps, and return False on any failure (cap + 10%, stale links, font files)."""
    ok = True
    refs = OUT / "references"
    for name, cap in CAPS.items():
        f = refs / name
        if not f.exists():
            print(f"FAIL: {name} missing from the build")
            ok = False
            continue
        size = f.stat().st_size
        note = ""
        if size > cap * 1.1:
            note = f"  FAIL: over cap {cap} + 10%"
            ok = False
        elif size > cap:
            note = f"  warning: over cap {cap}"
        print(f"{name}: {size} B (cap {cap}){note}")
    for f in sorted(refs.glob("*.md")):
        if "../design-core/" in f.read_text():
            print(f"FAIL: unresolved '../design-core/' in {f.relative_to(OUT)}")
            ok = False
    for base in (SKILLS, OUT.parent):
        if not base.exists():
            continue
        for f in base.rglob("*"):
            if f.is_file() and f.name.lower().startswith(FORBIDDEN_FONT_PREFIXES):
                print(f"FAIL: forbidden font file {f}")
                ok = False
    return ok


# 3DJ Studio lives in its own repository (NeuralDEEPnet/3dj-claude-plugin). The app skill carries
# its skills as references and its free bench as a script, read from a checkout next to this
# repository or from THREEDJ_PLUGIN_DIR. Without one, the app skill is built without them.
TDJ = Path(os.environ.get("THREEDJ_PLUGIN_DIR", ROOT.parent / "3dj-claude-plugin")) / "skills"
TDJ_SKILLS = {"3dj-make": "make.md", "3dj-design": "design.md", "3dj-print": "print.md", "3dj-concept": "concept.md", "3dj-configurator": "configurator.md"}
TDJ_REFS = ["tools.md", "openscad.md", "brep-cad.md", "dfam.md", "form-cookbook.md"]


def relink_3dj(text: str) -> str:
    """Rewrite plugin-relative paths and skill names to paths inside the app skill."""
    text = text.replace(
        "If the Neuraldeep Design Studio skills are installed (`3d-object-design`, `design-core`, `design-director`), "
        "follow their process, templates and depth modes and use this skill for the modelling, comparison and print stages. "
        "Otherwise follow the compact flow below.",
        "For Standard or Full depth, follow `references/core-process.md` and `references/3d-object-design.md` with "
        "`references/templates.md`; this file covers the modelling, comparison and print stages.")
    text = text.replace("The bench lives in the sibling 3dj-make skill. ", "")
    text = text.replace("If the 3dj-make skill (3DJ Studio plugin) is available and the file can be downloaded into the workspace, look at it on its bench: `node <3dj-make folder>/scripts/bench.mjs build",
                        "If the file can be downloaded into the workspace, look at it on the bench: `node scripts/bench.mjs build")
    text = text.replace(" if it is installed", "").replace(" if 3DJ Studio is installed", "")
    text = text.replace("`scripts/bench.mjs` in this skill's folder", "`scripts/bench.mjs` in the design-studio skill folder")
    text = text.replace("`../3dj-make/scripts/bench.mjs` resolved from this skill's folder", "`scripts/bench.mjs` in the design-studio skill folder")
    text = text.replace("../3dj-make/scripts/bench.mjs", "scripts/bench.mjs")
    text = text.replace("../3dj-make/references/", "references/3dj/")
    text = re.sub(r"(?<![/\w])references/(tools|openscad|brep-cad|dfam|form-cookbook)\.md", r"references/3dj/\1.md", text)
    text = text.replace("from this plugin's `3dj` server, ", "")
    text = re.sub(r"`3dj-(make|design|concept|print|configurator)`", r"`references/3dj/\1.md`", text)
    text = re.sub(r"(?<![`/\w-])(?:the )?(?:sibling )?3dj-(make|design|concept|print|configurator)(?: skill)?\b", r"`references/3dj/\1.md`", text)
    return text


def build_3dj() -> None:
    if not TDJ.exists():
        print(f"warning: no 3DJ Studio checkout at {TDJ.parent}; building without the 3DJ references "
              "(clone NeuralDEEPnet/3dj-claude-plugin next to this repo or set THREEDJ_PLUGIN_DIR)")
        return
    (OUT / "references" / "3dj").mkdir(parents=True, exist_ok=True)
    (OUT / "scripts").mkdir(exist_ok=True)
    for skill, ref in TDJ_SKILLS.items():
        src = (TDJ / skill / "SKILL.md").read_text()
        (OUT / "references" / "3dj" / ref).write_text(relink_3dj(body(src)))
    for ref in TDJ_REFS:
        src = (TDJ / "3dj-make" / "references" / ref).read_text()
        (OUT / "references" / "3dj" / ref).write_text(relink_3dj(src))
    shutil.copy(TDJ / "3dj-make" / "scripts" / "bench.mjs", OUT / "scripts" / "bench.mjs")


if __name__ == "__main__":
    main()
