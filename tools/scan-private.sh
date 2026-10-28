#!/usr/bin/env bash
# Fails if any private term appears in public-facing files. Used by CI and locally.
set -euo pipefail
cd "$(dirname "$0")/.."
status=0
while IFS= read -r term; do
  [[ -z "$term" || "$term" == \#* ]] && continue
  if hits=$(grep -rniI --include='*.html' --include='*.js' --include='*.css' --include='*.md' --include='*.json' --include='*.txt' --include='*.xml' \
      --exclude-dir=node_modules --exclude-dir=.git --exclude='private-terms.txt' --exclude='scan-private.sh' -w -- "$term" public apps-script docs README.md 2>/dev/null); then
    echo "::error::private term \"$term\" found:"; echo "$hits" | head -20; status=1
  fi
done < tools/private-terms.txt
[[ $status -eq 0 ]] && echo "✓ No private terms found"
exit $status
