#!/usr/bin/env node
/*
 * 3DJ bench — free, local compile + measure + preview for 3D-printable parts.
 * Part of the 3DJ Studio plugin by Neural Deep Network Ltd. MIT licence.
 *
 *   node bench.mjs build   part.scad [-D width=80 ...] [--bed 180,180,180]
 *   node bench.mjs compare a.scad b.scad c.scad [--labels "Monolith,Stack,Frame"]
 *   node bench.mjs compare lamp.scad@height=120 lamp.scad@height=160
 *   node bench.mjs orient  part.scad|part.stl [--bed 180,180,180]
 *   node bench.mjs params  part.scad
 *   node bench.mjs setup
 *
 * Inputs: OpenSCAD source (.scad, compiled locally with the OpenSCAD WebAssembly
 * engine, which `node bench.mjs setup` downloads once from the npm registry, pinned and
 * SHA-512 verified), STL (binary or ASCII), or GLB.
 * Checks mirror the 3DJ Design Evidence Pack v1 gates: watertight shell,
 * 0.8 mm nozzle-safe wall, 1.2 mm recommended wall, 45° overhang,
 * 220 × 220 × 250 mm bed, PLA 1.24 g/cm³. They are geometry screens, not a
 * manufacturing certification. Needs Node 18+ and nothing else.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { deflateSync } from "node:zlib";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const VERSION = "0.1.0";
// The OpenSCAD engine is downloaded only by an explicit `setup` command: one pinned package from the npm
// registry, install scripts disabled, verified against this SHA-512 before it is ever loaded.
const ENGINE_PKG = "openscad-wasm-prebuilt";
const ENGINE_VERSION = "1.2.0";
const ENGINE_INTEGRITY = "sha512-JfXJlopHVHvsYiVYUKYDXkg8yOkABm8zclo8zPrSRBeeICR+fitesO6NRwBdAzSdbtOYh6Scmuz/XLyhllbzYA==";
const GATES = Object.freeze({ wall: 0.8, wallTarget: 1.2, overhangDeg: 45, bed: [220, 220, 250], densityPLA: 1.24 });

// ───────────────────────────── utilities ─────────────────────────────
let QUIET = false;
const log = (...a) => { if (!QUIET) console.error(...a); };
class BenchError extends Error { constructor(msg, code = 1) { super(msg); this.exitCode = code; } }
const fail = (msg, code = 1) => { throw new BenchError(msg, code); };
const fmt = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : "—");
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

const HELP = `3DJ bench ${VERSION} — free local compile, measure and preview for 3D-printable parts

  node bench.mjs build   <part.scad|part.stl|part.glb> [options]   measure + views + print check
  node bench.mjs compare <a> <b> [c ...] [--labels "A,B,C"]          concepts side by side, same scale
  node bench.mjs compare part.scad@height=120 part.scad@height=160    parameter variants of one file
  node bench.mjs orient  <part> [options]                            find the print orientation
  node bench.mjs params  <part.scad>                                 list customizer parameters
  node bench.mjs setup                                               one-time: download and verify the OpenSCAD engine

Options
  -D name=value       override a top-level OpenSCAD parameter (repeatable)
  --bed X,Y,Z         printer build volume in mm (default 220,220,250)
  --wall MM           nozzle-safe wall gate (default 0.8)    --wall-target MM  (default 1.2)
  --overhang DEG      support threshold from vertical (default 45)
  --rotate RX,RY,RZ   rotate before measuring (degrees, X then Y then Z), then sit on the bed
  --fit MM            scale so the longest side is MM (for unitless meshes such as GLB concepts)
  --density G_CM3     material density for the mass estimate (default 1.24, PLA)
  --color #RRGGBB     base colour for the views
  --labels "A,B,C"    concept names for compare       --title TEXT   sheet title
  --out DIR           output folder (default: beside the first input)
  --name NAME         base name for output files
  --no-render         measurements only, no images
  --no-stl            do not write an STL (review renders, e.g. with a package ghost shown)
  --infill 0.2        infill fraction for the rough sliced-mass estimate
  --silhouette right  compare silhouettes from the side instead of the front
  --lenient           accept OpenSCAD warnings about unknown names or bad arguments
  --json              print the report as JSON on stdout (nothing else)

Compiling .scad needs the OpenSCAD engine: run "setup" once (a pinned ${ENGINE_PKG} ${ENGINE_VERSION} download of about
11 MB from the npm registry, SHA-512 verified, install scripts disabled). STL and GLB files work without it.

Outputs: NAME.views.png, NAME.check.png, NAME.report.json (+ NAME.stl from .scad);
compare → NAME.png; orient → NAME.orient.png + NAME.oriented.stl.
These are geometry screens against the 3DJ gates, not a manufacturing certification.`;

function parseArgs(argv) {
  const o = {
    defines: [], bed: [...GATES.bed], wall: GATES.wall, wallTarget: GATES.wallTarget, overhang: GATES.overhangDeg,
    density: GATES.densityPLA, color: "#a7b0b8", render: true, json: false, out: null, name: null, labels: null,
    title: null, rotate: null, fit: null, probe: 12, lenient: false, stl: true, infill: 0.2, silhouette: "front",
  };
  const files = [];
  let cmd = argv[0];
  if (!cmd || ["-h", "--help", "help"].includes(cmd)) return { cmd: "help", files, o };
  let rest = argv.slice(1);
  if (/\.(scad|stl|glb)$/i.test(cmd)) { rest = argv; cmd = "build"; }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    const val = () => { if (i + 1 >= rest.length) fail(`${a} needs a value`); return rest[++i]; };
    switch (a) {
      case "-D": o.defines.push(val()); break;
      case "--bed": o.bed = numList(val(), 3, a); break;
      case "--wall": o.wall = num(val(), a); break;
      case "--wall-target": o.wallTarget = num(val(), a); break;
      case "--overhang": o.overhang = num(val(), a); break;
      case "--density": o.density = num(val(), a); break;
      case "--rotate": o.rotate = numList(val(), 3, a); break;
      case "--fit": o.fit = num(val(), a); break;
      case "--probe": o.probe = num(val(), a); break;
      case "--color": o.color = val(); break;
      case "--out": o.out = val(); break;
      case "--name": o.name = val(); break;
      case "--labels": o.labels = val().split(",").map((s) => s.trim()); break;
      case "--title": o.title = val(); break;
      case "--no-render": o.render = false; break;
      case "--lenient": o.lenient = true; break;
      case "--no-stl": o.stl = false; break;
      case "--infill": o.infill = clamp(num(val(), a), 0, 1); break;
      case "--silhouette": o.silhouette = val(); if (!["front", "right"].includes(o.silhouette)) fail("--silhouette expects front or right"); break;
      case "--json": o.json = true; QUIET = true; break;
      case "--quiet": QUIET = true; break;
      default:
        if (a.startsWith("-D") && a.length > 2) o.defines.push(a.slice(2));
        else if (a.startsWith("-")) fail(`Unknown option ${a}. Run with --help.`);
        else files.push(a);
    }
  }
  return { cmd, files, o };
}
function num(s, flag) { const x = Number(s); if (!Number.isFinite(x)) fail(`${flag} expects a number, got "${s}"`); return x; }
function numList(s, n, flag) {
  const xs = String(s).split(/[,x×\s]+/i).filter(Boolean).map(Number);
  if (xs.length !== n || xs.some((x) => !Number.isFinite(x))) fail(`${flag} expects ${n} numbers, e.g. ${n === 3 ? "180,180,180" : "1,2"}`);
  return xs;
}

// ─────────────────────────── OpenSCAD engine ───────────────────────────
const engineHome = () => process.env.THREEDJ_BENCH_HOME || path.join(os.homedir(), ".cache", "3dj-bench");
const engineEntry = (home) => path.join(home, "node_modules", ENGINE_PKG, "dist", "openscad.js");
function installedIntegrity(home) {
  try {
    const lock = JSON.parse(readFileSync(path.join(home, "package-lock.json"), "utf8"));
    const entry = lock.packages?.[`node_modules/${ENGINE_PKG}`];
    return entry && entry.version === ENGINE_VERSION ? entry.integrity : null;
  } catch { return null; }
}
const engineReady = (home) => existsSync(engineEntry(home)) && installedIntegrity(home) === ENGINE_INTEGRITY;

let enginePromise;
function loadEngine() {
  enginePromise ??= (async () => {
    const home = engineHome();
    if (!engineReady(home)) {
      fail(`The OpenSCAD engine is not installed yet. It is a one-time download of ${ENGINE_PKG} ${ENGINE_VERSION} ` +
        `(about 11 MB) from the npm registry into ${home}, verified against a pinned SHA-512 hash, with install scripts disabled.\n` +
        `Install it with:  node ${process.argv[1]} setup\n` +
        "STL and GLB files work without it.", 3);
    }
    return import(pathToFileURL(engineEntry(home)).href);
  })();
  return enginePromise;
}

function cmdSetup() {
  const home = engineHome();
  const report = { engine: ENGINE_PKG, version: ENGINE_VERSION, integrity: ENGINE_INTEGRITY, home };
  if (engineReady(home)) return { report: { ...report, status: "already-installed" }, text: `OpenSCAD engine already installed and verified: ${ENGINE_PKG} ${ENGINE_VERSION} in ${home}` };
  mkdirSync(home, { recursive: true });
  writeFileSync(path.join(home, "package.json"), JSON.stringify({ name: "3dj-bench-engine", private: true }) + "\n");
  log(`Downloading ${ENGINE_PKG} ${ENGINE_VERSION} (about 11 MB) from the npm registry into ${home} …`);
  const win = process.platform === "win32";
  try {
    execFileSync(win ? "npm.cmd" : "npm",
      ["install", "--prefix", home, "--ignore-scripts", "--save-exact", "--no-audit", "--no-fund", "--update-notifier=false", "--loglevel=error", `${ENGINE_PKG}@${ENGINE_VERSION}`],
      { stdio: ["ignore", 2, 2], shell: win });
  } catch (e) {
    fail(`npm could not install ${ENGINE_PKG} ${ENGINE_VERSION} (${String(e.message).split("\n")[0]}). Check the network connection and try again; STL and GLB files work without it.`);
  }
  const got = installedIntegrity(home);
  if (got !== ENGINE_INTEGRITY || !existsSync(engineEntry(home))) {
    rmSync(path.join(home, "node_modules"), { recursive: true, force: true });
    rmSync(path.join(home, "package-lock.json"), { force: true });
    fail(`Integrity check failed for ${ENGINE_PKG} ${ENGINE_VERSION}: expected ${ENGINE_INTEGRITY}, got ${got || "nothing"}. The download was removed.`);
  }
  return { report: { ...report, status: "installed" }, text: `OpenSCAD engine installed and verified: ${ENGINE_PKG} ${ENGINE_VERSION} (SHA-512 matches) in ${home}` };
}

async function compileScad(file, defines, lenient = false) {
  const { createOpenSCAD } = await loadEngine();
  const source = readFileSync(file, "utf8");
  // OpenSCAD 2025.01's 3D hull() occasionally trips a CGAL assertion that depends on incidental
  // inputs (even the internal file name). Retry with a fresh run under another name, then with CGAL.
  const attempts = [["/model.scad", "Manifold"], ["/part.scad", "Manifold"], ["/model.scad", "CGAL"]];
  let result;
  for (const [i, [name, backend]] of attempts.entries()) {
    result = await runOpenSCAD(createOpenSCAD, source, name, backend, defines, file, lenient);
    if (result.ok) {
      if (i > 0) result.warnings.unshift(`OpenSCAD's 3D hull() hit a known CGAL assertion; rebuilt with ${backend === "CGAL" ? "the CGAL backend" : "a fresh engine run"}. ` +
        "3DJ's hosted compile can hit the same issue: for production geometry prefer 2D hull() + linear_extrude/rotate_extrude.");
      return result;
    }
    if (!result.hullBug) break;
  }
  fail(result.message, 2);
}

async function runOpenSCAD(createOpenSCAD, source, name, backend, defines, file, lenient) {
  const messages = [];
  const capture = (m) => messages.push(String(m));
  const inst = (await createOpenSCAD({ noInitialRun: true, print: capture, printErr: capture })).getInstance();
  inst.FS.writeFile(name, source);
  const args = [name, `--backend=${backend}`, "--export-format=binstl", "-o", "/out.stl"];
  for (const d of defines) args.push("-D", d);
  let code = 0;
  try { code = inst.callMain(args); } catch (e) {
    code = typeof e?.status === "number" ? e.status : 1;
    if (!(e && typeof e === "object" && "status" in e)) messages.push(String(e?.message || e));
  }
  let stl = null;
  try { stl = inst.FS.readFile("/out.stl"); } catch { /* no output */ }
  const esc = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const tidy = (m) => m.replace(new RegExp(` in file ${esc}, line (\\d+)`, "g"), " (line $1)").replace(new RegExp(esc, "g"), path.basename(file));
  const problems = messages.filter((m) => /^(ERROR|WARNING|TRACE)|Parser error|syntax error/i.test(m)).map(tidy);
  const echoes = messages.filter((m) => /^ECHO:/.test(m)).map((m) => tidy(m.replace(/^ECHO:\s*/, "")));
  // OpenSCAD keeps going after some errors (a failed assert after geometry exits 0) and only warns about
  // unknown names or bad arguments, which silently produce the wrong part. Treat those as failures.
  const HARD = /^ERROR|^WARNING: (Unable to convert|Ignoring unknown|undefined operation|Too many unnamed arguments|.*is undefined|.*argument.*undefined)/i;
  const hard = problems.filter((m) => HARD.test(m) && !(lenient && /^WARNING/.test(m)));
  if (code !== 0 || !stl || stl.length <= 84 || hard.length) {
    const detail = (hard.length ? hard : problems.length ? problems : messages.slice(-10).map(tidy)).join("\n");
    return {
      ok: false,
      hullBug: messages.some((m) => /CGAL error in applyHull|convex_hull_3|CGAL ERROR: assertion violation/i.test(m)),
      message: `OpenSCAD could not build ${path.basename(file)} as written${detail ? ":\n" + detail : "."}` +
        (hard.some((m) => /^WARNING/.test(m)) ? "\n(These warnings mean the geometry differs from the source. Fix them, or pass --lenient to accept.)" : ""),
    };
  }
  return { ok: true, tris: readSTL(Buffer.from(stl)), warnings: problems.filter((m) => /^WARNING/i.test(m)), echoes };
}

