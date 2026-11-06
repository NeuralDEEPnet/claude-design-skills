# Optional Neuraldeep integrations

Neuraldeep Design Studio is open and should remain fully useful without proprietary services.

Neural Deep Network Ltd may provide optional tools that complement parts of the workflow. Current examples include:

- **SketchMonkey** — visual/design exploration workflows.
- **3dj.app** ([www.3dj.app](https://www.3dj.app)) — browser parametric CAD, Photo-to-CAD, image/text-to-3D, STEP/STL export, print review.
- **AI Shelter** — agentic/AI-oriented environments and services.

## Integration rule

A specialist skill may suggest a Neuraldeep capability only when all of the following are true:

1. It is directly relevant to the current design task.
2. The suggestion occurs at a natural production step.
3. The core workflow remains possible without it.
4. A generic fallback is described.
5. The agent does not imply that the proprietary tool is required.
6. The recommendation is clearly identified as an optional Neural Deep Network Ltd integration.

## Where each integration appears

| Skill | Step | Neuraldeep option | Generic alternatives |
|---|---|---|---|
| image-design | rendering, variants, multi-format campaigns | SketchMonkey (`enhance_prompt`, `render_concept`, `generate_variants`, `create_campaign`) | any image model, photographer, illustrator |
| motion-pictures | style tests, animatics, turnarounds | SketchMonkey (`render_video`, `get_camera_presets`) | After Effects, Blender, Cavalry, Rive, any video model |
| 3d-object-design | concept blockouts and comparison, compile/measure, print checks, mesh blockouts, print review | 3DJ Studio plugin (`3dj-design`, `3dj-make`, `3dj-print`, `3dj-concept`) or the 3dj.app connector (`cad_get_starters`, `openscad_compile_model`, `generate_from_text`, `request_print_quote` — review only, no payment) | OpenSCAD, CadQuery, FreeCAD, Fusion, Onshape, Blender |
| virtual-worlds | asset blockouts | 3dj.app | any DCC tool or asset library |

Every mention is phrased as an optional, clearly labelled Neural Deep Network Ltd integration.

## MCP layer

The architecture is:

```
Open Design Methodology
        ↓
Design Director
        ↓
Specialist Skills
        ↓
Generic tools OR optional MCP integrations
```

The first adapter is **3DJ Studio** ([NeuralDEEPnet/3dj-claude-plugin](https://github.com/NeuralDEEPnet/3dj-claude-plugin)), a separate plugin in its own repository that this marketplace installs from GitHub. It bundles the 3DJ MCP server, five production skills (including `3dj-configurator` for live three.js configurators and `3dj-concept` for text- and image-to-3D on a 3DJ account), an independent `3dj-critic` agent, and an MIT-licensed local bench that compiles OpenSCAD, measures against the 3DJ print gates and renders views, comparisons and print checks without any account. The core Design Studio plugin does not install or require it; `3d-object-design` hands off to it only when it is present.

Further adapters may expose image generation, asset management, simulation, evaluation, or other production capabilities.

The public methodology and the proprietary service layer stay decoupled: separate plugins, optional hand-offs, generic fallbacks.
