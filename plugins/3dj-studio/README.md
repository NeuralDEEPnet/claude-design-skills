# 3DJ Studio — the CAD bench of the Neuraldeep Design Studio

Design and make real, printable objects with Claude. 3DJ Studio connects Claude to [3DJ](https://www.3dj.app), Neural Deep Network Ltd's parametric CAD workbench, and adds a free local bench that compiles, measures and renders every model — so each step is something you can see, not a description.

```bash
/plugin install 3dj-studio --marketplace NeuralDEEPnet/claude-design-skills
```

## What you can ask

| Say | Claude does |
|---|---|
| `/3dj-make` "A wall bracket that holds a 25 mm pipe 30 mm off the wall, two M4 screws, printed in PETG." | Writes a parametric model, compiles and measures it, checks it against the 3DJ print gates, shows four views and a print check, and hands over `.scad` + `.stl` with named knobs |
| `/3dj-design` "A desk headphone stand that feels premium — show me some directions first." | Brief → design DNA → three structurally different directions compared at the same scale with silhouettes and a stand-in of the headphones → critique → development → printable handoff |
| `/3dj-print` "Will this STL fit my Prusa MINI, and how should I orient it?" | Watertight, wall, overhang and bed checks, the best orientation, slicer starting points, and — on request — a 3DJ operator print quote review |

Skills also start on their own when a request matches.

## What's inside

| Component | Purpose |
|---|---|
| `3dj` MCP server | The 3DJ service (`https://3dj-neuraldeepnet.on.adaptive.ai/api/mcp`): OpenSCAD and B-Rep CAD starters, script validation, OpenSCAD compile and measure, your saved models and downloads, print quote requests |
| `3dj-make` skill | Functional printable parts; holds the bench and shared references (3DJ tools, OpenSCAD rules, B-Rep CAD, print gates, form cookbook) |
| `3dj-design` skill | The studio flow with compared directions |
| `3dj-print` skill | Print-readiness, orientation and operator quote reviews |
| `3dj-critic` agent | Independent review of rendered models against the brief and design DNA |

Text- and image-to-3D concept meshes are a separate plugin, `3dj-concept`, in the same marketplace.

## Free versus account

- **Free, no account**: the local bench, and 3DJ's public tools — OpenSCAD and B-Rep starters, script validation, the evidence schema.
- **With a 3DJ account** (OAuth sign-in): hosted OpenSCAD compile (20 per hour, 100 per day), your gallery and downloads, and print quote requests.

Sign in when a skill asks: in Claude Code run `/mcp`, choose **3dj**, then **Authenticate**; in the Claude app use Settings → Connectors → 3dj. Never paste keys into chat.

## The bench

```bash
node skills/3dj-make/scripts/bench.mjs setup                      # once, before the first .scad build
node skills/3dj-make/scripts/bench.mjs build part.scad -D width=80 --bed 180,180,180
node skills/3dj-make/scripts/bench.mjs compare a.scad b.scad c.scad --labels "Lean,Loop,Block"
node skills/3dj-make/scripts/bench.mjs compare lamp.scad@height=140 lamp.scad@height=180
node skills/3dj-make/scripts/bench.mjs orient part.stl --bed 256,256,256
```

It reads `.scad`, `.stl` and `.glb`, and writes a views sheet, a colour-coded print check, an orientation sheet or a same-scale comparison, an `.stl`, and a JSON report. Checks follow the 3DJ Design Evidence Pack v1 gates: watertight, 0.8 mm nozzle-safe and 1.2 mm recommended walls, 45° overhang, 220 × 220 × 250 mm bed. They are geometry screens, not manufacturing certification.

## What this plugin runs, sends and fetches

- **Runs locally**: the bench (`skills/3dj-make/scripts/bench.mjs`, readable source, MIT). It reads the model files you point it at and writes its images, STL and report next to them. It sends nothing anywhere.
- **Fetches once, with your agreement**: `bench.mjs setup` downloads the OpenSCAD WebAssembly engine, `openscad-wasm-prebuilt` 1.2.0 (about 11 MB, OpenSCAD is GPL-2.0), from the public npm registry into `~/.cache/3dj-bench`, with install scripts disabled, and refuses to use it unless its SHA-512 matches the hash pinned in the script. Claude asks before running it. Nothing else is downloaded.
- **Sends to 3DJ, only when a 3DJ tool is called**: the OpenSCAD or CAD script source and parameters you ask it to compile or validate, the model ids you ask about, and, for a quote request, the model, dimensions, material, colour, quantity, intended use and destination country and region (never a street address or payment details). 3DJ's handling of that data is described in its [privacy policy](https://www.3dj.app/privacy).
- **No telemetry**, no credentials read from your machine, and no other network destinations.

## Privacy

The local bench keeps everything on your machine. Data sent to the 3DJ service is covered by the [3DJ privacy policy](https://www.3dj.app/privacy) (Neural Deep Network Ltd, 3d@neuraldeep.net). 3DJ refuses credentials and sensitive personal data in tool arguments.

## Works with the Design Studio

Install alongside `neuraldeep-design-studio` from the same marketplace. Its `3d-object-design` and `design-director` skills run the full studio process; 3DJ Studio supplies the modelling, comparison and print stages.

## Boundaries

Quote tools create review requests and record acceptance of operator-issued terms only, after you confirm: no payment, print booking or shipping happens through this plugin. Bench and 3DJ checks do not certify strength, safety or manufacturability.

Neural Deep Network Ltd · [3dj.app](https://www.3dj.app) · [support](https://www.3dj.app/support) · [privacy](https://www.3dj.app/privacy) · [terms](https://www.3dj.app/terms) · MIT licence
