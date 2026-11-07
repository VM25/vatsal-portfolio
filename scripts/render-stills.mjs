/*
  Renders the no-WebGL fallback stills: the scene shader at the five key
  positions, t = 11, n = 512, landscape 1440x900 and portrait 720x1440.

  Run by hand when the shader or scene.ts changes: node scripts/render-stills.mjs
  The output (public/scene/{land,port}{0..4}.jpg) is checked in; the build never
  renders anything.

  The harness is a bare page that runs the same FRAGMENT_SRC and sceneState the
  app uses. Both are TypeScript, so they are transpiled with the TypeScript
  compiler already in node_modules and concatenated into one classic script.
*/
import { chromium } from "@playwright/test";
import ts from "typescript";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "public/scene");
const SIZES = { land: [1440, 900], port: [720, 1440] };
const KEYS = [0, 0.3, 0.55, 0.78, 1];
const T = 11;
const N = 512;
const QUALITY = 0.8;
const MAX_TOTAL = 1.2 * 1024 * 1024;

async function bundle() {
  const parts = [];
  for (const f of ["src/lib/scene.ts", "src/components/world/shader.ts"]) {
    const src = await readFile(path.join(root, f), "utf8");
    const js = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    parts.push(js.replace(/^export\s+/gm, ""));
  }
  return parts.join("\n");
}

const harness = (code) => `<!doctype html><meta charset="utf-8"><body style="margin:0"><canvas id="c"></canvas><script>
${code}
window.render = (w, h, p, keys, t, n) => {
  const c = document.getElementById("c");
  c.width = w; c.height = h;
  const gl = c.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
  if (!gl) throw new Error("no WebGL in the render browser");
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERTEX_SRC));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAGMENT_SRC));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const st = sceneState(p, w / h, t, keys);
  st.uN = n;
  gl.viewport(0, 0, w, h);
  gl.uniform2f(gl.getUniformLocation(prog, "uRes"), w, h);
  UNIFORMS.forEach((u) => gl.uniform1f(gl.getUniformLocation(prog, u), st[u]));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  // Sample a 5x5 grid straight from the framebuffer for the sanity check.
  const px = new Uint8Array(4), samples = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    gl.readPixels(Math.floor((i + .5) / 5 * w), Math.floor((j + .5) / 5 * h), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    samples.push([px[0], px[1], px[2]]);
  }
  return { url: c.toDataURL("image/jpeg", ${QUALITY}), samples };
};
</script>`;

function check(name, samples) {
  const lum = samples.map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b);
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  const spread = Math.max(...lum) - Math.min(...lum);
  if (mean < 2 || spread < 6) {
    throw new Error(`${name} looks blank or uniform (mean luminance ${mean.toFixed(1)}, spread ${spread.toFixed(1)})`);
  }
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(harness(await bundle()));
let total = 0;
for (const [orient, [w, h]] of Object.entries(SIZES)) {
  for (let i = 0; i < KEYS.length; i++) {
    const name = `${orient}${i}`;
    const { url, samples } = await page.evaluate(
      ([a, b, c, d, e, f]) => window.render(a, b, c, d, e, f),
      [w, h, KEYS[i], KEYS, T, N],
    );
    check(name, samples);
    const file = path.join(OUT, `${name}.jpg`);
    await writeFile(file, Buffer.from(url.split(",")[1], "base64"));
    const size = (await stat(file)).size;
    total += size;
    console.log(`${name}.jpg ${w}x${h} ${(size / 1024).toFixed(0)} KB`);
  }
}
await browser.close();
console.log(`total ${(total / 1024).toFixed(0)} KB`);
if (total > MAX_TOTAL) throw new Error(`stills total ${total} bytes exceeds the 1.2 MB budget`);
