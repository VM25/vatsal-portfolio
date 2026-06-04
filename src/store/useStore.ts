import { create } from "zustand";

interface ExperienceState {
  /** Active section id, driven by scrollspy. */
  activeSection: string;
  setActiveSection: (id: string) => void;

  /** Normalized scroll progress 0..1, mapped to the camera journey. Read in
   *  useFrame (not subscribed) so it never re-renders React. */
  journey: number;
  setJourney: (v: number) => void;

  /** Currently opened project (chamber) id, or null. Drives DOM + camera focus. */
  activeProject: string | null;
  setActiveProject: (id: string | null) => void;

  /** Currently selected experience role id in the archive. */
  activeRole: string | null;
  setActiveRole: (id: string | null) => void;

  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  sceneReady: boolean;
  setSceneReady: (v: boolean) => void;
}

export const useStore = create<ExperienceState>((set) => ({
  activeSection: "hero",
  setActiveSection: (id) => set({ activeSection: id }),

  journey: 0,
  setJourney: (v) => set({ journey: v }),

  activeProject: null,
  setActiveProject: (id) => set({ activeProject: id }),

  activeRole: null,
  setActiveRole: (id) => set({ activeRole: id }),

  reducedMotion: false,
  setReducedMotion: (v) => set({ reducedMotion: v }),

  sceneReady: false,
  setSceneReady: (v) => set({ sceneReady: v }),
}));
