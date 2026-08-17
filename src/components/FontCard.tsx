import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAtom } from "jotai";
import {
  defaultFace,
  faceLabel,
  previewStyle,
  type FontFace,
  type FontFamily,
} from "../fonts";
import { compareAtom } from "../state/atoms";

interface Props {
  family: FontFamily;
  index: number;
  html: string;
  fontSize: number;
  ligatures: boolean;
}

export function FontCard({ family, index, html, fontSize, ligatures }: Props) {
  const [face, setFace] = useState<FontFace>(() => defaultFace(family.faces));
  const [compare, setCompare] = useAtom(compareAtom);
  const selected = compare.includes(family.family);

  const style = useMemo(
    () => previewStyle(family.family, face, fontSize, ligatures),
    [family.family, face, fontSize, ligatures],
  );

  function toggleCompare() {
    setCompare((prev) =>
      prev.includes(family.family)
        ? prev.filter((f) => f !== family.family)
        : [...prev, family.family],
    );
  }

  return (
    <article className="card">
      <div className="card__meta">
        <span className="card__index label">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Link
          href={`/font/${encodeURIComponent(family.family)}`}
          className="card__name"
          style={{ fontFamily: style.fontFamily }}
        >
          {family.family}
        </Link>
        <label className="check" title="Add to comparison">
          <input
            type="checkbox"
            checked={selected}
            onChange={toggleCompare}
          />
          <span className="check__box" aria-hidden="true" />
          <span className="check__label label">Compare</span>
        </label>
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
        style={style}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