function scadParams(src) {
  const out = [];
  let depth = 0;
  for (const line of src.split(/\r?\n/)) {
    if (depth === 0) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+);\s*(?:\/\/\s*(.*))?$/.exec(line);
      if (m) {
        const value = m[2].trim();
        const comment = (m[3] || "").trim();
        const r = /^\[\s*([-+0-9.eE]+)\s*:\s*([-+0-9.eE]+)\s*(?::\s*([-+0-9.eE]+))?\s*\]/.exec(comment);
        const range = r ? (r[3] !== undefined ? { min: +r[1], step: +r[2], max: +r[3] } : { min: +r[1], max: +r[2] }) : null;
        const numeric = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(value);
        out.push({ name: m[1], value: numeric ? Number(value) : value, editable: numeric, range, note: r ? comment.slice(r[0].length).trim() : comment });
      }
    }
    const code = line.replace(/\/\/.*$/, "").replace(/"(?:[^"\\]|\\.)*"/g, "");
    for (const ch of code) { if (ch === "{") depth++; else if (ch === "}") depth = Math.max(0, depth - 1); }
  }
  return out;
}

function applyDefines(params, defines) {
  const warnings = [];
  const byName = new Map(params.map((p) => [p.name, p]));
  for (const d of defines) {
    const i = d.indexOf("=");
    if (i < 1) fail(`-D expects name=value, got "${d}"`);
    const name = d.slice(0, i).trim();
    const raw = d.slice(i + 1).trim();
    const p = byName.get(name);
    if (!p) { warnings.push(`-D ${name}: no top-level parameter with that name (OpenSCAD will still set it)`); continue; }
    const v = Number(raw);
    p.value = Number.isFinite(v) ? v : raw;
    p.overridden = true;
    if (p.range && Number.isFinite(v) && (v < p.range.min || v > p.range.max))
      warnings.push(`-D ${name}=${raw} is outside its declared range [${p.range.min}..${p.range.max}]`);
  }
  return warnings;
}

// ─────────────────────────────── mesh I/O ───────────────────────────────
function readSTL(buf) {
  if (buf.length >= 84) {
    const n = buf.readUInt32LE(80);
    if (84 + 50 * n === buf.length) {
      const tris = new Float64Array(n * 9);
      for (let i = 0; i < n; i++) {
        const o = 84 + i * 50 + 12;
        for (let k = 0; k < 9; k++) tris[i * 9 + k] = buf.readFloatLE(o + k * 4);
      }
      return tris;
    }
  }
  const text = buf.toString("utf8");
  if (!/^\s*solid/i.test(text)) fail("That file is not an STL I can read.");
  const nums = [];
  const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/gi;
  let m;
  while ((m = re.exec(text))) nums.push(+m[1], +m[2], +m[3]);
  if (!nums.length || nums.length % 9) fail("The ASCII STL has no complete triangles.");
  return Float64Array.from(nums);
}

function readGLB(buf) {
  if (buf.length < 20 || buf.readUInt32LE(0) !== 0x46546c67) fail("That file is not a GLB (binary glTF).");
  let off = 12, json = null, bin = null;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
    const chunk = buf.subarray(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8"));
    else if (type === 0x004e4942) bin = chunk;
    off += 8 + len;
  }
  if (!json) fail("The GLB has no JSON chunk.");
  if ((json.extensionsRequired || json.extensionsUsed || []).some((e) => /draco|meshopt/i.test(e)))
    fail("This GLB uses mesh compression (Draco/meshopt), which the bench does not decode. Export an STL instead.");
  const SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const READ = { 5120: "readInt8", 5121: "readUInt8", 5122: "readInt16LE", 5123: "readUInt16LE", 5125: "readUInt32LE", 5126: "readFloatLE" };
  const accessor = (index) => {
    const a = json.accessors[index];
    const bv = json.bufferViews?.[a.bufferView];
    if (!bin || !bv) fail("The GLB references external or missing buffers, which the bench does not load.");
    const comps = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
    const size = SIZE[a.componentType], read = READ[a.componentType];
    const stride = bv.byteStride || comps * size;
    const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
    const out = new Float64Array(a.count * comps);
    for (let i = 0; i < a.count; i++) for (let c = 0; c < comps; c++) out[i * comps + c] = bin[read](base + i * stride + c * size);
    return out;
  };
  const tris = [];
  const addPrimitive = (prim, m) => {
    if (prim.mode != null && prim.mode !== 4) return;
    const P = accessor(prim.attributes.POSITION);
    const I = prim.indices != null ? accessor(prim.indices) : null;
    const count = I ? I.length : P.length / 3;
    for (let k = 0; k < count; k++) {
      const vi = I ? I[k] : k;
      const x = P[vi * 3], y = P[vi * 3 + 1], z = P[vi * 3 + 2];
      const X = m[0] * x + m[4] * y + m[8] * z + m[12];
      const Y = m[1] * x + m[5] * y + m[9] * z + m[13];
      const Z = m[2] * x + m[6] * y + m[10] * z + m[14];
      tris.push(X, -Z, Y); // glTF is Y-up; the bench is Z-up
    }
  };
  const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const mul = (a, b) => { const c = new Array(16).fill(0); for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++) for (let k = 0; k < 4; k++) c[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k]; return c; };
  const local = (n) => {
    if (n.matrix) return n.matrix;
    const [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1], [tx, ty, tz] = n.translation || [0, 0, 0];
    return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1];
  };
  const nodes = json.nodes || [];
  const visit = (ni, parent, seen) => {
    if (seen.has(ni)) return; seen.add(ni);
    const node = nodes[ni]; const m = mul(parent, local(node));
    if (node.mesh != null) for (const p of json.meshes[node.mesh].primitives) addPrimitive(p, m);
    for (const c of node.children || []) visit(c, m, seen);
  };
  const roots = json.scenes?.[json.scene ?? 0]?.nodes ?? nodes.map((_, i) => i).filter((i) => !nodes.some((n) => n.children?.includes(i)));
  if (roots.length) { const seen = new Set(); roots.forEach((r) => visit(r, IDENT, seen)); }
  else (json.meshes || []).forEach((mesh) => mesh.primitives.forEach((p) => addPrimitive(p, IDENT)));
  if (tris.length < 9) fail("The GLB contains no triangle meshes.");
  return Float64Array.from(tris.slice(0, tris.length - (tris.length % 9)));
}

