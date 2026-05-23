#!/bin/sh
set -e
cd "$(dirname "$0")/.."

SRC="images/logo1.png"
if [ ! -f "$SRC" ]; then
  echo "Manca $SRC"
  exit 1
fi

cp -f "$SRC" public/logo1.png
python3 scripts/crop-logo.py

echo "Logo aggiornato. Incrementa LOGO_VERSION se il browser mostra ancora il vecchio file."
