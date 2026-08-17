import { useMemo, useState } from "react";
import {
  defaultFace,
  faceLabel,
  type FontFace,
  type FontFamily,
} from "../fonts";

interface Props {
  family: FontFamily;
  index: number;
  html: string;
  fontSize: number;
  ligatures: boolean;
}

export function FontCard({ family, index, html, fontSize, ligatures }: Props) {
  const [face, setFace] = useState<FontFace>(() => defaultFace(family.faces));

  const previewStyle = useMemo(
    () => ({
      fontFamily: `"${family.family}", monospace`,
      fontSize: `${fontSize}px`,
      fontWeight: face.weight,
      fontStyle: face.italic ? "italic" : "normal",
      fontFeatureSettings: ligatures
        ? '"liga" 1, "calt" 1'
        : '"liga" 0, "calt" 0',
      fontVariantLigatures: ligatures
        ? ("contextual common-ligatures" as const)
        : ("none" as const),
    }),
    [family.family, fontSize, face, ligatures],
  );

  return (
    <article className="card">
      <div className="card__meta">
        <span className="card__index label">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="card__name" style={{ fontFamily: previewStyle.fontFamily }}>
          {family.family}
        </h2>
        <div className="card__faces">
          {family.faces.map((f) => {
            const active = f.weight === face.weight && f.italic === face.italic;
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
      </div>

      <div
        className="card__preview"
        style={previewStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