function writeSTL(file, mesh, N) {
  const { V, T } = mesh;
  const nt = T.length / 3;
  const buf = Buffer.alloc(84 + nt * 50);
  buf.write("3DJ bench binary STL (mm)", 0, "ascii");
  buf.writeUInt32LE(nt, 80);
  for (let f = 0; f < nt; f++) {
    let o = 84 + f * 50;
    for (let k = 0; k < 3; k++, o += 4) buf.writeFloatLE(N[f * 3 + k], o);
    for (let j = 0; j < 3; j++) { const v = T[f * 3 + j] * 3; for (let k = 0; k < 3; k++, o += 4) buf.writeFloatLE(V[v + k], o); }
  }
  writeFileSync(file, buf);
}

// Transform a triangle soup in place: rotate (X, then Y, then Z), fit, sit on the bed.
function transformSoup(tris, { rotate, fit, seat }) {
  if (rotate && rotate.some((d) => d % 360 !== 0)) {
    const [ax, ay, az] = rotate.map((d) => (d * Math.PI) / 180);
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
    for (let i = 0; i < tris.length; i += 3) {
      let x = tris[i], y = tris[i + 1], z = tris[i + 2], t;
      t = y * cx - z * sx; z = y * sx + z * cx; y = t;     // about X
      t = x * cy + z * sy; z = -x * sy + z * cy; x = t;    // about Y
      t = x * cz - y * sz; y = x * sz + y * cz; x = t;     // about Z
      tris[i] = Math.abs(x) < 1e-9 ? 0 : x; tris[i + 1] = Math.abs(y) < 1e-9 ? 0 : y; tris[i + 2] = Math.abs(z) < 1e-9 ? 0 : z;
    }
  }
  if (fit) {
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < tris.length; i++) { const k = i % 3; lo[k] = Math.min(lo[k], tris[i]); hi[k] = Math.max(hi[k], tris[i]); }
    const s = fit / Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
    for (let i = 0; i < tris.length; i++) tris[i] *= s;
  }
  if (seat) {
    let zmin = Infinity;
    for (let i = 2; i < tris.length; i += 3) zmin = Math.min(zmin, tris[i]);
    for (let i = 2; i < tris.length; i += 3) tris[i] -= zmin;
  }
  return tris;
}

