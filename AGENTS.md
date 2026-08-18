# AGENTS.md

Guidance for AI agents working in this repo. Keep this file current as the project evolves.

## What this is

**mono-font-picker** — a Tauri v2 desktop app (macOS-first) that lists every
monospaced font installed on the system and renders a syntax-highlighted code
preview for each, so you can compare fonts before setting them in editors and
terminals.

The core value is accurate font enumeration + monospace detection, which is why
this is a native app (via Rust) rather than a pure web app.

## Tech stack

- **Shell:** Tauri v2 (Rust backend + system WebView)
- **Frontend:** React 19 + TypeScript + Vite
- **State:** jotai with `atomWithStorage` (localStorage persistence)
- **Routing:** wouter with **hash-based** location (`useHashLocation`)
- **Syntax highlighting:** Shiki (full bundle, lazy-loaded grammars/themes)
- **Font enumeration:** Rust `fontdb` crate
- **Package manager:** bun

## Commands

Run from the repo root.

- `bun install` — install JS deps
- `bun run tauri dev` — run the full desktop app (Vite + Rust, launches a window)
- `bun run dev` — frontend only in a browser (Rust `invoke` calls will fail; use for pure UI work)
- `bun run build` — typecheck (`tsc`) + production frontend build
- `bunx tsc --noEmit` — typecheck only (fast; run after every TS change)
- `bun run tauri build` — produce a distributable app bundle
- `cargo build` (in `src-tauri/`) — compile the Rust crate alone

**After any change:** run `bunx tsc --noEmit` for frontend edits, `cargo build`
in `src-tauri/` for Rust edits. There is no test suite yet.

## Architecture

### Backend — `src-tauri/src/lib.rs`
- Single command `list_monospace_fonts` returns `Vec<FontFamily>`.
- Uses `fontdb::Database::load_system_fonts()`. A face counts as monospaced if
  `fontdb`'s `monospaced` flag (OpenType `post.isFixedPitch`) is set **or** a
  glyph-advance probe says so: `is_monospace_by_metrics()` parses the face with
  `ttf-parser` and treats it as fixed-pitch when a spread of sample glyphs
  (`i l M W m 0 x space @`) all share one non-zero advance width. The flag alone
  under-reports (many Nerd Font/patched fonts omit it), so the metric probe is
  the fallback.
- Skips hidden `.`-prefixed system fonts, groups by family, dedupes faces by
  (weight, italic), sorts families A→Z.
- Enumeration + probing runs once per process and is cached in a `OnceLock`
  (`CACHE`); the installed font set doesn't change while the app runs.
- Serde renames fields to snake_case over the wire; the frontend remaps them.

### Frontend — `src/`
- `App.tsx` — router shell. wouter `<Router hook={useHashLocation}>` + `<Switch>`
  over `/` (Home), `/font/:family` (FontView), `/compare` (Compare).
- `data.ts` — shared hooks so pages never refetch: `useFonts()` (module-cached
  promise), `useHighlighter()` (wraps the singleton), `useFontByName()`.
- `fonts.ts` — `invoke` wrapper, TS types, snake→camel remap, weight-name
  helpers, `defaultFace` picker, and `previewStyle()` (the shared font-styling
  CSS used by every preview surface).
- `shiki.ts` — highlighter singleton, `THEME_OPTIONS`, `SHIKI_LANGS`,
  `shikiLang()` (maps `filelisting` → plain `text`), `safeTheme()` (stale-id
  fallback), and `renderCode()` (the one place that calls `codeToHtml`).
- `snippets.ts` — the four code samples (typescript, python, bash, filelisting).
  Each embeds a row of Nerd Font (Private Use Area) glyphs so patched fonts are
  spotted at a glance; glyphs are built from `\u{...}` escapes, not literals
  (see Gotchas).
- `state/atoms.ts` — persisted + ephemeral jotai atoms (see storage keys below).
- `components/Controls.tsx` — the four preview settings (language optional via
  `showLanguage`), reused in every page header.
- `components/FontCard.tsx` — one family on the grid: name links to
  `/font/:family`, a compare checkbox, weight badges, and the reused Shiki HTML.
