# 3DJ Concept — sculpt from words or pictures

Turn a text prompt or an image into a 3D concept mesh with [3DJ](https://www.3dj.app): figurines, creatures, ornaments, sculptural vases, props and quick visual blockouts. Claude writes a generation prompt, starts the job on your 3DJ account, follows it to completion, and gives you the model with a one-tap link to open it in the 3DJ workbench.

```bash
/plugin install 3dj-concept --marketplace NeuralDEEPnet/claude-design-skills
```

## Requirements

- A 3DJ account (generation uses its hourly and daily allowance).
- The 3DJ connection, from the **3DJ Studio** plugin (`/plugin install 3dj-studio --marketplace NeuralDEEPnet/claude-design-skills`) or the 3dj connector in Claude. This plugin adds the skill only and declares no server of its own, so you sign in once.

## Use it

- "Make a 3D model of a squat ceramic owl with a flat base."
- "Turn this product render into 3D: https://example.com/render.png"
- "Generate three variants of the owl with different ear shapes."

## What it runs, sends and fetches

The skill calls 3DJ's tools (`get_account_status`, `list_providers`, `generate_from_text`, `generate_from_image_url`, `get_generation_status`, `get_model_download_url`). Your prompt, or the image URL you give, is sent to 3DJ, which passes it to its generation providers as described in the [3DJ privacy policy](https://www.3dj.app/privacy). Text-to-3D first creates a reference image from your prompt and then reconstructs the mesh from it. Nothing runs locally except an optional preview with the 3DJ Studio bench.

## Why it is a separate plugin

Concept meshes are AI-generated. The Claude directory lists AI media generation as an unsupported use case unless Anthropic permits it in writing, so this skill ships separately from 3DJ Studio until that is confirmed. It is available from this repository's marketplace.

Neural Deep Network Ltd · [3dj.app](https://www.3dj.app) · [privacy](https://www.3dj.app/privacy) · [terms](https://www.3dj.app/terms) · MIT licence
