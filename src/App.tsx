import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import type { Highlighter } from "shiki";
import { Toolbar } from "./components/Toolbar";
import { FontCard } from "./components/FontCard";
import { fetchMonospaceFonts, type FontFamily } from "./fonts";
import { getHighlighter, shikiLang, THEME_OPTIONS } from "./shiki";
import { SNIPPETS } from "./snippets";
import { fontSizeAtom, languageAtom, ligaturesAtom, themeAtom } from "./state/atoms";

function App() {
  const [fonts, setFonts] = useState<FontFamily[] | null>(null);
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const language = useAtomValue(languageAtom);
  const theme = useAtomValue(themeAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const ligatures = useAtomValue(ligaturesAtom);

  useEffect(() => {
    fetchMonospaceFonts()
      .then(setFonts)
      .catch((e) => setError(String(e)));
    getHighlighter()
      .then(setHighlighter)
      .catch((e) => setError(String(e)));
  }, []);

  // Highlight once per (language, theme); the same HTML is reused by every card.
  const html = useMemo(() => {
    if (!highlighter) return "";
    const safeTheme = THEME_OPTIONS.some((t) => t.id === theme)
      ? theme
      : THEME_OPTIONS[0].id;
    return highlighter.codeToHtml(SNIPPETS[language], {
      lang: shikiLang(language),
      theme: safeTheme,
    });
  }, [highlighter, language, theme]);

  return (
    <div className="app">
      <Toolbar fontCount={fonts?.length ?? 0} />

      <main className="app__body">
        {error && <div className="notice notice--error">{error}</div>}

        {!error && (!fonts || !highlighter) && (
          <div className="notice">Loading installed fonts…</div>
        )}

        {!error && fonts && fonts.length === 0 && (
          <div className="notice">No monospaced fonts found.</div>
        )}

        {!error && fonts && highlighter && (
          <div className="grid">
            {fonts.map((family, i) => (
              <FontCard
                key={family.family}
                family={family}
                index={i}
                html={html}
                fontSize={fontSize}
                ligatures={ligatures}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
