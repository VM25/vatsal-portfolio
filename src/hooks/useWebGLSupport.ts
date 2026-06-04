"use client";

import { useEffect, useState } from "react";

/** Feature-detect WebGL without throwing in unusual environments. */
export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return (
      !!window.WebGLRenderingContext &&
      !!(
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
      )
    );
  } catch {
    return false;
  }
}

/**
 * Returns `null` while detecting, then a boolean. Also treats coarse, low-core
 * devices conservatively so phones can fall back to the static composition.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const hasWebGL = detectWebGL();
    setSupported(hasWebGL);
  }, []);

  return supported;
}
