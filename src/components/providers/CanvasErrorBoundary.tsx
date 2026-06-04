"use client";

import { Component, type ReactNode } from "react";

/**
 * Isolates WebGL/Three.js render failures. If anything in the canvas subtree
 * throws, we render the (optional) fallback instead of crashing the page — the
 * site must remain fully usable without 3D.
 */
export class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
