import { describe, expect, it } from "vitest";
import { FRAGMENT_SRC, UNIFORMS, VERTEX_SRC } from "@/components/world/shader";
import { KEYS, sceneState } from "@/lib/scene";

describe("shader", () => {
  it("lists exactly the uniforms sceneState returns", () => {
    const keys = Object.keys(sceneState(0.4, 1.6, 3, KEYS)).sort();
    expect([...UNIFORMS].sort()).toEqual(keys);
  });

  it("declares every uniform in the fragment shader", () => {
    const decl = FRAGMENT_SRC.split("\n").find((l) => l.startsWith("uniform vec2 uRes;"));
    expect(decl).toBeDefined();
    for (const name of UNIFORMS) expect(decl).toMatch(new RegExp(`\\b${name}\\b`));
  });

  it("keeps the prototype's vertex shader and entry points", () => {
    expect(VERTEX_SRC).toBe("attribute vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }");
    expect(FRAGMENT_SRC.startsWith("precision highp float;\n")).toBe(true);
    expect(FRAGMENT_SRC).toContain("float jit=((noise(vec2(y*55.,tw*2.3))-.5)+(noise(vec2(y*130.,tw*3.1+5.))-.5)*.6)*0.11/sqrt(uN);");
    expect(FRAGMENT_SRC.trimEnd().endsWith("gl_FragColor=vec4(col,1.);\n}")).toBe(true);
  });
});
