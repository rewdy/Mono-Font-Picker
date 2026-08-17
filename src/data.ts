import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";
import { fetchMonospaceFonts, type FontFamily } from "./fonts";
import { getHighlighter } from "./shiki";

// Cache the fetch once at module scope so navigating between pages never refetches.
let fontsPromise: Promise<FontFamily[]> | null = null;
function loadFonts(): Promise<FontFamily[]> {
  if (!fontsPromise) fontsPromise = fetchMonospaceFonts();
  return fontsPromise;
}

export function useFonts(): { fonts: FontFamily[] | null; error: string | null } {
  const [fonts, setFonts] = useState<FontFamily[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadFonts()
      .then((f) => alive && setFonts(f))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  return { fonts, error };
}

export function useHighlighter(): {
  highlighter: Highlighter | null;
  error: string | null;
} {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getHighlighter()
      .then((h) => alive && setHighlighter(h))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  return { highlighter, error };
}

export function useFontByName(name: string | undefined): FontFamily | null {
  const { fonts } = useFonts();
  if (!fonts || !name) return null;
  return fonts.find((f) => f.family === name) ?? null;
}
