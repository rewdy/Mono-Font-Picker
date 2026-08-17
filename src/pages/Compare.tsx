import { useMemo } from "react";
import { Link } from "wouter";
import { useAtom, useAtomValue } from "jotai";
import { Controls } from "../components/Controls";
import { useFonts, useHighlighter } from "../data";
import { renderCode } from "../shiki";
import {
  compareAtom,
  fontSizeAtom,
  languageAtom,
  ligaturesAtom,
  themeAtom,
} from "../state/atoms";
import { defaultFace, previewStyle } from "../fonts";

export function Compare() {
  const { fonts, error: fontsError } = useFonts();
  const { highlighter, error: hlError } = useHighlighter();
  const error = fontsError ?? hlError;

  const language = useAtomValue(languageAtom);
  const theme = useAtomValue(themeAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const ligatures = useAtomValue(ligaturesAtom);
  const [compare, setCompare] = useAtom(compareAtom);

  // Same snippet HTML reused by every column (only font styling differs).
  const html = useMemo(
    () => (highlighter ? renderCode(highlighter, language, theme) : ""),
    [highlighter, language, theme],
  );

  const columns = useMemo(() => {
    if (!fonts) return [];
    return compare
      .map((name) => fonts.find((f) => f.family === name))
      .filter((f): f is NonNullable<typeof f> => Boolean(f));
  }, [fonts, compare]);

  function remove(name: string) {
    setCompare((prev) => prev.filter((f) => f !== name));
  }

  const back = (
    <div className="toolbar__brand">
      <Link href="/" className="back">
        ← All fonts
      </Link>
    </div>
  );

  return (
    <div className="app">
      <header className="toolbar">
        {back}
        <Controls />
        <div className="toolbar__cell toolbar__cell--action">
          <span className="label">Comparing</span>
          <span className="toolbar__count">{columns.length} fonts</span>
        </div>
      </header>

      <main className="app__body app__body--flush">
        {error && <div className="notice notice--error">{error}</div>}

        {!error && (!fonts || !highlighter) && (
          <div className="notice">Loading…</div>
        )}

        {!error && fonts && highlighter && columns.length < 2 && (
          <div className="notice">
            Select at least two fonts to compare. <Link href="/">Back to all fonts</Link>
          </div>
        )}

        {!error && fonts && highlighter && columns.length >= 2 && (
          <div className="compare">
            {columns.map((family) => {
              const face = defaultFace(family.faces);
              const style = previewStyle(family.family, face, fontSize, ligatures);
              return (
                <section className="compare__col" key={family.family}>
                  <header className="compare__head">
                    <Link
                      href={`/font/${encodeURIComponent(family.family)}`}
                      className="compare__name"
                      style={{ fontFamily: style.fontFamily }}
                    >
                      {family.family}
                    </Link>
                    <button
                      type="button"
                      className="compare__remove"
                      title="Remove"
                      onClick={() => remove(family.family)}
                    >
                      ×
                    </button>
                  </header>
                  <div
                    className="card__preview"
                    style={style}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