- `pages/Home.tsx` — header (brand + count + search + `Controls` + a 1/2
  columns toggle + compare button) and the results grid. Owns the Cmd/Ctrl-K
  search-focus listener.
- `pages/FontView.tsx` — single column; family details + all four snippets
  stacked. Language picker hidden (shows every language at once).
- `pages/Compare.tsx` — horizontal side-by-side scroll, one fixed-width column
  per selected font, all reusing the current-language HTML. Unlimited columns.

### Styling — `src/styles/`
- `tokens.css` — **the single source of truth** for all design values (color,
  type scale, spacing, grid, motion) as CSS custom properties.
- `base.css` — reset + Helvetica Neue baseline + shared utilities.
- `app.css` — layout/components, reading only from tokens.
- Aesthetic: Swiss / International Typographic Style, **dark-mode only**,
  hairline grid rules, square corners (`--radius: 0`), one accent color
  (`--c-accent`, currently purple; changed freely via that single token).

## Conventions (important)

- **Design changes go through `tokens.css`.** Do not hard-code colors, sizes, or
  spacing in component CSS — add/adjust a token and reference it.
- **Dark mode only.** Do not add light-mode styles.
- Chrome uses Helvetica Neue (`--font-ui`); the code previews are owned by the
  selected Shiki theme + the previewed font. Keep the Swiss frame neutral so it
  never competes with the font samples.
- Highlight once and reuse the HTML across cards/columns; never highlight
  per-card. Always go through `renderCode()` in `shiki.ts`.
- Preview font styling comes from `previewStyle()` in `fonts.ts` — reuse it,
  don't recompute the font/ligature CSS inline.
- Routing is hash-based (wouter `useHashLocation`); links use `#/...`. Encode
  family names with `encodeURIComponent` in URLs and decode on read.
- No comments in code unless explicitly requested.
- No em dashes in source.

## Persistence

jotai atoms in `state/atoms.ts`.

Persisted (`atomWithStorage`, localStorage):
- `mfp.language` → `typescript | python | bash | filelisting` (default `typescript`)
- `mfp.theme` → Shiki theme id (default `monokai`)
- `mfp.fontSize` → number px (default `14`)
- `mfp.ligatures` → boolean (default `true`)
- `mfp.columns` → `1 | 2` Home grid column count (default `2`)

Ephemeral (plain `atom`, in-memory, reset on reload):
- `searchAtom` → current search query (Home filter)
- `compareAtom` → array of selected family names (drives `/compare`)

`safeTheme()` validates the stored theme against `THEME_OPTIONS` and falls back
to the first theme if the id is unknown (guards against stale/removed themes).

## Gotchas

- **Shiki theme ids are version-specific.** Only use ids present in
  `node_modules/@shikijs/themes/dist/`. `shades-of-purple` is NOT in the current
  bundle (replaced with `laserwave`). An invalid id thrown into
  `codeToHtml`/`createHighlighter` throws `ShikiError` and blanks the UI.
- Installed system fonts are usable directly via CSS `font-family` in the
  WebView — no font-file loading needed. Rust only supplies the list + metadata.
- `bun run dev` alone cannot call Rust; use `bun run tauri dev` to see real fonts.
- Shiki's full bundle triggers a Vite ">500kB chunk" warning; it is lazy-loaded,
  so this is expected. To slim it, switch to `createHighlighterCore` with only
  the langs/themes in use.
- **Nerd Font / PUA glyphs must be written as `\u{...}` escapes**, not pasted as
  literal characters. Literal Private Use Area codepoints get stripped to spaces
  when written to source files here; `snippets.ts` builds them from escapes so
  the runtime string carries the real glyphs while the source stays ASCII-safe.
- The macOS app bundle/display name is **Mono Font Picker** (`productName` in
  `tauri.conf.json`); the crate/package name stays `mono-font-picker`.

## Current scope / not yet done

- No automated tests.
- macOS-verified only (Tauri/fontdb are cross-platform; other OSes untested).
- `compareAtom`/`searchAtom` are in-memory: reloading `/compare` with no live
  selection shows an empty-state notice (by design).
