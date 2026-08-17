import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Language = "typescript" | "python" | "bash" | "filelisting";

export const LANGUAGE_OPTIONS: { id: Language; label: string }[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "bash", label: "Bash" },
  { id: "filelisting", label: "File listing" },
];

export const languageAtom = atomWithStorage<Language>(
  "mfp.language",
  "typescript",
);
export const themeAtom = atomWithStorage<string>("mfp.theme", "monokai");
export const fontSizeAtom = atomWithStorage<number>("mfp.fontSize", 14);
export const ligaturesAtom = atomWithStorage<boolean>("mfp.ligatures", true);

// Ephemeral (in-memory) — intentionally not persisted across reloads.
export const searchAtom = atom<string>("");
export const compareAtom = atom<string[]>([]);
