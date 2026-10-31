# 3DJ tools, routes and limits

Verified against the 3DJ MCP server (v1.1, 18 tools, endpoint `https://3dj-neuraldeepnet.on.adaptive.ai/api/mcp`). The live tool list is authoritative: if it differs from this page, follow the live schemas and never invent a tool.

## How the tools appear

The same 18 tools can reach this session three ways. Use whichever is present; the arguments are identical.

| Route | Tool names look like | Notes |
|---|---|---|
| This plugin's `3dj` server (Claude Code) | `mcp__plugin_3dj-studio_3dj__openscad_compile_model` | Sign in once: run `/mcp`, choose **3dj**, **Authenticate**. |
| Claude app connector "3dj" | `mcp__3dj__openscad_compile_model` | Sign in under Settings → Connectors → 3dj. |
| Adaptive gateway | `threedj_cad_and_print` with `operation`, or `adaptive_proxy_mcp_tool` with `app: "3dj"`, `action: "call_tool"`, `toolName`, `arguments` | The shortcut covers starters, validation, compile, saved CAD models, account and quotes; use the proxy for generation and the rest. |

Tool calls may be deferred: load them through the session's tool search before the first call.

## Free tools — no account

| Tool | Arguments | Returns |
|---|---|---|
| `openscad_get_starters` | — | 3 OpenSCAD starters (`mounting-plate`, `vented-cup`, `box-lid`) and the language rules 3DJ's engine accepts. |
| `cad_get_starters` | `category?` (e.g. `enclosure`, `mating`, `fastener`) | 18 Replicad/OpenCascade B-Rep starter scripts with `Param.*` declarations, plus the full DSL reference (`dslReference`). |
| `cad_validate_script` | `code` | Syntax, safety and parameter check of a B-Rep script; the live server may also build the solid and return `buildValidation` / `measuredGeometry` (bodies, size, volume, bed fit). Never creates a file. |
| `cad_get_evidence_schema` | — | The Design Evidence Pack v1 gates: watertight, 0.8 mm nozzle-safe wall, 1.2 mm recommended wall, 45° overhang, 220 × 220 × 250 mm bed, PLA 1.24 g/cm³, evidence labels. |

## Account tools — OAuth sign-in (or a per-user API key in hosts that use headers)

| Tool | Arguments | Notes |
|---|---|---|
| `openscad_compile_model` | `code`, `parameters?` {name: number}, `buildVolumeMm?` [x,y,z] | Real OpenSCAD (Manifold) in an isolated worker: effective source, clamped parameter values, triangle count, closed-mesh check, bounding box, printer fit. 20/hour, 100/day. Creates **no** STL and no gallery record. |
| `cad_list_models` | `limit?` 1–100 | The user's saved parametric and photo-CAD models with script source and parameter values. |
| `list_providers` | `force?` | Health of each generation backend, supported inputs, remaining hourly/daily generation allowance. |
| `generate_from_text` | `prompt`, `negativePrompt?` | Starts an asynchronous concept mesh (used by the separate 3dj-concept plugin). Returns `modelId`, `status: "processing"`. Uses allowance. |
| `generate_from_image_url` | `imageUrl` (public HTTPS, ≤ 12 MB), `name?` | Image-to-3D. Same polling. |
| `get_generation_status` | `modelId` | `processing` / `complete` / `failed`, progress, provider, `downloadUrl` when complete, or the real failure reason. |
| `list_my_models` | `limit?`, `status?` (`complete`/`failed`/`processing`) | The user's models, newest first. |
| `get_model_download_url` | `modelId` | Absolute `downloadUrl`, actual `format` (`glb` or `stl`), `refinementHandoff`. |
| `get_account_status` | — | Account id, auth method, scopes, saved-model counts, `printQuoteRequestsOpen`. |
| `request_print_quote` | `requestKey`, `modelId`, `dimensionsMm` [x,y,z], `material`, `colour`, `quantity` 1–100, `destinationCountry` (2 letters), `destinationRegion` (city or postal region only), `intendedUse`, `notes?` | Creates a review request only (`paymentRequiredNow: false`). Needs a completed saved model. Reuse `requestKey` for identical retries; new key for any change. |
| `list_print_requests` | — | Requests and operator notes. |
| `cancel_print_request` | `requestId` | Only when the user asks. Not a refund or order cancellation. |
| `list_print_quotes` | — | Operator-issued EUR quotes: item, shipping, tax, total, expiry, lead time, inspection note, file SHA-256, `quoteHash`. |
| `accept_print_quote` | `quoteId`, `quoteHash` | Records acceptance of the exact displayed terms. No charge, booking or shipment. |

## Sign-in and safety

- Never ask for an API key or token in chat and never put credentials, `userId` or tokens in tool arguments — the server rejects them (`credentials_in_arguments`).
- The server also refuses sensitive personal data (government IDs, medical records, biometrics, card numbers) in any argument. None is needed for CAD.
- When a call returns 401 or "connect your account", say which route above signs in, and carry on with the free path meanwhile.

## Workbench links

| Purpose | Link |
|---|---|
| Open the workbench (OpenSCAD and B-Rep editors, STEP/STL export, gallery save) | `https://www.3dj.app/workspace` |
| Open a generated mesh in the viewer | `https://www.3dj.app/workspace?modelUrl=<URL-encoded downloadUrl>` |
| Start image-to-3D from a reference image (e.g. a product render) | `https://www.3dj.app/workspace?ref=<URL-encoded image URL>` |
| Mint a per-user API key (CLI and header-based hosts) | `https://www.3dj.app/agents` |

There is no deep link that loads source code: for OpenSCAD or B-Rep scripts, tell the person to open the workbench, pick the matching editor and paste the file.

## The free local bench

`scripts/bench.mjs` (in the 3dj-make skill folder) needs only Node 18+. It compiles OpenSCAD with the official WebAssembly build (OpenSCAD 2025.01, Manifold backend — the same backend as `openscad_compile_model`), which `node BENCH setup` downloads once into `~/.cache/3dj-bench` (override with `THREEDJ_BENCH_HOME`) after the person agrees. It reads STL and GLB too. Use it for every iteration; use `openscad_compile_model` when an official 3DJ measurement is wanted or when Node is unavailable.
