#!/usr/bin/env bash
# Fetch STIBO STEP Scripting API Change Report using barebrowse
# Uses your existing Chrome Okta session — no re-login required.
#
# Usage:
#   ./tools/fetch-step-changelog.sh              # Full change report
#   ./tools/fetch-step-changelog.sh --since 2025 # Filter to 2025+ entries
#
# Output: .barebrowse/step-changelog-<timestamp>.yml (ARIA snapshot)
#         docs/step-changelog-latest.md            (saved summary)

set -e

CHANGE_REPORT_URL="https://stitchfix-preprod.mdm.stibosystems.com/sdk/doc/changereport/html/ChangeReport.html"
OUTPUT_DIR=".barebrowse"
MEMORY_DIR="$(dirname "$0")/../.claude/projects/-Users-sankartalam-Documents-GH-core-product-catalog/memory"

# Reuse saved state if available (avoids Okta login)
SAVED_STATE=$(ls -t .barebrowse/state-*.json 2>/dev/null | head -1)

if [ -n "$SAVED_STATE" ]; then
  echo "==> Reusing saved session state: $SAVED_STATE"
  npx barebrowse open "$CHANGE_REPORT_URL" --storage-state="$SAVED_STATE" --prune-mode=read
else
  echo "==> No saved state found. Opening headed browser for manual Okta login..."
  echo "    After login, state will be saved for future runs."
  npx barebrowse open "$CHANGE_REPORT_URL" --mode=headed --prune-mode=read --timeout=120000
fi

echo "==> Waiting for page to load..."
npx barebrowse wait-idle --timeout=15000 2>/dev/null || true

echo "==> Taking read-mode snapshot (content extraction)..."
npx barebrowse snapshot --mode=read

echo "==> Saving session state for reuse..."
npx barebrowse save-state

echo "==> Done. Snapshot saved to $OUTPUT_DIR/"
echo "    Open the latest .yml file to read the changelog."
echo ""
echo "    To save findings to memory:"
echo "    cp $OUTPUT_DIR/page-*.yml $MEMORY_DIR/step-changelog-latest.md"

npx barebrowse close