// Weld a triangle soup into an indexed mesh (0.1 µm tolerance), dropping degenerate faces.
function weld(tris) {
  const map = new Map();
  const V = [];
  const T = [];
  const id = (x, y, z) => {
    const key = `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
    let i = map.get(key);
    if (i === undefined) { i = V.length / 3; map.set(key, i); V.push(x, y, z); }
    return i;
  };
  for (let i = 0; i < tris.length; i += 9) {
    const a = id(tris[i], tris[i + 1], tris[i + 2]), b = id(tris[i + 3], tris[i + 4], tris[i + 5]), c = id(tris[i + 6], tris[i + 7], tris[i + 8]);
    if (a !== b && b !== c && a !== c) T.push(a, b, c);
  }
  if (!T.length) fail("The model has no geometry (no non-degenerate triangles).");
  return { V: Float64Array.from(V), T: Uint32Array.from(T) };
}

async function loadModel(file, o, { allowDefines = true } = {}) {
  if (!existsSync(file)) fail(`No such file: ${file}`);
  const ext = path.extname(file).toLowerCase();
  const info = { input: path.resolve(file), kind: ext.slice(1), warnings: [], echoes: [], parameters: null, unitsKnown: true, compiled: false };
  let tris;
  if (ext === ".scad") {
    const params = scadParams(readFileSync(file, "utf8"));
    info.warnings.push(...applyDefines(params, allowDefines ? o.defines : []));
    log(`Compiling ${path.basename(file)} with OpenSCAD (local, WebAssembly) …`);
    const r = await compileScad(file, allowDefines ? o.defines : [], o.lenient);
    tris = r.tris; info.warnings.push(...r.warnings); info.echoes = r.echoes; info.parameters = params; info.compiled = true;
  } else if (ext === ".stl") {
    tris = readSTL(readFileSync(file));
  } else if (ext === ".glb") {
    tris = readGLB(readFileSync(file));
    info.unitsKnown = !!o.fit;
    if (!o.fit) info.warnings.push("GLB concept meshes carry no reliable real-world units; sizes are as stored. Use --fit MM to scale the longest side.");
  } else fail(`Unsupported file type "${ext}". Use .scad, .stl or .glb.`);
  const seat = ext === ".glb" || !!o.rotate || !!o.fit;
  transformSoup(tris, { rotate: o.rotate, fit: o.fit, seat });
  info.transformed = seat;
  return { mesh: weld(tris), info };
}

// ─────────────────────────────── analysis ───────────────────────────────
function analyze(mesh, o) {
  const { V, T } = mesh;
  const nv = V.length / 3;
  let nt = T.length / 3;
  const N = new Float64Array(nt * 3), A = new Float64Array(nt), C = new Float64Array(nt * 3), FV = new Float64Array(nt);
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) { const x = V[i * 3 + k]; if (x < lo[k]) lo[k] = x; if (x > hi[k]) hi[k] = x; }
  let volume = 0, area = 0;
  const faceGeom = () => {
    volume = 0; area = 0;
    for (let f = 0; f < nt; f++) {
      const a = T[f * 3] * 3, b = T[f * 3 + 1] * 3, c = T[f * 3 + 2] * 3;
      const ux = V[b] - V[a], uy = V[b + 1] - V[a + 1], uz = V[b + 2] - V[a + 2];
      const vx = V[c] - V[a], vy = V[c + 1] - V[a + 1], vz = V[c + 2] - V[a + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz);
      A[f] = len / 2; area += A[f];
      if (len > 0) { nx /= len; ny /= len; nz /= len; }
      N[f * 3] = nx; N[f * 3 + 1] = ny; N[f * 3 + 2] = nz;
      C[f * 3] = (V[a] + V[b] + V[c]) / 3; C[f * 3 + 1] = (V[a + 1] + V[b + 1] + V[c + 1]) / 3; C[f * 3 + 2] = (V[a + 2] + V[b + 2] + V[c + 2]) / 3;
      FV[f] = (V[a] * (V[b + 1] * V[c + 2] - V[b + 2] * V[c + 1]) - V[a + 1] * (V[b] * V[c + 2] - V[b + 2] * V[c]) + V[a + 2] * (V[b] * V[c + 1] - V[b + 1] * V[c])) / 6;
      volume += FV[f];
    }
  };
  faceGeom();
  let flippedMesh = false;
  if (volume < 0) { // inside-out: reverse winding so normals point outward
    for (let f = 0; f < nt; f++) { const t = T[f * 3 + 1]; T[f * 3 + 1] = T[f * 3 + 2]; T[f * 3 + 2] = t; }
    faceGeom(); flippedMesh = true;
  }

  // Topology: open edges, non-manifold edges, inconsistent winding.
  const und = new Map(), dirm = new Map();
  for (let f = 0; f < nt; f++) {
    for (let e = 0; e < 3; e++) {
      const u = T[f * 3 + e], v = T[f * 3 + ((e + 1) % 3)];
      const kd = u * nv + v; dirm.set(kd, (dirm.get(kd) || 0) + 1);
      const ku = Math.min(u, v) * nv + Math.max(u, v); und.set(ku, (und.get(ku) || 0) + 1);
    }
  }
  let openEdges = 0, nonManifold = 0, windingErrors = 0;
  for (const c of und.values()) { if (c === 1) openEdges++; else if (c > 2) nonManifold++; }
  for (const c of dirm.values()) if (c > 1) windingErrors++;
  const closed = openEdges === 0 && nonManifold === 0 && windingErrors === 0;

  // Connected shells → bodies (positive volume) and sealed voids (negative).
  const parent = new Int32Array(nv); for (let i = 0; i < nv; i++) parent[i] = i;
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (let f = 0; f < nt; f++) {
    const a = find(T[f * 3]), b = find(T[f * 3 + 1]), c = find(T[f * 3 + 2]);
    if (a !== b) parent[a] = b;
    const bb = find(b); if (find(c) !== bb) parent[find(c)] = bb;
  }
  const shells = new Map();
  const faceShell = new Int32Array(nt);
  for (let f = 0; f < nt; f++) {
    const r = find(T[f * 3]);
    let s = shells.get(r);
    if (!s) { s = { vol: 0, area: 0, faces: 0, lo: [Infinity, Infinity, Infinity], hi: [-Infinity, -Infinity, -Infinity] }; shells.set(r, s); }
    s.vol += FV[f]; s.area += A[f]; s.faces++;
    for (let j = 0; j < 3; j++) { const v = T[f * 3 + j] * 3; for (let k = 0; k < 3; k++) { s.lo[k] = Math.min(s.lo[k], V[v + k]); s.hi[k] = Math.max(s.hi[k], V[v + k]); } }
    faceShell[f] = r;
  }
  const shellList = [...shells.entries()].map(([root, s]) => ({ root, ...s })).sort((a, b) => b.vol - a.vol);
  const bodies = shellList.filter((s) => s.vol > 1e-6);
  const voids = shellList.filter((s) => s.vol < -1e-6);
  const bodyIndex = new Map(bodies.map((s, i) => [s.root, i]));
  const faceBody = new Int32Array(nt);
  for (let f = 0; f < nt; f++) faceBody[f] = bodyIndex.has(faceShell[f]) ? bodyIndex.get(faceShell[f]) : -1;

  // Bed contact and overhangs.
  const zmin = lo[2];
  let footprint = 0;
  const limit = -Math.sin((o.overhang * Math.PI) / 180) - 0.01; // an exact 45° chamfer is printable
  const over = new Uint8Array(nt);
  const bedFace = new Uint8Array(nt);
  let overArea = 0, ceilingArea = 0;
  for (let f = 0; f < nt; f++) {
    const nz = N[f * 3 + 2];
    let zmax = -Infinity; for (let j = 0; j < 3; j++) zmax = Math.max(zmax, V[T[f * 3 + j] * 3 + 2]);
    if (nz < -0.999 && zmax < zmin + 0.02) { footprint += A[f]; bedFace[f] = 1; continue; }
    const firstLayers = nz > -0.95 && zmax <= zmin + 0.6; // elephant-foot chamfers print fine
    if (nz < limit && C[f * 3 + 2] > zmin + 0.05 && !firstLayers) { over[f] = 1; overArea += A[f]; if (nz < -0.995) ceilingArea += A[f]; }
  }
  const regions = overhangRegions(mesh, over, A, C).slice(0, 5);

  // Wall thickness by inward ray probes (3DJ gate 0.8 mm, target 1.2 mm).
  const walls = closed ? wallThickness(mesh, N, A, C, lo, hi, o) : null;

  const size = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
  const bed = o.bed;
  const fits = size[0] <= bed[0] + 1e-6 && size[1] <= bed[1] + 1e-6 && size[2] <= bed[2] + 1e-6;
  const fitsRotated = size[1] <= bed[0] + 1e-6 && size[0] <= bed[1] + 1e-6 && size[2] <= bed[2] + 1e-6;
  const sig = (x) => x > Math.max(1, area * 5e-4);
  const gates = {
    watertight: closed ? "pass" : "fail",
    wall: !walls ? "unevaluated" : sig(walls.belowGateArea) ? "fail" : sig(walls.belowTargetArea) ? "warn" : "pass",
    overhang: (regions[0]?.area_mm2 || 0) > 60 || overArea > Math.max(200, area * 0.02) ? "warn" : "pass",
    bed: fits ? "pass" : fitsRotated ? "pass-rotated" : "fail",
  };
  return {
    data: { N, A, C, over, bedFace, faceBody, walls },
    report: {
      units: "mm",
      bbox: { min: lo.map((x) => +x.toFixed(3)), max: hi.map((x) => +x.toFixed(3)), size: size.map((x) => +x.toFixed(3)) },
      triangles: nt, vertices: nv,
      volume_cm3: +(volume / 1000).toFixed(3), area_cm2: +(area / 100).toFixed(3),
      mass_g: {
        value: +((volume / 1000) * o.density).toFixed(1), density_g_cm3: o.density, basis: "solid (100% infill); a sliced part is lighter",
        sliced_estimate: +(((Math.min(volume, area * 1.2) + o.infill * Math.max(0, volume - area * 1.2)) / 1000) * o.density).toFixed(1),
        sliced_basis: `rough: 1.2 mm shell + ${Math.round(o.infill * 100)}% infill; the slicer is authoritative`,
      },
      watertight: { closed, openEdges, nonManifoldEdges: nonManifold, windingErrors, normalsFlipped: flippedMesh },
      bodies: bodies.map((s, i) => ({ index: i, size: s.hi.map((h, k) => +(h - s.lo[k]).toFixed(2)), volume_cm3: +(s.vol / 1000).toFixed(3) })),
      sealedVoids: voids.length,
      bed: { volume: bed, fits, fitsRotated90: fitsRotated, footprint_mm2: +footprint.toFixed(1) },
      walls: walls ? walls.summary : { evaluated: false, reason: "mesh is not watertight" },
      overhang: { angleDeg: o.overhang, area_mm2: +overArea.toFixed(1), flatCeilings_mm2: +ceilingArea.toFixed(1), percentOfSurface: +((overArea / area) * 100).toFixed(2), regions },
      gates,
    },
  };
}

function overhangRegions(mesh, over, A, C) {
  const { T } = mesh;
  const nt = T.length / 3;
  const parent = new Int32Array(nt); for (let i = 0; i < nt; i++) parent[i] = i;
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const owner = new Map();
  for (let f = 0; f < nt; f++) {
    if (!over[f]) continue;
    for (let j = 0; j < 3; j++) {
      const v = T[f * 3 + j];
      const g = owner.get(v);
      if (g === undefined) owner.set(v, f); else { const a = find(f), b = find(g); if (a !== b) parent[a] = b; }
    }
  }
  const regions = new Map();
  for (let f = 0; f < nt; f++) {
    if (!over[f]) continue;
    const r = find(f);
    let g = regions.get(r);
    if (!g) { g = { area: 0, cx: 0, cy: 0, cz: 0, z0: Infinity, z1: -Infinity }; regions.set(r, g); }
    g.area += A[f]; g.cx += C[f * 3] * A[f]; g.cy += C[f * 3 + 1] * A[f]; g.cz += C[f * 3 + 2] * A[f];
    g.z0 = Math.min(g.z0, C[f * 3 + 2]); g.z1 = Math.max(g.z1, C[f * 3 + 2]);
  }
  return [...regions.values()].sort((a, b) => b.area - a.area).map((g) => ({
    area_mm2: +g.area.toFixed(1),
    center: [g.cx / g.area, g.cy / g.area, g.cz / g.area].map((x) => +x.toFixed(1)),
    z: [+g.z0.toFixed(1), +g.z1.toFixed(1)],
  }));
}

function rayTri(V, T, g, ox, oy, oz, dx, dy, dz) {
  const a = T[g * 3] * 3, b = T[g * 3 + 1] * 3, c = T[g * 3 + 2] * 3;
  const e1x = V[b] - V[a], e1y = V[b + 1] - V[a + 1], e1z = V[b + 2] - V[a + 2];
  const e2x = V[c] - V[a], e2y = V[c + 1] - V[a + 1], e2z = V[c + 2] - V[a + 2];
  const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < 1e-14) return -1;
  const inv = 1 / det;
  const sx = ox - V[a], sy = oy - V[a + 1], sz = oz - V[a + 2];
  const u = (sx * px + sy * py + sz * pz) * inv;
  if (u < -1e-9 || u > 1 + 1e-9) return -1;
  const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
  const v = (dx * qx + dy * qy + dz * qz) * inv;
  if (v < -1e-9 || u + v > 1 + 1e-9) return -1;
  return (e2x * qx + e2y * qy + e2z * qz) * inv;
}

function wallThickness(mesh, N, A, C, lo, hi, o) {
  const { V, T } = mesh;
  const nt = T.length / 3;
  const probe = o.probe;
  const MIN_HIT = 0.1;
  const diag = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  const cell = clamp(diag / 80, 0.75, 4);
  const dims = [0, 1, 2].map((k) => Math.max(1, Math.ceil((hi[k] - lo[k]) / cell) + 1));
  const cellOf = (x, k) => clamp(Math.floor((x - lo[k]) / cell), 0, dims[k] - 1);
  const grid = new Map();
  for (let f = 0; f < nt; f++) {
    const l = [Infinity, Infinity, Infinity], h = [-Infinity, -Infinity, -Infinity];
    for (let j = 0; j < 3; j++) { const v = T[f * 3 + j] * 3; for (let k = 0; k < 3; k++) { l[k] = Math.min(l[k], V[v + k]); h[k] = Math.max(h[k], V[v + k]); } }
    for (let i = cellOf(l[0], 0); i <= cellOf(h[0], 0); i++)
      for (let j = cellOf(l[1], 1); j <= cellOf(h[1], 1); j++)
        for (let k = cellOf(l[2], 2); k <= cellOf(h[2], 2); k++) {
          const key = (i * dims[1] + j) * dims[2] + k;
          const list = grid.get(key);
          if (list) list.push(f); else grid.set(key, [f]);
        }
  }
  // Probe every face (or a deterministic sample on very dense meshes).
  let sample = [];
  const MAX = 40000;
  if (nt <= MAX) { for (let f = 0; f < nt; f++) sample.push(f); }
  else { let s = 0x9e3779b9; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < MAX; i++) sample.push(Math.floor(rnd() * nt)); sample = [...new Set(sample)]; }
  const thick = new Float64Array(nt).fill(NaN);
  const stamp = new Int32Array(nt).fill(-1);
  for (const f of sample) {
    if (A[f] < 1e-7) continue;
    const ox = C[f * 3], oy = C[f * 3 + 1], oz = C[f * 3 + 2];
    const dx = -N[f * 3], dy = -N[f * 3 + 1], dz = -N[f * 3 + 2];
    const ex = ox + dx * probe, ey = oy + dy * probe, ez = oz + dz * probe;
    let best = Infinity;
    for (let i = cellOf(Math.min(ox, ex), 0); i <= cellOf(Math.max(ox, ex), 0); i++)
      for (let j = cellOf(Math.min(oy, ey), 1); j <= cellOf(Math.max(oy, ey), 1); j++)
        for (let k = cellOf(Math.min(oz, ez), 2); k <= cellOf(Math.max(oz, ez), 2); k++) {
          const list = grid.get((i * dims[1] + j) * dims[2] + k);
          if (!list) continue;
          for (const g of list) {
            if (stamp[g] === f || g === f) continue;
            stamp[g] = f;
            if (N[g * 3] * dx + N[g * 3 + 1] * dy + N[g * 3 + 2] * dz <= 0.02) continue; // must be the far side of the wall
            const t = rayTri(V, T, g, ox, oy, oz, dx, dy, dz);
            if (t > MIN_HIT && t < best) best = t; // folds thinner than 0.1 mm are mesh noise, not walls
          }
        }
    thick[f] = best;
  }
  // Area-weighted statistics.
  const rows = [];
  let sampled = 0, belowGateArea = 0, belowTargetArea = 0, minT = Infinity, minAt = null;
  for (const f of new Set(sample)) {
    const t = thick[f];
    if (Number.isNaN(t)) continue;
    rows.push([t, A[f]]); sampled += A[f];
    if (t < o.wall) belowGateArea += A[f];
    if (t < o.wallTarget) belowTargetArea += A[f];
    if (t < minT && A[f] > 0.01) { minT = t; minAt = [C[f * 3], C[f * 3 + 1], C[f * 3 + 2]]; }
  }
  rows.sort((a, b) => a[0] - b[0]);
  const pct = (p) => { let acc = 0; for (const [t, a] of rows) { acc += a; if (acc >= sampled * p) return t; } return rows.length ? rows[rows.length - 1][0] : NaN; };
  const fin = (x) => (Number.isFinite(x) ? +x.toFixed(2) : `>${probe}`); // '>12' means thicker than the probe depth
  return {
    thick,
    belowGateArea, belowTargetArea,
    summary: {
      evaluated: true, method: `inward ray probes from ${rows.length} faces, up to ${probe} mm deep`,
      gate_mm: o.wall, target_mm: o.wallTarget,
      min_mm: fin(minT), p5_mm: fin(pct(0.05)), median_mm: fin(pct(0.5)),
      thinnestAt: minAt ? minAt.map((x) => +x.toFixed(1)) : null,
      belowGate_mm2: +belowGateArea.toFixed(1), belowTarget_mm2: +belowTargetArea.toFixed(1),
    },
  };
}

// ─────────────────────────────── rendering ───────────────────────────────
const FONT_SRC = {
  A: "01110,10001,10001,11111,10001,10001,10001", B: "11110,10001,10001,11110,10001,10001,11110", C: "01110,10001,10000,10000,10000,10001,01110",
  D: "11110,10001,10001,10001,10001,10001,11110", E: "11111,10000,10000,11110,10000,10000,11111", F: "11111,10000,10000,11110,10000,10000,10000",
  G: "01110,10001,10000,10111,10001,10001,01111", H: "10001,10001,10001,11111,10001,10001,10001", I: "01110,00100,00100,00100,00100,00100,01110",
  J: "00111,00010,00010,00010,00010,10010,01100", K: "10001,10010,10100,11000,10100,10010,10001", L: "10000,10000,10000,10000,10000,10000,11111",
  M: "10001,11011,10101,10101,10001,10001,10001", N: "10001,10001,11001,10101,10011,10001,10001", O: "01110,10001,10001,10001,10001,10001,01110",
  P: "11110,10001,10001,11110,10000,10000,10000", Q: "01110,10001,10001,10001,10101,10010,01101", R: "11110,10001,10001,11110,10100,10010,10001",
  S: "01111,10000,10000,01110,00001,00001,11110", T: "11111,00100,00100,00100,00100,00100,00100", U: "10001,10001,10001,10001,10001,10001,01110",
  V: "10001,10001,10001,10001,10001,01010,00100", W: "10001,10001,10001,10101,10101,10101,01010", X: "10001,10001,01010,00100,01010,10001,10001",
  Y: "10001,10001,01010,00100,00100,00100,00100", Z: "11111,00001,00010,00100,01000,10000,11111",
  0: "01110,10001,10011,10101,11001,10001,01110", 1: "00100,01100,00100,00100,00100,00100,01110", 2: "01110,10001,00001,00010,00100,01000,11111",
  3: "11111,00010,00100,00010,00001,10001,01110", 4: "00010,00110,01010,10010,11111,00010,00010", 5: "11111,10000,11110,00001,00001,10001,01110",
  6: "00110,01000,10000,11110,10001,10001,01110", 7: "11111,00001,00010,00100,01000,01000,01000", 8: "01110,10001,10001,01110,10001,10001,01110",
  9: "01110,10001,10001,01111,00001,00010,01100", " ": "00000,00000,00000,00000,00000,00000,00000",
  ".": "00000,00000,00000,00000,00000,01100,01100", ",": "00000,00000,00000,00000,01100,00100,01000", ":": "00000,01100,01100,00000,01100,01100,00000",
  "-": "00000,00000,00000,11111,00000,00000,00000", "+": "00000,00100,00100,11111,00100,00100,00000", "/": "00000,00001,00010,00100,01000,10000,00000",
  "(": "00010,00100,01000,01000,01000,00100,00010", ")": "01000,00100,00010,00010,00010,00100,01000", "%": "11000,11001,00010,00100,01000,10011,00011",
  "<": "00010,00100,01000,10000,01000,00100,00010", ">": "01000,00100,00010,00001,00010,00100,01000", "=": "00000,00000,11111,00000,11111,00000,00000",
  "_": "00000,00000,00000,00000,00000,00000,11111", "#": "01010,01010,11111,01010,11111,01010,01010", "?": "01110,10001,00001,00010,00100,00000,00100",
  "!": "00100,00100,00100,00100,00100,00000,00100", "'": "00100,00100,01000,00000,00000,00000,00000", "°": "01100,10010,10010,01100,00000,00000,00000",
  "×": "00000,10001,01010,00100,01010,10001,00000", "·": "00000,00000,00000,01100,01100,00000,00000", "≈": "00000,00000,01101,10110,00000,01101,10110",
};
const FONT = Object.fromEntries(Object.entries(FONT_SRC).map(([k, v]) => [k, v.split(",").map((r) => parseInt(r, 2))]));

const hex = (h) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim());
  if (!m) fail(`Colours must look like #a7b0b8, got "${h}"`);
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const INK = hex("#1d2329"), MUTED = hex("#69737c"), PAPER = hex("#f4f5f2"), GRID = hex("#e1e4df"), GRID_MAJOR = hex("#cdd2cb");
const PALETTE = ["#4cc9f0", "#f4a261", "#90be6d", "#e76f51", "#b388eb", "#ffd166", "#06d6a0", "#f28482"].map(hex);
const CHECK = { ok: hex("#c3c9cf"), over: hex("#f4a261"), thin: hex("#e76f51"), gate: hex("#c1121f"), bed: hex("#8ecae6") };

class Sheet {
  constructor(w, h, bg = PAPER) {
    this.w = w; this.h = h; this.px = new Uint8ClampedArray(w * h * 3);
    for (let i = 0; i < w * h; i++) { this.px[i * 3] = bg[0] * 255; this.px[i * 3 + 1] = bg[1] * 255; this.px[i * 3 + 2] = bg[2] * 255; }
  }
  rect(x, y, w, h, c) {
    for (let j = Math.max(0, y | 0); j < Math.min(this.h, (y + h) | 0); j++)
      for (let i = Math.max(0, x | 0); i < Math.min(this.w, (x + w) | 0); i++) { const p = (j * this.w + i) * 3; this.px[p] = c[0] * 255; this.px[p + 1] = c[1] * 255; this.px[p + 2] = c[2] * 255; }
  }
  frame(x, y, w, h, c, t = 2) { this.rect(x, y, w, t, c); this.rect(x, y + h - t, w, t, c); this.rect(x, y, t, h, c); this.rect(x + w - t, y, t, h, c); }
  text(x, y, str, scale = 2, c = INK) {
    let cx = x;
    for (const ch of String(str).toUpperCase()) {
      const g = FONT[ch] || FONT["?"];
      for (let r = 0; r < 7; r++) for (let b = 0; b < 5; b++) if (g[r] & (1 << (4 - b))) this.rect(cx + b * scale, y + r * scale, scale, scale, c);
      cx += 6 * scale;
    }
    return cx;
  }
  static textWidth(str, scale = 2) { return Math.max(0, String(str).length * 6 * scale - scale); }
  blit(img, x0, y0) {
    for (let j = 0; j < img.h; j++) for (let i = 0; i < img.w; i++) {
      const X = x0 + i, Y = y0 + j;
      if (X < 0 || Y < 0 || X >= this.w || Y >= this.h) continue;
      const s = (j * img.w + i) * 3, d = (Y * this.w + X) * 3;
      this.px[d] = img.rgb[s] * 255; this.px[d + 1] = img.rgb[s + 1] * 255; this.px[d + 2] = img.rgb[s + 2] * 255;
    }
  }
  png() { return encodePNG(this.w, this.h, this.px); }
}

let CRC_TABLE;
function crc32(buf) {
  if (!CRC_TABLE) { CRC_TABLE = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC_TABLE[n] = c >>> 0; } }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function encodePNG(w, h, rgb) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(raw, y * (w * 3 + 1) + 1); }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const VIEWS = {
  front: { v: [0, -1, 0], up: [0, 0, 1], label: "FRONT", ortho: true },
  right: { v: [1, 0, 0], up: [0, 0, 1], label: "RIGHT", ortho: true },
  top: { v: [0, 0, 1], up: [0, 1, 0], label: "TOP", ortho: true },
  iso: { v: norm([1, -1.15, 0.9]), up: [0, 0, 1], label: "3/4 VIEW", ortho: false },
  under: { v: norm([1, -1.1, -0.75]), up: [0, 0, 1], label: "FROM BELOW", ortho: false },
};
function basis(view) { const v = norm(view.v); const r = norm(cross(view.up, v)); const u = cross(v, r); return { r, u, v }; }

// Projected extents of a mesh's bounding box corners for a view (mm, relative to bbox centre).
function extents(lo, hi, view) {
  const { r, u } = basis(view);
  const c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
  for (const x of [lo[0], hi[0]]) for (const y of [lo[1], hi[1]]) for (const z of [lo[2], hi[2]]) {
    const d = [x - c[0], y - c[1], z - c[2]];
    const a = dot(d, r), b = dot(d, u);
    a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b);
  }
  return { a0, a1, b0, b1, w: a1 - a0, h: b1 - b0, center: c };
}

