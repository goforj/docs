#!/bin/sh
# Regenerate small chart derivatives without modifying the original README artwork.
set -eu
cd "$(dirname "$0")/.."
for source in docs/assets/performance/*-logo.png; do
  cwebp -quiet -q 90 -resize 192 0 "$source" -o "${source%.png}.webp"
done
