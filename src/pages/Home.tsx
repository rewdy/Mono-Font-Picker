import { useEffect, useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useLocation } from "wouter";
import { Controls } from "../components/Controls";
import { FontCard } from "../components/FontCard";
import { useFonts, useHighlighter } from "../data";
import { renderCode } from "../shiki";
import {
  compareAtom,
  fontSizeAtom,
  languageAtom,
  ligaturesAtom,
  searchAtom,
  themeAtom,
} from "../state/atoms";

export function Home() {
  const { fonts, error: fontsError } = useFonts();
  const { highlighter, error: hlError } = useHighlighter();
  const error = fontsError ?? hlError;

  const language = useAtomValue(languageAtom);
  const theme = useAtomValue(themeAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const ligatures = useAtomValue(ligaturesAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const compare = useAtomValue(compareAtom);
  const [, navigate] = useLocation();

  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl-K focuses the search field from anywhere on this page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const html = useMemo(
    () => (highlighter ? renderCode(highlighter, language, theme) : ""),
    [highlighter, language, theme],
  );

  const filtered = useMemo(() => {
    if (!fonts) return [];
    const q = search.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((f) => f.family.toLowerCase().includes(q));
  }, [fonts, search]);

  const canCompare = compare.length >= 2;

  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar__brand">
          <span className="toolbar__title">Mono</span>
          <span className="toolbar__count">
            {filtered.length} {filtered.length === 1 ? "family" : "families"}
          </span>
        </div>

        <div className="toolbar__cell toolbar__cell--grow">
          <label className="label" htmlFor="tb-search">
            Search
          </label>
          <div className="search">
            <input
              id="tb-search"
              ref={searchRef}
              className="control search__input"
              type="text"
              value={search}
              placeholder="Filter fonts…"
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd className="search__kbd">⌘K</kbd>
          </div>
        </div>

        <Controls />

        <div className="toolbar__cell toolbar__cell--action">
          <span className="label">Compare</span>
          <button
            type="button"
            className="button"
            disabled={!canCompare}
            onClick={() => navigate("/compare")}
          >
            Compare ({compare.length})
          </button>
        </div>
      </header>

      <main className="app__body">
        {error && <div className="notice notice--error">{error}</div>}

        {!error && (!fonts || !highlighter) && (
          <div className="notice">Loading installed fonts…</div>
        )}

        {!error && fonts && highlighter && filtered.length === 0 && (
          <div className="notice">No fonts match “{search}”.</div>
        )}

        {!error && fonts && highlighter && filtered.length > 0 && (
          <div className="grid">
            {filtered.map((family, i) => (
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