// Render one view into a w×h tile. scale = px per mm. Returns { w, h, rgb Float32Array }.
function renderTile(mesh, an, faceRGB, view, W, H, scale, opts = {}) {
  const S = 2;
  const { V, T } = mesh;
  const { N } = an;
  const nv = V.length / 3, nt = T.length / 3;
  const { r, u, v } = basis(view);
  const lo = opts.lo, hi = opts.hi;
  const ex = extents(lo, hi, view);
  const c = ex.center;
  const sc = scale * S, w = W * S, h = H * S;
  const cx = w / 2 - ((ex.a0 + ex.a1) / 2) * sc, cy = h / 2 + ((ex.b0 + ex.b1) / 2) * sc + (opts.shiftY || 0) * S;
  const PX = new Float64Array(nv), PY = new Float64Array(nv), PZ = new Float64Array(nv);
  for (let i = 0; i < nv; i++) {
    const dx = V[i * 3] - c[0], dy = V[i * 3 + 1] - c[1], dz = V[i * 3 + 2] - c[2];
    PX[i] = cx + (dx * r[0] + dy * r[1] + dz * r[2]) * sc;
    PY[i] = cy - (dx * u[0] + dy * u[1] + dz * u[2]) * sc;
    PZ[i] = dx * v[0] + dy * v[1] + dz * v[2];
  }
  const depth = new Float32Array(w * h).fill(-Infinity);
  const fid = new Int32Array(w * h).fill(-1);
  const cull = opts.closed;
  for (let f = 0; f < nt; f++) {
    if (cull && N[f * 3] * v[0] + N[f * 3 + 1] * v[1] + N[f * 3 + 2] * v[2] <= 0) continue;
    const a = T[f * 3], b = T[f * 3 + 1], cc = T[f * 3 + 2];
    const x0 = PX[a], y0 = PY[a], x1 = PX[b], y1 = PY[b], x2 = PX[cc], y2 = PY[cc];
    const area2 = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (Math.abs(area2) < 1e-9) continue;
    const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxX = Math.min(w - 1, Math.ceil(Math.max(x0, x1, x2)));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxY = Math.min(h - 1, Math.ceil(Math.max(y0, y1, y2)));
    const inv = 1 / area2;
    for (let py = minY; py <= maxY; py++) {
      const sy = py + 0.5;
      for (let px = minX; px <= maxX; px++) {
        const sx = px + 0.5;
        const w0 = ((x1 - sx) * (y2 - sy) - (x2 - sx) * (y1 - sy)) * inv;
        if (w0 < -1e-6) continue;
        const w1 = ((x2 - sx) * (y0 - sy) - (x0 - sx) * (y2 - sy)) * inv;
        if (w1 < -1e-6) continue;
        const w2 = 1 - w0 - w1;
        if (w2 < -1e-6) continue;
        const z = w0 * PZ[a] + w1 * PZ[b] + w2 * PZ[cc];
        const idx = py * w + px;
        if (z > depth[idx]) { depth[idx] = z; fid[idx] = f; }
      }
    }
  }
  // Per-face shading: key + fill light in camera space, flat facets.
  const L1 = norm([-0.45 * r[0] + 0.7 * u[0] + 0.6 * v[0], -0.45 * r[1] + 0.7 * u[1] + 0.6 * v[1], -0.45 * r[2] + 0.7 * u[2] + 0.6 * v[2]]);
  const L2 = norm([0.75 * r[0] - 0.2 * u[0] + 0.6 * v[0], 0.75 * r[1] - 0.2 * u[1] + 0.6 * v[1], 0.75 * r[2] - 0.2 * u[2] + 0.6 * v[2]]);
  const shade = new Float32Array(nt * 3);
  for (let f = 0; f < nt; f++) {
    let n = [N[f * 3], N[f * 3 + 1], N[f * 3 + 2]];
    if (dot(n, v) < 0) n = [-n[0], -n[1], -n[2]];
    const s = opts.flat
      ? 0.66 + 0.2 * Math.max(0, dot(n, L1)) + 0.16 * Math.max(0, dot(n, v)) // keeps check colours readable
      : 0.3 + 0.46 * Math.max(0, dot(n, L1)) + 0.16 * Math.max(0, dot(n, L2)) + 0.26 * Math.max(0, dot(n, v));
    for (let k = 0; k < 3; k++) shade[f * 3 + k] = Math.min(1, faceRGB[f * 3 + k] * s);
  }
  const img = new Float32Array(w * h * 3);
  const minor = opts.grid ? 10 : 0, half = 1 / sc;
  const cr = dot(c, r), cu = dot(c, u);
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const p = py * w + px, f = fid[p];
    let col;
    if (f >= 0) col = opts.silhouette ? INK : [shade[f * 3], shade[f * 3 + 1], shade[f * 3 + 2]];
    else {
      col = opts.bg || PAPER;
      if (minor) {
        const sa = (px + 0.5 - cx) / sc, sb = -(py + 0.5 - cy) / sc;
        let ga, gb, ok = true;
        if (view.ortho) { ga = sa + cr; gb = sb + cu; }
        else if (v[2] > 0.05) { // ground grid on the bed plane under the part
          const q = [c[0] + r[0] * sa + u[0] * sb, c[1] + r[1] * sa + u[1] * sb, c[2] + r[2] * sa + u[2] * sb];
          const t = (q[2] - lo[2]) / v[2];
          ga = q[0] - t * v[0]; gb = q[1] - t * v[1];
          const m = 12;
          ok = ga > lo[0] - m && ga < hi[0] + m && gb > lo[1] - m && gb < hi[1] + m;
        } else ok = false;
        if (ok) {
          const da = Math.abs(ga - Math.round(ga / minor) * minor), db = Math.abs(gb - Math.round(gb / minor) * minor);
          const w2 = view.ortho ? half : half * 1.6;
          if (da < w2 || db < w2) {
            const major = (Math.abs(ga - Math.round(ga / 50) * 50) < w2) || (Math.abs(gb - Math.round(gb / 50) * 50) < w2);
            col = major ? GRID_MAJOR : GRID;
          }
        }
      }
    }
    img[p * 3] = col[0]; img[p * 3 + 1] = col[1]; img[p * 3 + 2] = col[2];
  }
  // Outlines: silhouettes, occlusion steps and creases > 28°.
  if (!opts.silhouette) {
    const crease = Math.cos((28 * Math.PI) / 180), tol = 0.35 + 6 / sc;
    const line = [0.11, 0.13, 0.15];
    const ink = (p) => { img[p * 3] = img[p * 3] * 0.2 + line[0] * 0.8; img[p * 3 + 1] = img[p * 3 + 1] * 0.2 + line[1] * 0.8; img[p * 3 + 2] = img[p * 3 + 2] * 0.2 + line[2] * 0.8; };
    const marks = new Uint8Array(w * h);
    for (let py = 0; py < h - 1; py++) for (let px = 0; px < w - 1; px++) {
      const p = py * w + px;
      for (const q of [p + 1, p + w]) {
        const f1 = fid[p], f2 = fid[q];
        if (f1 === f2) continue;
        let edge = false;
        if (f1 < 0 || f2 < 0) edge = true;
        else if (Math.abs(depth[p] - depth[q]) > tol) edge = true;
        else if (N[f1 * 3] * N[f2 * 3] + N[f1 * 3 + 1] * N[f2 * 3 + 1] + N[f1 * 3 + 2] * N[f2 * 3 + 2] < crease) edge = true;
        if (edge) { marks[p] = 1; marks[q] = 1; }
      }
    }
    for (let p = 0; p < w * h; p++) if (marks[p]) ink(p);
  }
  // Downsample 2×2 → anti-aliased tile.
  const out = new Float32Array(W * H * 3);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (let k = 0; k < 3; k++) {
    let s = 0;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) s += img[((y * S + j) * w + (x * S + i)) * 3 + k];
    out[(y * W + x) * 3 + k] = s / (S * S);
  }
  return { w: W, h: H, rgb: out };
}

