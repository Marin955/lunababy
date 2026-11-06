#!/usr/bin/env bash
# Rebuilds public/og/default.jpg (1200x630 social share image) from the hero
# photo + logo. Needs ImageMagick (`magick`) and librsvg (`rsvg-convert`).
# Re-run after replacing public/images/sleeping-box.jpg with a high-res original (O5).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -sSfL -o "$tmp/Playfair.ttf" "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf"
curl -sSfL -o "$tmp/Quicksand.ttf" "https://github.com/google/fonts/raw/main/ofl/quicksand/Quicksand%5Bwght%5D.ttf"

rsvg-convert -w 200 -h 200 public/logo.svg -o "$tmp/logo.png"
# Square centre crop of the box photo for the left half.
magick public/images/sleeping-box.jpg -gravity center \
  -crop "$(magick identify -format '%[fx:min(w,h)]x%[fx:min(w,h)]+0+0' public/images/sleeping-box.jpg)" +repage \
  -resize 630x630 "$tmp/photo.png"
magick -size 570x630 gradient:'#FEFDFB'-'#EDF6F8' \
  "$tmp/logo.png" -gravity north -geometry +0+110 -composite \
  -font "$tmp/Playfair.ttf" -fill '#3D3D4E' -pointsize 76 -annotate +0+330 'LunaBaby' \
  -font "$tmp/Quicksand.ttf" -fill '#356B75' -pointsize 30 -annotate +0+440 'www.lunababy.eu' \
  "$tmp/panel.png"
mkdir -p public/og
magick -size 1200x630 xc:'#FBF9F6' \
  "$tmp/photo.png" -geometry +0+0 -composite \
  "$tmp/panel.png" -geometry +630+0 -composite \
  -quality 86 -strip public/og/default.jpg
echo "wrote public/og/default.jpg"
