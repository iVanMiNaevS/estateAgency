#!/usr/bin/env bash
# Скриншоты страниц сайта в headless Chrome.
#
# Нужен, чтобы оценивать вёрстку глазами, а не по разметке:
# в HTML ошибка отображения часто не видна.
#
# Запуск:
#   node scripts/dev-server &        # сначала поднять сервер
#   ./scripts/shots.sh [ширина]
#
# Скриншоты складыются в /tmp/opencode/shots/.

set -u

BASE="${BASE:-http://localhost:3000}"
WIDTH="${1:-1440}"
HEIGHT="${2:-1000}"
OUT="${OUT:-/tmp/opencode/shots}"

CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
if [ -z "$CHROME" ]; then
  echo "Chrome не найден в системе" >&2
  exit 1
fi

rm -rf "$OUT" && mkdir -p "$OUT"

PAGES="home:/ attractions:/attractions attractions-item:/attractions/attrakcion-svobodnoe-padenie-60-m
schedule:/schedule prices:/prices gallery:/gallery news:/news contact:/contact credits:/credits login:/login"

for entry in $PAGES; do
  name="${entry%%:*}"
  path="${entry#*:}"

  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --virtual-time-budget=6000 --window-size="$WIDTH,$HEIGHT" \
    --screenshot="$OUT/$name.png" "$BASE$path" >/dev/null 2>&1

  if [ -f "$OUT/$name.png" ]; then
    echo "  $name — ok"
  else
    echo "  $name — не получилось"
  fi
done

echo "Готово: $OUT (ширина ${WIDTH}px)"