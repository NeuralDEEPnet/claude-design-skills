---
name: 3dj-concept
description: Generate an organic or sculptural 3D concept mesh with 3DJ from a text prompt or an image — figurines, creatures, ornaments, sculptural vases, characters, props, and quick visual blockouts, including turning a SketchMonkey render or product sketch into 3D. Starts the job, follows it to completion, and returns the model with a one-tap link to open it in the 3DJ workbench. Use for "turn this picture into 3D", "make a 3D model of a dragon", "sculpt a…", "image to 3D", "text to 3D". Needs a signed-in 3DJ account; for measured, functional parts use 3dj-make instead.
---

# 3DJ Concept — sculpt from words or pictures

Concept meshes are for look, feel and silhouette: fast, expressive, non-parametric GLB files without reliable real-world units. They are not for fit-critical parts. When the request needs measured interfaces (a socket, a mount, a lid), use 3dj-make for that part and treat the concept as the decorative element.

Tool details and routes: `../3dj-make/references/tools.md`. Below, `BENCH` means the absolute path of `../3dj-make/scripts/bench.mjs` resolved from this skill's folder.

## 1 · Check the account and capacity

Call `get_account_status` and `list_providers` (remaining hourly and daily allowance, which inputs are healthy).

- **Not signed in**: say how to connect (Claude app: Settings → Connectors → 3dj; Claude Code: `/mcp` → 3dj → Authenticate) and offer the free route meanwhile — sculpt it in OpenSCAD with cookbook patterns 2 (pebble), 5 (lathe), 6 (twist) or 13 (faceted) through 3dj-make.
- **No allowance or providers down**: report the real status and when allowance resets if the tool says; do not retry in a loop.

## 2 · Write the generation prompt

One object, whole and centred, nothing else. Lead with silhouette and proportion, then the defining features, then material character and style. Add "single solid object, flat base" when it should stand or be printed. Avoid scenes, backgrounds, text, multiple objects, and cut-off views. Put unwanted traits in `negativePrompt`. Show the prompt in one line before starting.

> a squat ceramic owl, wide round body tapering to small ears, oversized almond eyes, folded wing grooves, glossy glaze look, single solid object, flat base

**From an image** (`generate_from_image_url`): it needs a direct, public HTTPS image URL (12 MB or less) of one object on a clean background, ideally a three-quarter view. A SketchMonkey `render_concept` result URL works directly — that is the Design Studio pipeline: brief → render → 3D. Never upload a private attachment somewhere public to obtain a URL; ask the person for a link instead.

## 3 · Start and follow the job

1. `generate_from_text { prompt, negativePrompt? }` or `generate_from_image_url { imageUrl, name? }` → `modelId`. Tell the person it has started; do not promise a duration the tool did not give.
2. Poll `get_generation_status { modelId }` about every 20–30 seconds. Speak only at meaningful changes. A started job is not a finished model.
3. On `failed`, pass on the real reason; offer a retry only when the reason says it is retryable.
4. On `complete`, call `get_model_download_url { modelId }` and report the actual `format` and `downloadUrl`.

## 4 · Hand it over

- The download link, and the viewer link: `https://www.3dj.app/workspace?modelUrl=<URL-encoded downloadUrl>`.
- If the file can be downloaded into the workspace, look at it on the bench: `node BENCH build model.glb --fit <longest side in mm>` → views and print check. Generated meshes are often not watertight; report what the check found instead of assuming. If downloading is blocked, say the preview is in the workbench link.
- Say what it is: a concept mesh (GLB), unitless until scaled, not a parametric or print-certified part. `refinementHandoff`, when returned, tells the workbench how to continue refining it.
- Next moves: scale it to size, generate a variant (change one thing in the prompt), add a measured base or mount with 3dj-make, or check printing with 3dj-print.
