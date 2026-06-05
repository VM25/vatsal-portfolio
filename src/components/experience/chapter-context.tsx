"use client";

import { createContext, useContext } from "react";
import { motionValue, type MotionValue } from "framer-motion";

// A chapter hands its internal scroll progress (0→1) to the scene inside it via
// context, so scenes can stay plain JSX children of <Chapter> (server-passable)
// instead of a render-prop function (which can't cross the RSC boundary).
const fallback = motionValue(1);
const ChapterProgressContext = createContext<MotionValue<number>>(fallback);

export const ChapterProgressProvider = ChapterProgressContext.Provider;

export function useChapterProgress(): MotionValue<number> {
  return useContext(ChapterProgressContext);
}
