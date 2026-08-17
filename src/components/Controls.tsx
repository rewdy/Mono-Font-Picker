import { useAtom } from "jotai";
import {
  LANGUAGE_OPTIONS,
  fontSizeAtom,
  languageAtom,
  ligaturesAtom,
  themeAtom,
  type Language,
} from "../state/atoms";
import { THEME_OPTIONS } from "../shiki";

interface Props {
  showLanguage?: boolean;
}

// The four persisted preview settings, shared across every page's header.
export function Controls({ showLanguage = true }: Props) {
  const [language, setLanguage] = useAtom(languageAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [fontSize, setFontSize] = useAtom(fontSizeAtom);
  const [ligatures, setLigatures] = useAtom(ligaturesAtom);

  return (
    <>
      {showLanguage && (
        <div className="toolbar__cell">
          <label className="label" htmlFor="tb-language">
            Language
          </label>
          <select
            id="tb-language"
            className="control"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="toolbar__cell">
        <label className="label" htmlFor="tb-theme">
          Theme
        </label>
        <select
          id="tb-theme"
          className="control"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          {THEME_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar__cell">
        <label className="label" htmlFor="tb-size">
          Size — {fontSize}px
        </label>
        <input
          id="tb-size"
          className="control control--range"
          type="range"
          min={10}
          max={28}
          step={1}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      <div className="toolbar__cell">
        <span className="label">Ligatures</span>
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked={ligatures}
          data-on={ligatures}
          onClick={() => setLigatures((v) => !v)}
        >
          <span className="toggle__track">
            <span className="toggle__thumb" />
          </span>
          <span className="toggle__state">{ligatures ? "On" : "Off"}</span>
        </button>
      </div>
    </>
  );
}
