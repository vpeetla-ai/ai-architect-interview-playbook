#!/usr/bin/env bash
# Verifies every internal (repo-relative) markdown link resolves to a real
# file. This repo is content-only, so this is the whole "test suite" —
# the actual verification that matters here is that a reader can click
# through, not that code compiles.
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

broken=0
while IFS= read -r -d '' file; do
  while IFS= read -r link; do
    [ -z "$link" ] && continue
    resolved="$(cd "$(dirname "$file")" && realpath -q "$link" 2>/dev/null || true)"
    if [ -z "$resolved" ] || [ ! -f "$resolved" ]; then
      echo "BROKEN LINK in $file: $link"
      broken=1
    fi
  done < <(grep -oE '\]\((\.\./[^)]+\.md|[a-zA-Z-]+/[^)]+\.md)\)' "$file" 2>/dev/null | sed 's/^](//;s/)$//')
done < <(find . -name "*.md" -not -path "./.git/*" -not -path "./.cursor/*" -not -path "./.github/*" -print0)

if [ "$broken" -eq 1 ]; then
  echo "FAIL: broken internal links found"
  exit 1
fi
echo "OK: all internal links resolve"
