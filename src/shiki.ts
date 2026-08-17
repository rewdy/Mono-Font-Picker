import { createHighlighter, type Highlighter } from "shiki";
import type { Language } from "./state/atoms";
import { SNIPPETS } from "./snippets";

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

// Resolve a possibly-stale stored theme id to one this bundle actually has.
export function safeTheme(theme: string): string {
  return THEME_OPTIONS.some((t) => t.id === theme) ? theme : THEME_OPTIONS[0].id;
}

// Highlight a language's snippet. Shared by every page so highlighting logic
// (and the safe-theme fallback) lives in one place.
export function renderCode(
  highlighter: Highlighter,
  language: Language,
  theme: string,
): string {
  return highlighter.codeToHtml(SNIPPETS[language], {
    lang: shikiLang(language),
    theme: safeTheme(theme),
  });
}