function faceColors(an, base, mode, o) {
  const nt = an.data.N.length / 3;
  const rgb = new Float32Array(nt * 3);
  const { faceBody, over, walls, bedFace } = an.data;
  for (let f = 0; f < nt; f++) {
    let c;
    if (mode === "check") {
      const t = walls ? walls.thick[f] : NaN;
      c = t < o.wall ? CHECK.gate : t < o.wallTarget ? CHECK.thin : over[f] ? CHECK.over : bedFace[f] ? CHECK.bed : CHECK.ok;
    } else if (mode === "tint") c = tint(base, faceBody[f]);
    else c = faceBody[f] <= 0 ? base : PALETTE[(faceBody[f] - 1) % PALETTE.length];
    rgb[f * 3] = c[0]; rgb[f * 3 + 1] = c[1]; rgb[f * 3 + 2] = c[2];
  }
  return rgb;
}

// Extra bodies in a compare column keep the column's hue: darker, lighter, darker still …
function tint(c, k) {
  if (k <= 0) return c;
  const [to, amt] = [[[0, 0, 0], 0.38], [[1, 1, 1], 0.5], [[0, 0, 0], 0.6], [[1, 1, 1], 0.72]][(k - 1) % 4];
  return [0, 1, 2].map((i) => c[i] * (1 - amt) + to[i] * amt);
}

function scaleBar(sheet, x, y, scale) {
  const options = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const mm = options.find((m) => m * scale >= 50) || 500;
  const len = Math.round(mm * scale);
  sheet.rect(x, y, len, 3, INK); sheet.rect(x, y - 6, 2, 9, INK); sheet.rect(x + len - 2, y - 6, 2, 9, INK);
  sheet.text(x + len + 8, y - 6, `${mm} MM`, 2, MUTED);
}

const statusWord = (g) => ({ pass: "PASS", "pass-rotated": "PASS (TURN 90°)", warn: "CHECK", fail: "FAIL", unevaluated: "N/A" })[g] || String(g).toUpperCase();
const sizeLine = (s) => `${fmt(s[0])} × ${fmt(s[1])} × ${fmt(s[2])} MM`;
const trim = (x) => (Number.isFinite(x) ? (+x.toFixed(1)).toString() : "—");
const sizeShort = (s) => `${trim(s[0])} × ${trim(s[1])} × ${trim(s[2])} MM`;

function header(sheet, title, sub) {
  sheet.rect(0, 0, sheet.w, 76, [1, 1, 1]);
  sheet.rect(0, 75, sheet.w, 1, GRID_MAJOR);
  sheet.text(24, 14, title.slice(0, Math.floor((sheet.w - 48) / 18)), 3, INK);
  sheet.text(24, 50, sub.slice(0, Math.floor((sheet.w - 48) / 12)), 2, MUTED);
}

function renderViews(mesh, an, name, o) {
  const tile = 560, W = tile * 2, H = 76 + tile * 2;
  const sheet = new Sheet(W, H);
  const { report } = an;
  const lo = report.bbox.min, hi = report.bbox.max, size = report.bbox.size;
  const base = hex(o.color);
  const rgb = faceColors(an, base, "views", o);
  const closed = report.watertight.closed;
  const orthoScale = (tile * 0.74) / Math.max(size[0], size[1], size[2], 1e-6);
  const iso = extents(lo, hi, VIEWS.iso);
  const isoScale = (tile * 0.8) / Math.max(iso.w, iso.h, 1e-6);
  const g = report.gates;
  header(sheet, name, `${sizeLine(size)} · ${report.bodies.length} ${report.bodies.length === 1 ? "BODY" : "BODIES"} · ≈${fmt(report.mass_g.value, 0)} G SOLID · WATERTIGHT ${statusWord(g.watertight)} · WALL ${statusWord(g.wall)}`);
  const cells = [["front", 0, 0], ["right", 1, 0], ["top", 0, 1], ["iso", 1, 1]];
  for (const [key, cx, cy] of cells) {
    const view = VIEWS[key];
    const s = view.ortho ? orthoScale : isoScale;
    const img = renderTile(mesh, an.data ? { N: an.data.N } : an, rgb, view, tile, tile, s, { lo, hi, closed, grid: true });
    const x0 = cx * tile, y0 = 76 + cy * tile;
    sheet.blit(img, x0, y0);
    sheet.text(x0 + 16, y0 + 14, view.label, 2, MUTED);
    if (view.ortho) scaleBar(sheet, x0 + 18, y0 + tile - 22, s);
  }
  sheet.rect(tile - 1, 76, 2, tile * 2, GRID_MAJOR);
  sheet.rect(0, 76 + tile - 1, W, 2, GRID_MAJOR);
  return sheet;
}

