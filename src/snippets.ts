import type { Language } from "./state/atoms";

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
console.log(\`parsed \${tokenize("a b c").length} tokens\`);`,

  python: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    """Return the nth Fibonacci number."""
    return n if n < 2 else fib(n - 1) + fib(n - 2)

nums = [fib(i) for i in range(10) if i % 2 == 0]
print(f"evens -> {nums!r}  # {0xFF:08b}")`,

  bash: `#!/usr/bin/env bash
set -euo pipefail

# Sum file sizes, ignore hidden entries
total=0
for f in "$@"; do
  [[ -f "$f" ]] || continue
  size=$(stat -f%z "$f")
  total=$(( total + size ))
done

printf 'total: %d bytes\\n' "$total" >&2`,

  filelisting: `drwxr-xr-x   8 andrew  staff    256 Aug 17 10:13 .
drwxr-xr-x  68 andrew  staff   2176 Aug 17 09:55 ..
-rw-r--r--   1 andrew  staff    253 Aug 17 10:13 .gitignore
-rw-r--r--   1 andrew  staff  18432 Aug 17 10:13 bun.lockb
-rw-r--r--   1 andrew  staff    376 Aug 17 10:13 index.html
drwxr-xr-x   7 andrew  staff    224 Aug 17 10:13 node_modules
-rw-r--r--   1 andrew  staff    573 Aug 17 10:13 package.json
drwxr-xr-x   6 andrew  staff    192 Aug 17 10:13 src
drwxr-xr-x   9 andrew  staff    288 Aug 17 10:13 src-tauri
-rw-r--r--   1 andrew  staff    818 Aug 17 10:13 vite.config.ts`,
};
