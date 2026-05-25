#!/bin/sh
set -e
cd "$(dirname "$0")/.."

HEADER_SRC="images/logo1.avif"
FAVICON_SRC="images/logo.avif"

if [ -f "$HEADER_SRC" ]; then
  cp -f "$HEADER_SRC" public/logo1.avif
  echo "Header → public/logo1.avif"
fi

if [ -f "$FAVICON_SRC" ]; then
  cp -f "$FAVICON_SRC" public/logo.avif
  echo "Favicon → public/logo.avif"
fi

echo "Fatto. Incrementa LOGO_VERSION in src/lib/constants.ts se il browser mostra ancora il vecchio file."
