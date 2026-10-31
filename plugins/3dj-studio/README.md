# 3DJ Studio — the CAD bench of the Neuraldeep Design Studio

Design and make real, printable objects with Claude. 3DJ Studio connects Claude to [3DJ](https://www.3dj.app) and adds a free local bench that compiles, measures and renders every model, so each step is something you can see — not a description.

| Say | Claude does |
|---|---|
| `/3dj-make` "a wall bracket for a 25 mm pipe, two M4 screws" | Writes a parametric model, compiles and measures it, checks it against the 3DJ print gates, shows four views and a print check, and hands over `.scad` + `.stl` with named knobs |
| `/3dj-design` "a desk headphone stand that feels premium" | Brief → design DNA → three structurally different directions compared at the same scale with silhouettes → critique → refinement → printable handoff |
| `/3dj-concept` "a squat ceramic owl" or an image link | Text- or image-to-3D concept mesh on 3DJ, followed to completion, with a one-tap workbench link |
| `/3dj-print` "will this fit my Prusa MINI?" | Watertight, wall, overhang and bed checks, best orientation, slicer starting points, and 3DJ operator print quotes (review only) |

Skills also trigger on their own when a request matches.

## What's inside

| Component | Purpose |
|---|---|
| `3dj` MCP server | The 3DJ service (`https://3dj-neuraldeepnet.on.adaptive.ai/api/mcp`) — 18 tools: parametric B-Rep and OpenSCAD starters, script validation, OpenSCAD compile and measure, text/image-to-3D, gallery, print quotes |
| `3dj-make` skill | Functional parts; holds the bench and shared references (tools, OpenSCAD rules, B-Rep, print gates, form cookbook) |
| `3dj-design` skill | The studio flow with compared directions |
| `3dj-concept` skill | Generative concept meshes |
| `3dj-print` skill | Print-readiness and operator quotes |
| `3dj-critic` agent | Independent review of rendered models against the brief and DNA |

## Free versus account

- **Free, no account**: the local bench (needs Node 18+; installs the OpenSCAD WebAssembly engine, about 11 MB, on first use into `~/.cache/3dj-bench`), and 3DJ's public tools — OpenSCAD and B-Rep starters, script validation, the evidence schema.
- **With a 3DJ account** (OAuth sign-in): hosted OpenSCAD compile (20/hour, 100/day), concept generation (hourly and daily allowance), your gallery, downloads, and print quote requests.

Sign in when a skill asks: in Claude Code run `/mcp`, choose **3dj**, then **Authenticate**; in the Claude app use Settings → Connectors → 3dj. Never paste keys into chat.

## The bench

```bash
node skills/3dj-make/scripts/bench.mjs build part.scad -D width=80 --bed 180,180,180
node skills/3dj-make/scripts/bench.mjs compare a.scad b.scad c.scad --labels "Arch,Totem,Fold"
node skills/3dj-make/scripts/bench.mjs compare lamp.scad@height=140 lamp.scad@height=180
node skills/3dj-make/scripts/bench.mjs orient part.stl --bed 256,256,256
node skills/3dj-make/scripts/bench.mjs params part.scad
```

It reads `.scad`, `.stl` and `.glb`, and writes a views sheet, a colour-coded print check, an orientation sheet or a same-scale comparison, an `.stl`, and a JSON report. Checks follow the 3DJ Design Evidence Pack v1 gates (watertight, 0.8 mm nozzle-safe and 1.2 mm recommended walls, 45° overhang, 220 × 220 × 250 mm bed). They are geometry screens, not manufacturing certification.

## Works with the Design Studio

Install alongside `neuraldeep-design-studio` from the same marketplace. Its `3d-object-design` and `design-director` skills run the full studio process; 3DJ Studio supplies the modelling, comparison and print stages. SketchMonkey renders can go straight into `/3dj-concept` as image-to-3D input.

## Privacy and boundaries

Model source, prompts and image links you choose to send go to the 3DJ service when a 3DJ tool is called; the bench runs locally. 3DJ refuses credentials and sensitive personal data in tool arguments. Quote tools create review requests and record acceptance only: no payment, print booking or shipping happens through this plugin.

Neural Deep Network Ltd · [3dj.app](https://www.3dj.app) · [support](https://www.3dj.app/support) · [privacy](https://www.3dj.app/privacy) · [terms](https://www.3dj.app/terms) · MIT licence
