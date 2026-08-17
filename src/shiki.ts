import { createHighlighter, type Highlighter } from "shiki";
import type { Language } from "./state/atoms";

export const THEME_OPTIONS: { id: string; label: string }[] = [
  { id: "monokai", label: "Monokai" },
  { id: "solarized-dark", label: "Solarized Dark" },
  { id: "ayu-dark", label: "Ayu Dark" },
  { id: "laserwave", label: "Laserwave" },
  { id: "dracula", label: "Dracula" },
  { id: "github-dark", label: "GitHub Dark" },
  { id: "nord", label: "Nord" },
  { id: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { id: "one-dark-pro", label: "One Dark Pro" },
  { id: "tokyo-night", label: "Tokyo Night" },
];

// Shiki grammar id per app language ("filelisting" has no grammar -> plain text).
export const SHIKI_LANGS = ["typescript", "python", "bash"] as const;

export function shikiLang(language: Language): string {
  return language === "filelisting" ? "text" : language;
}

let highlighterPromise: Promise<Highlighter> | null = null;

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: THEME_OPTIONS.map((t) => t.id),
      langs: [...SHIKI_LANGS],
    });
  }
  return highlighterPromise;
}
