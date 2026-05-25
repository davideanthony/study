#!/bin/sh
set -e
cd "$(dirname "$0")/.."

AVIF_SRC="images/logo1.avif"
PNG_SRC="images/logo1.png"

if [ -f "$AVIF_SRC" ]; then
  cp -f "$AVIF_SRC" public/logo1.avif
  echo "Logo AVIF → public/logo1.avif"
fi

if [ -f "$PNG_SRC" ]; then
  cp -f "$PNG_SRC" public/logo1.png
  python3 scripts/crop-logo.py 2>/dev/null || true
fi

echo "Fatto. Incrementa LOGO_VERSION in src/lib/constants.ts se il browser mostra ancora il vecchio file."
