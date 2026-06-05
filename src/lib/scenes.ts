// The story as a sequence of pinned, vertical cinematic chapters.
// Vertical wheel input scrubs each pinned chapter's internal timeline — this is
// NOT a horizontal corridor. Each chapter answers exactly one question.
export const SCENES = [
  { id: "identity", label: "Entry", index: "00" }, // Who is Vatsal?
  { id: "origin", label: "Origin", index: "01" }, // How did CS become FE?
  { id: "capability", label: "Capability", index: "02" }, // What can he build?
  { id: "projects", label: "Engines", index: "03" }, // What proof exists?
  { id: "experience", label: "Record", index: "04" }, // Where has he executed?
  { id: "research", label: "Research", index: "05" }, // Where is it going?
  { id: "contact", label: "Signal", index: "06" }, // How to reach him?
] as const;

export type SceneId = (typeof SCENES)[number]["id"];
export const SCENE_COUNT = SCENES.length;
