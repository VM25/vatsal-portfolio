import { create } from "zustand";
import type { SceneId } from "@/lib/scenes";

interface ExperienceState {
  /** The chapter currently crossing the viewport center (drives nav + backdrop). */
  activeScene: SceneId;
  setActiveScene: (id: SceneId) => void;

  /** Focused project engine id inside the Projects chapter, or null (overview). */
  activeProject: string | null;
  setActiveProject: (id: string | null) => void;

  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  ready: boolean;
  setReady: (v: boolean) => void;
}

export const useStore = create<ExperienceState>((set) => ({
  activeScene: "identity",
  setActiveScene: (id) =>
    set((s) => (s.activeScene === id ? s : { activeScene: id })),
  activeProject: null,
  setActiveProject: (id) => set({ activeProject: id }),
  reducedMotion: false,
  setReducedMotion: (v) => set({ reducedMotion: v }),
  ready: false,
  setReady: (v) => set({ ready: v }),
}));