function renderCheck(mesh, an, name, o) {
  const tile = 560, W = tile * 2, H = 76 + tile + 56;
  const sheet = new Sheet(W, H);
  const { report } = an;
  const lo = report.bbox.min, hi = report.bbox.max;
  const rgb = faceColors(an, null, "check", o);
  const g = report.gates;
  header(sheet, `${name} · PRINT CHECK`, `WATERTIGHT ${statusWord(g.watertight)} · WALL ${statusWord(g.wall)} · OVERHANG ${statusWord(g.overhang)} · BED ${statusWord(g.bed)} (${o.bed.join("×")})`);
  for (const [i, key] of ["iso", "under"].entries()) {
    const view = VIEWS[key];
    const ex = extents(lo, hi, view);
    const s = (tile * 0.8) / Math.max(ex.w, ex.h, 1e-6);
    const img = renderTile(mesh, { N: an.data.N }, rgb, view, tile, tile, s, { lo, hi, closed: report.watertight.closed, grid: true, flat: true });
    sheet.blit(img, i * tile, 76);
    sheet.text(i * tile + 16, 76 + 14, view.label, 2, MUTED);
  }
  sheet.rect(tile - 1, 76, 2, tile, GRID_MAJOR);
  sheet.rect(0, 76 + tile, W, 56, [1, 1, 1]);
  let x = 24;
  const y = 76 + tile + 20;
  for (const [c, label] of [[CHECK.gate, `WALL < ${o.wall} MM`], [CHECK.thin, `WALL < ${o.wallTarget} MM`], [CHECK.over, `OVERHANG > ${o.overhang}°`], [CHECK.bed, "ON THE BED"], [CHECK.ok, "OK"]]) {
    sheet.rect(x, y - 1, 16, 16, c); x = sheet.text(x + 24, y, label, 2, INK) + 30;
  }
  return sheet;
}

// ─────────────────────────────── commands ───────────────────────────────
function outPaths(file, o, suffix = "") {
  const dir = path.resolve(o.out || path.dirname(file));
  mkdirSync(dir, { recursive: true });
  const name = o.name || path.basename(file).replace(/\.[^.]+$/, "") + suffix;
  return { dir, name, at: (ext) => path.join(dir, `${name}${ext}`) };
}

function summaryText(rep, files) {
  const r = rep;
  const g = r.gates;
  const L = [];
  L.push(`3DJ bench · ${path.basename(r.input)}${r.compiled ? "  (compiled locally with OpenSCAD)" : ""}`);
  L.push(`  size      ${fmt(r.bbox.size[0])} × ${fmt(r.bbox.size[1])} × ${fmt(r.bbox.size[2])} mm   volume ${fmt(r.volume_cm3, 2)} cm³`);
  L.push(`  mass      ≈${fmt(r.mass_g.value, 0)} g solid · ≈${fmt(r.mass_g.sliced_estimate, 0)} g as printed (${r.mass_g.sliced_basis}) at ${r.mass_g.density_g_cm3} g/cm³`);
  L.push(`  bodies    ${r.bodies.length} closed bod${r.bodies.length === 1 ? "y" : "ies"}${r.sealedVoids ? ` + ${r.sealedVoids} sealed void(s)` : ""} · watertight ${statusWord(g.watertight)}${r.watertight.closed ? "" : ` (${r.watertight.openEdges} open, ${r.watertight.nonManifoldEdges} non-manifold, ${r.watertight.windingErrors} flipped edges)`}`);
  const w1 = (x) => (typeof x === "number" ? x.toFixed(1) : x);
  if (r.walls.evaluated) L.push(`  walls     min ${w1(r.walls.min_mm)} · p5 ${w1(r.walls.p5_mm)} · median ${w1(r.walls.median_mm)} mm → ${statusWord(g.wall)} (gate ${r.walls.gate_mm}, target ${r.walls.target_mm})${r.walls.belowTarget_mm2 ? ` · ${r.walls.belowTarget_mm2} mm² under target${r.walls.thinnestAt ? ` near [${r.walls.thinnestAt.join(", ")}]` : ""}` : ""}`);
  else L.push(`  walls     not evaluated (${r.walls.reason})`);
  const top = r.overhang.regions[0];
  L.push(`  overhang  ${fmt(r.overhang.area_mm2 / 100, 2)} cm² beyond ${r.overhang.angleDeg}° → ${statusWord(g.overhang)}${top ? ` · largest ${top.area_mm2} mm² at z ${top.z[0]}–${top.z[1]}` : " · no supports expected"}`);
  L.push(`  bed       ${r.bed.volume.join(" × ")} mm → ${statusWord(g.bed)} · footprint ${fmt(r.bed.footprint_mm2 / 100, 2)} cm²`);
  if (r.parameters?.length) {
    const ps = r.parameters.filter((p) => p.editable && (p.range || p.overridden)).map((p) => `${p.name}=${p.value}${p.overridden ? "*" : ""}`);
    if (ps.length) L.push(`  params    ${ps.join("  ")}`);
  }
  for (const w of r.warnings || []) L.push(`  warning   ${w}`);
  for (const e of (r.echoes || []).slice(0, 5)) L.push(`  echo      ${e}`);
  if (files.length) L.push(`  files     ${files.map((f) => path.basename(f)).join(" · ")}`);
  L.push(`  note      geometry screen against the 3DJ gates — not a manufacturing certification`);
  return L.join("\n");
}

async function cmdBuild(file, o) {
  const { mesh, info } = await loadModel(file, o);
  const an = analyze(mesh, o);
  const out = outPaths(file, o);
  const files = [];
  if ((info.compiled || info.transformed) && o.stl) { const f = out.at(".stl"); writeSTL(f, mesh, an.data.N); files.push(f); }
  if (o.render) {
    log("Rendering views …");
    const v = out.at(".views.png"); writeFileSync(v, renderViews(mesh, an, out.name, o).png()); files.push(v);
    const c = out.at(".check.png"); writeFileSync(c, renderCheck(mesh, an, out.name, o).png()); files.push(c);
  }
  const report = { tool: `3dj-bench ${VERSION}`, input: info.input, compiled: info.compiled, parameters: info.parameters, overrides: o.defines,
    rotate: o.rotate, fit: o.fit, unitsKnown: info.unitsKnown, ...an.report, warnings: info.warnings, echoes: info.echoes,
    note: "Geometry screen against the 3DJ Design Evidence Pack v1 gates. Not a manufacturing certification; verify with your slicer, printer and material." };
  const rj = out.at(".report.json"); files.push(rj);
  report.files = files.map((f) => path.basename(f));
  writeFileSync(rj, JSON.stringify(report, null, 2) + "\n");
  return { report, text: summaryText(report, files) };
}

async function cmdCompare(files, o) {
  if (files.length < 2) fail("compare needs at least two models.");
  if (files.length > 6) fail("compare takes at most six models at a time.");
  const models = [];
  for (const [i, spec] of files.entries()) {
    // "part.scad@height=160,width=40" compares parameter variants of one file.
    const m = /^(.+\.scad)@(.+)$/i.exec(spec);
    const f = m ? m[1] : spec;
    const variant = m ? m[2].split(",").map((d) => d.trim()).filter(Boolean) : [];
    let loaded;
    try { loaded = await loadModel(f, { ...o, defines: [...o.defines, ...variant] }); } catch (e) {
      if (e instanceof BenchError) fail(`${String.fromCharCode(65 + i)} · ${spec}\n${e.message}`, e.exitCode);
      throw e;
    }
    const { mesh, info } = loaded;
    const an = analyze(mesh, { ...o });
    const label = o.labels?.[i] || (variant.length ? variant.join(" ") : path.basename(f).replace(/\.[^.]+$/, ""));
    models.push({ file: f, spec, variant: variant.length > 0, mesh, info, an, label, letter: String.fromCharCode(65 + i) });
  }
  const n = models.length;
  const tile = n <= 3 ? 460 : 380, silH = Math.round(tile * 0.62), band = 70;
  const W = tile * n, H = 76 + tile + band + silH + 34;
  const sheet = new Sheet(W, H);
  const variants = models.every((m) => m.variant && m.file === models[0].file);
  const silView = VIEWS[o.silhouette];
  header(sheet, o.title || (variants ? "VARIANTS · SAME SCALE" : "CONCEPTS · SAME SCALE"),
    `${n} ${variants ? "VARIANTS" : "DIRECTIONS"} · 3/4 VIEW + ${o.silhouette === "right" ? "SIDE" : "FRONT"} SILHOUETTE · GRID 10 MM`);
  let isoS = Infinity, silS = Infinity;
  for (const m of models) {
    const r = m.an.report, ex = extents(r.bbox.min, r.bbox.max, VIEWS.iso), fx = extents(r.bbox.min, r.bbox.max, silView);
    isoS = Math.min(isoS, (tile * 0.8) / Math.max(ex.w, ex.h, 1e-6));
    silS = Math.min(silS, (tile * 0.8) / Math.max(fx.w, 1e-6), (silH * 0.78) / Math.max(fx.h, 1e-6));
  }
  const summaries = [];
  for (const [i, m] of models.entries()) {
    const r = m.an.report, x0 = i * tile;
    const rgb = faceColors(m.an, i === 0 ? hex(o.color) : PALETTE[(i - 1) % PALETTE.length], "tint", o);
    sheet.blit(renderTile(m.mesh, { N: m.an.data.N }, rgb, VIEWS.iso, tile, tile, isoS, { lo: r.bbox.min, hi: r.bbox.max, closed: r.watertight.closed, grid: true }), x0, 76);
    const yb = 76 + tile;
    sheet.rect(x0, yb, tile, band, [1, 1, 1]);
    sheet.text(x0 + 18, yb + 14, `${m.letter} · ${m.label}`.slice(0, Math.floor((tile - 36) / 18)), 3, INK);
    sheet.text(x0 + 18, yb + 46, `${sizeShort(r.bbox.size)} · ≈${fmt(r.mass_g.value, 0)} G`.slice(0, Math.floor((tile - 36) / 12)), 2, MUTED);
    sheet.blit(renderTile(m.mesh, { N: m.an.data.N }, rgb, silView, tile, silH, silS, { lo: r.bbox.min, hi: r.bbox.max, closed: r.watertight.closed, silhouette: true, bg: [1, 1, 1] }), x0, yb + band);
    if (i > 0) sheet.rect(x0 - 1, 76, 2, H - 76 - 34, GRID_MAJOR);
    summaries.push({ letter: m.letter, label: m.label, spec: m.spec, input: m.info.input, bbox: r.bbox, volume_cm3: r.volume_cm3, mass_g: r.mass_g.value, bodies: r.bodies.length, gates: r.gates, walls: r.walls, overhang_mm2: r.overhang.area_mm2, warnings: m.info.warnings });
  }
  sheet.text(18, H - 24, `SAME SCALE ACROSS ${variants ? "VARIANTS" : "CONCEPTS"} · SILHOUETTES SHOW STANCE AND PROPORTION`, 2, MUTED);
  const out = outPaths(models[0].file, { ...o, name: o.name || "compare" });
  const png = out.at(".png");
  writeFileSync(png, sheet.png());
  const rj = out.at(".report.json");
  const report = { tool: `3dj-bench ${VERSION}`, command: "compare", concepts: summaries, files: [path.basename(png), path.basename(rj)] };
  writeFileSync(rj, JSON.stringify(report, null, 2) + "\n");
  const lines = [`3DJ bench · compare (${n} concepts, same scale)`];
  for (const s of summaries) lines.push(`  ${s.letter} ${s.label.padEnd(18)} ${sizeLine(s.bbox.size).toLowerCase().padEnd(30)} ≈${fmt(s.mass_g, 0)} g · watertight ${statusWord(s.gates.watertight)} · wall ${statusWord(s.gates.wall)} · bed ${statusWord(s.gates.bed)} · overhang ${fmt(s.overhang_mm2 / 100, 1)} cm²`);
  lines.push(`  files     ${path.basename(png)} · ${path.basename(rj)}`);
  return { report, text: lines.join("\n") };
}

