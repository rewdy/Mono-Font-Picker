import { useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useAtomValue } from "jotai";
import { Controls } from "../components/Controls";
import { useFonts, useHighlighter } from "../data";
import { renderCode } from "../shiki";
import { LANGUAGE_OPTIONS, fontSizeAtom, ligaturesAtom, themeAtom } from "../state/atoms";
import { defaultFace, faceLabel, previewStyle, type FontFace } from "../fonts";

export function FontView() {
  const params = useParams();
  const familyName = params.family ? decodeURIComponent(params.family) : "";

  const { fonts, error: fontsError } = useFonts();
  const { highlighter, error: hlError } = useHighlighter();
  const error = fontsError ?? hlError;

  const theme = useAtomValue(themeAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const ligatures = useAtomValue(ligaturesAtom);

  const family = fonts?.find((f) => f.family === familyName) ?? null;
  const [face, setFace] = useState<FontFace | null>(null);
  const activeFace = face ?? (family ? defaultFace(family.faces) : null);

  const style = useMemo(
    () =>
      family && activeFace
        ? previewStyle(family.family, activeFace, fontSize, ligatures)
        : undefined,
    [family, activeFace, fontSize, ligatures],
  );

  // All four snippets highlighted with the current theme (rendered once each).
  const samples = useMemo(() => {
    if (!highlighter) return [];
    return LANGUAGE_OPTIONS.map((o) => ({
      id: o.id,
      label: o.label,
      html: renderCode(highlighter, o.id, theme),
    }));
  }, [highlighter, theme]);

  const back = (
    <div className="toolbar__brand">
      <Link href="/" className="back">
        ← All fonts
      </Link>
    </div>
  );

  if (error) {
    return (
      <div className="app">
        <header className="toolbar">{back}</header>
        <main className="app__body">
          <div className="notice notice--error">{error}</div>
        </main>
      </div>
    );
  }

  if (fonts && !family) {
    return (
      <div className="app">
        <header className="toolbar">{back}</header>
        <main className="app__body">
          <div className="notice">
            Font “{familyName}” not found. <Link href="/">Back to all fonts</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!family || !activeFace || !highlighter) {
    return (
      <div className="app">
        <header className="toolbar">{back}</header>
        <main className="app__body">
          <div className="notice">Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="toolbar">
        {back}
        <Controls showLanguage={false} />
      </header>

      <main className="app__body">
        <div className="detail">
          <section className="detail__head">
            <span className="label">Font family</span>
            <h1 className="detail__name" style={{ fontFamily: style?.fontFamily }}>
              {family.family}
            </h1>

            <dl className="detail__stats">
              <div>
                <dt className="label">Faces</dt>
                <dd>{family.faces.length}</dd>
              </div>
              <div>
                <dt className="label">Weights</dt>
                <dd>{family.faces.map(faceLabel).join(", ")}</dd>
              </div>
            </dl>

            <div className="card__faces">
              {family.faces.map((f) => {
                const active =
                  f.weight === activeFace.weight && f.italic === activeFace.italic;
                return (
                  <button
                    key={f.postScriptName || `${f.weight}-${f.italic}`}
                    type="button"
                    className="badge"
                    data-active={active}
                    onClick={() => setFace(f)}
                  >
                    {faceLabel(f)}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="detail__samples">
            {samples.map((s) => (
              <div className="detail__sample" key={s.id}>
                <span className="label">{s.label}</span>
                <div
                  className="card__preview"
                  style={style}
                  dangerouslySetInnerHTML={{ __html: s.html }}
                />
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
