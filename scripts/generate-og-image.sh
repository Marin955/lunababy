#!/usr/bin/env bash
# Rebuilds public/og/default.jpg (1200x630 social share image) from the hero
# photo + logo. Needs ImageMagick (`magick`) and librsvg (`rsvg-convert`).
# The hero photo is 4:3, so it fills the left 840x630 uncropped; the logo panel takes the rest.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -sSfL -o "$tmp/Playfair.ttf" "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf"
curl -sSfL -o "$tmp/Quicksand.ttf" "https://github.com/google/fonts/raw/main/ofl/quicksand/Quicksand%5Bwght%5D.ttf"

rsvg-convert -w 200 -h 200 public/logo.svg -o "$tmp/logo.png"
magick public/images/hero.jpg -resize '840x630^' -gravity center -extent 840x630 "$tmp/photo.png"
magick -size 360x630 gradient:'#FEFDFB'-'#EDF6F8' \
  "$tmp/logo.png" -gravity north -geometry +0+120 -composite \
  -font "$tmp/Playfair.ttf" -fill '#3D3D4E' -pointsize 58 -annotate +0+340 'LunaBaby' \
  -font "$tmp/Quicksand.ttf" -fill '#356B75' -pointsize 26 -annotate +0+430 'www.lunababy.eu' \
  "$tmp/panel.png"
mkdir -p public/og
magick -size 1200x630 xc:'#FBF9F6' \
  "$tmp/photo.png" -geometry +0+0 -composite \
  "$tmp/panel.png" -geometry +840+0 -composite \
  -quality 86 -strip public/og/default.jpg
echo "wrote public/og/default.jpg"
