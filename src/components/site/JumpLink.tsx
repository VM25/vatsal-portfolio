"use client";

import type { AnchorHTMLAttributes } from "react";
import { onJumpClick } from "@/components/site/jump";

/**
 * An in-page link that jumps through jump.ts once hydrated. The server renders a plain
 * anchor, so before hydration and without JavaScript it is the browser's own jump.
 */
export function JumpLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: `#${string}` }) {
  return <a {...props} onClick={onJumpClick} />;
}
