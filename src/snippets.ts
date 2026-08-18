import type { Language } from "./state/atoms";

// Nerd Font glyphs live in the Private Use Area, so only patched (Nerd) fonts
// render them; other fonts show tofu boxes. Including these makes it obvious at
// a glance which installed fonts carry the icons. Defined via codepoint escapes
// so the source stays ASCII-safe.
const G = {
  branch: "\u{e0a0}",
  github: "\u{f09b}",
  git: "\u{f1d3}",
  python: "\u{e73c}",
  ts: "\u{e628}",
  js: "\u{e74e}",
  node: "\u{e718}",
  rust: "\u{e7a8}",
  folder: "\u{f07b}",
  folderOpen: "\u{f07c}",
  file: "\u{f15b}",
  terminal: "\u{f489}",
  lock: "\u{f023}",
  bolt: "\u{f0e7}",
  apple: "\u{f179}",
  html: "\u{f13b}",
  npm: "\u{e71e}",
};

const NERD_GLYPHS = [
  G.branch,
  G.github,
  G.git,
  G.python,
  G.ts,
  G.js,
  G.node,
  G.rust,
  G.folder,
  G.file,
  G.terminal,
  G.lock,
  G.bolt,
  G.apple,
].join(" ");

export const SNIPPETS: Record<Language, string> = {
  typescript: `interface Token<T = string> {
  value: T;
  span: [start: number, end: number];
}

const tokenize = (src: string): Token[] =>
  src.split(/\\s+/).filter(Boolean).map((value, i) => ({
    value,
    span: [i, i + value.length],
  }));

// => 0x1F <= widths, ligatures: != === => >= |> && ??
// nerd font: ${NERD_GLYPHS}
console.log(\`parsed \${tokenize("a b c").length} tokens\`);`,

  python: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    """Return the nth Fibonacci number."""
    return n if n < 2 else fib(n - 1) + fib(n - 2)

# nerd font: ${NERD_GLYPHS}
nums = [fib(i) for i in range(10) if i % 2 == 0]
print(f"evens -> {nums!r}  # {0xFF:08b}")`,

  bash: `#!/usr/bin/env bash
set -euo pipefail

# Sum file sizes, ignore hidden entries
# nerd font: ${NERD_GLYPHS}
total=0
for f in "$@"; do
  [[ -f "$f" ]] || continue
  size=$(stat -f%z "$f")
  total=$(( total + size ))
done

printf 'total: %d bytes\\n' "$total" >&2`,

  filelisting: `${G.folderOpen}  drwxr-xr-x   8 andrew  staff    256 Aug 17 10:13 .
${G.folder}  drwxr-xr-x  68 andrew  staff   2176 Aug 17 09:55 ..
${G.git}  -rw-r--r--   1 andrew  staff    253 Aug 17 10:13 .gitignore
${G.lock}  -rw-r--r--   1 andrew  staff  18432 Aug 17 10:13 bun.lockb
${G.html}  -rw-r--r--   1 andrew  staff    376 Aug 17 10:13 index.html
${G.node}  drwxr-xr-x   7 andrew  staff    224 Aug 17 10:13 node_modules
${G.npm}  -rw-r--r--   1 andrew  staff    573 Aug 17 10:13 package.json
${G.folder}  drwxr-xr-x   6 andrew  staff    192 Aug 17 10:13 src
${G.folder}  drwxr-xr-x   9 andrew  staff    288 Aug 17 10:13 src-tauri
${G.ts}  -rw-r--r--   1 andrew  staff    818 Aug 17 10:13 vite.config.ts`,
};