async function cmdOrient(file, o) {
  const candidates = [
    { label: "AS MODELLED", rotate: [0, 0, 0] }, { label: "UPSIDE DOWN", rotate: [180, 0, 0] },
    { label: "ON FRONT", rotate: [90, 0, 0] }, { label: "ON BACK", rotate: [-90, 0, 0] },
    { label: "ON LEFT SIDE", rotate: [0, -90, 0] }, { label: "ON RIGHT SIDE", rotate: [0, 90, 0] },
  ];
  const base = await loadModel(file, { ...o, rotate: null, fit: o.fit });
  const soup = new Float64Array(base.mesh.T.length * 3);
  for (let f = 0; f < base.mesh.T.length / 3; f++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) soup[f * 9 + j * 3 + k] = base.mesh.V[base.mesh.T[f * 3 + j] * 3 + k];
  const results = [];
  for (const cnd of candidates) {
    const rot = o.rotate ? cnd.rotate.map((d, i) => d + o.rotate[i]) : cnd.rotate;
    const mesh = weld(transformSoup(Float64Array.from(soup), { rotate: rot, seat: true }));
    const an = analyze(mesh, { ...o, probe: 0.0001 }); // walls do not change with orientation
    const r = an.report;
    results.push({ ...cnd, rotate: rot, mesh, an, overhang: r.overhang.area_mm2, footprint: r.bed.footprint_mm2, height: r.bbox.size[2], fits: r.bed.fits || r.bed.fitsRotated90 });
  }
  // Fit first, then stability (a pose balanced on an edge needs a raft whatever the support area), then support.
  const ranked = [...results].sort((a, b) => (b.fits - a.fits) || ((a.footprint < 50) - (b.footprint < 50)) || (a.overhang - b.overhang) || (b.footprint - a.footprint) || (a.height - b.height));
  const best = ranked[0];
  const out = outPaths(file, o);
  const files = [];
  const stl = out.at(".oriented.stl"); writeSTL(stl, best.mesh, best.an.data.N); files.push(stl);
  if (o.render) {
    const tile = 400, W = tile * 3, band = 92, H = 76 + (tile + band) * 2;
    const sheet = new Sheet(W, H);
    header(sheet, `${out.name} · PRINT ORIENTATION`, `SEEN FROM BELOW · BLUE = ON THE BED · AMBER = OVERHANG > ${o.overhang}° · BEST: ${best.label}`);
    for (const [i, cnd] of results.entries()) {
      const cx = (i % 3) * tile, cy = 76 + Math.floor(i / 3) * (tile + band);
      const r = cnd.an.report, ex = extents(r.bbox.min, r.bbox.max, VIEWS.under);
      const rgb = faceColors(cnd.an, null, "check", { ...o, wall: -1, wallTarget: -1 });
      sheet.blit(renderTile(cnd.mesh, { N: cnd.an.data.N }, rgb, VIEWS.under, tile, tile, (tile * 0.74) / Math.max(ex.w, ex.h, 1e-6), { lo: r.bbox.min, hi: r.bbox.max, closed: r.watertight.closed, grid: false, flat: true }), cx, cy);
      sheet.rect(cx, cy + tile, tile, band, [1, 1, 1]);
      sheet.text(cx + 16, cy + tile + 12, `${String.fromCharCode(65 + i)} · ${cnd.label}${cnd === best ? " · BEST" : ""}`, 2, cnd === best ? hex("#0077b6") : INK);
      sheet.text(cx + 16, cy + tile + 38, `SUPPORT ${fmt(cnd.overhang / 100, 1)} CM2 · BED ${fmt(cnd.footprint / 100, 1)} CM2`, 2, MUTED);
      sheet.text(cx + 16, cy + tile + 62, cnd.fits ? `HEIGHT ${fmt(cnd.height, 0)} MM` : `HEIGHT ${fmt(cnd.height, 0)} MM · DOES NOT FIT BED`, 2, cnd.fits ? MUTED : CHECK.gate);
      if (cnd === best) sheet.frame(cx + 2, cy + 2, tile - 4, tile + band - 4, hex("#00b4d8"), 4);
    }
    const png = out.at(".orient.png"); writeFileSync(png, sheet.png()); files.push(png);
  }
  const report = {
    tool: `3dj-bench ${VERSION}`, command: "orient", input: path.resolve(file),
    best: { label: best.label, rotate: best.rotate, overhang_mm2: best.overhang, footprint_mm2: best.footprint, height_mm: +best.height.toFixed(2) },
    candidates: results.map((c) => ({ label: c.label, rotate: c.rotate, overhang_mm2: c.overhang, footprint_mm2: c.footprint, height_mm: +c.height.toFixed(2), fitsBed: c.fits })),
    files: files.map((f) => path.basename(f)),
    note: "Ranks the six face-down orientations by bed fit, stability (at least 50 mm² flat on the bed), support area, bed contact and height. Strength follows layer direction too: keep layer lines along the main load path. For multi-part files, orient each part separately (-D part=N --name NAME-partN).",
  };
  const rj = out.at(".orient.json"); writeFileSync(rj, JSON.stringify(report, null, 2) + "\n"); files.push(rj);
  const lines = [`3DJ bench · orient ${path.basename(file)}`];
  for (const c of results) lines.push(`  ${c === best ? "→" : " "} ${c.label.padEnd(14)} support ${fmt(c.overhang / 100, 2).padStart(6)} cm²  bed contact ${fmt(c.footprint / 100, 2).padStart(6)} cm²  height ${fmt(c.height).padStart(6)} mm${c.fits ? "" : "  (does not fit bed)"}`);
  lines.push(`  best      ${best.label} → rebuild with --rotate ${best.rotate.join(",")} · STL written as ${path.basename(stl)}`);
  lines.push(`  files     ${files.map((f) => path.basename(f)).join(" · ")}`);
  return { report, text: lines.join("\n") };
}

function cmdParams(file) {
  if (!existsSync(file)) fail(`No such file: ${file}`);
  const ps = scadParams(readFileSync(file, "utf8"));
  const editable = ps.filter((p) => p.editable && p.range);
  const constants = ps.filter((p) => p.editable && !p.range && !p.name.startsWith("$"));
  const lines = [`Parameters in ${path.basename(file)}`];
  if (!editable.length) lines.push("  (no top-level numeric parameters found — declare them like  width = 60; // [20:1:120])");
  for (const p of editable) {
    const range = p.range ? (p.range.step !== undefined ? `[${p.range.min} : ${p.range.step} : ${p.range.max}]` : `[${p.range.min} : ${p.range.max}]`) : "(no range)";
    lines.push(`  ${p.name.padEnd(16)} ${String(p.value).padStart(8)}   ${range.padEnd(20)} ${p.note || ""}`.trimEnd());
  }
  if (constants.length) lines.push(`  constants without a range: ${constants.map((p) => `${p.name}=${p.value}`).join(", ")} — 3DJ shows these as knobs too; give them a range, or write them as expressions (steps = 16 * 2;)`);
  const derived = ps.filter((p) => !p.editable && !p.name.startsWith("$"));
  if (derived.length) lines.push(`  derived: ${derived.map((p) => p.name).join(", ")}`);
  if (editable.length) lines.push(`Try:  node bench.mjs build ${path.basename(file)} -D ${editable[0].name}=${editable[0].value}`);
  return { report: { parameters: ps }, text: lines.join("\n") };
}

async function main() {
  const { cmd, files, o } = parseArgs(process.argv.slice(2));
  if (cmd === "help") { console.log(HELP); return; }
  if (cmd === "setup") { const r = cmdSetup(); if (o.json) process.stdout.write(JSON.stringify(r.report, null, 2) + "\n"); else console.log(r.text); return; }
  if (!files.length) fail(`${cmd} needs a model file. Run with --help.`);
  o.color = o.color || "#a7b0b8";
  hex(o.color);
  let result;
  if (cmd === "build") { if (files.length > 1) fail("build takes one model; use compare for several."); result = await cmdBuild(files[0], o); }
  else if (cmd === "compare") result = await cmdCompare(files, o);
  else if (cmd === "orient") result = await cmdOrient(files[0], o);
  else if (cmd === "params") result = cmdParams(files[0]);
  else fail(`Unknown command "${cmd}". Use build, compare, orient or params.`);
  if (o.json) process.stdout.write(JSON.stringify(result.report, null, 2) + "\n");
  else console.log(result.text);
}

main().catch((e) => {
  if (e instanceof BenchError) { console.error(e.message); process.exit(e.exitCode); }
  console.error(e?.stack || String(e));
  process.exit(1);
});
