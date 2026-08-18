# Mono Font Picker

A macOS desktop app that lists every monospaced font installed on your system
and renders a syntax-highlighted code preview for each, so you can compare fonts
before setting them in your editor and terminal.

Built with Tauri v2 (Rust backend + system WebView) and React + TypeScript. Font
enumeration and monospace detection happen natively in Rust via `fontdb`, which
is the whole reason this is a desktop app and not a website.

## Features

- Lists all installed monospaced font families, sorted A→Z.
- Syntax-highlighted previews (Shiki) in TypeScript, Python, Bash, or a file
  listing, with a pickable theme.
- Adjustable preview font size and a ligatures on/off toggle.
- Per-family weight/style badges to preview each available face.
- **Search** with `Cmd/Ctrl-K` to jump to the filter box.
- **1 or 2 column** grid layout toggle.
- **Font view** (`/font/:family`) showing a single font across all four samples.
- **Compare mode**: check any number of fonts and view them side by side in a
  horizontally scrolling layout.
- Nerd Font glyphs embedded in the samples, so patched fonts are easy to spot.
- Dark-mode Swiss/International Typographic Style UI.

Your language, theme, font size, ligature, and column preferences persist across
launches (localStorage).

## Requirements

- macOS (verified target; other platforms are untested)
- [bun](https://bun.sh)
- Rust toolchain + Xcode command line tools

## Develop

```bash
bun install          # install JS deps
bun run tauri dev    # run the full desktop app (launches a window)
```

`bun run dev` runs the frontend alone in a browser, but Rust `invoke` calls
(the font list) will fail there; use `tauri dev` to see real fonts.

After changes: `bunx tsc --noEmit` for frontend edits, or `cargo build` in
`src-tauri/` for Rust edits. There is no test suite yet.

## Build & install

```bash
bun run tauri build
```

This produces:

- App bundle: `src-tauri/target/release/bundle/macos/Mono Font Picker.app`
- Installer: `src-tauri/target/release/bundle/dmg/Mono Font Picker_<version>_<arch>.dmg`

Drag `Mono Font Picker.app` into `/Applications`. The build is unsigned, so on
first launch right-click the app and choose **Open** to get past Gatekeeper;
after that it opens normally.

## Documentation

See [`AGENTS.md`](./AGENTS.md) for architecture, conventions, persistence keys,
and gotchas.
