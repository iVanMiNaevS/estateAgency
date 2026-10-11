/**
 * Генерация изображений для парка.
 *
 * Рисует обложки аттракционов, новостей и галереи через sharp:
 * это не фотографии, а аккуратные градиентные карточки с подписью —
 * чтобы интерфейс выглядел законченно до загрузки реальных снимков.
 * Запуск: node scripts/generate-images.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const sharp = require("sharp");

const OUT_DIR = path.join(__dirname, "..", "public", "uploads");

/** Палитра в тон дизайна: тёмный фон и акцент парка. */
const PALETTES = {
  extreme: ["#2b1055", "#7597de", "#ff4d6d"],
  family: ["#0f2027", "#2c5364", "#f5b041"],
  child: ["#1a2a6c", "#b21f1f", "#f9d423"],
  news: ["#141414", "#3a3a3a", "#703bf7"],
  gallery: ["#232526", "#414345", "#946cf9"],
};

/**
 * SVG-подложка с градиентом и подписью.
 * Текст выводим в SVG, растр потом собирает sharp.
 */
const buildSvg = ({
  width,
  height,
  palette,
  title,
  subtitle,
  badge,
}) => {
  const [from, mid, to] = palette;

  // Разбиваем длинный заголовок на строки по словам.
  const words = title.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 22) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const fontSize = lines.length > 2 ? 42 : 52;
  const startY = height / 2 - ((lines.length - 1) * fontSize * 1.2) / 2;

  const text = lines
    .map(
      (textLine, index) =>
        `<text x="50%" y="${startY + index * fontSize * 1.2}" fill="#ffffff" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(textLine)}</text>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="55%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  ${badge ? `<rect x="40" y="40" width="${badge.length * 15 + 40}" height="44" rx="22" fill="#ffffff" fill-opacity="0.16"/><text x="${40 + (badge.length * 15 + 40) / 2}" y="62" fill="#ffffff" font-size="22" font-family="Arial, Helvetica, sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escapeXml(badge)}</text>` : ""}
  <text x="50%" y="${height - 56}" fill="#ffffff" fill-opacity="0.72" font-size="24" font-family="Arial, Helvetica, sans-serif" text-anchor="middle">${escapeXml(subtitle)}</text>
  ${text}
</svg>`;
};

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Собирает PNG из SVG-подложки. */
const render = async (name, options) => {
  const svg = buildSvg(options);
  const filename = `${name}_${crypto.randomBytes(6).toString("hex")}.jpg`;

  // JPEG, а не PNG: на градиентах он в разы легче при том же виде,
  // а требование ТЗ ограничивает вес картинки 200 КБ.
  await sharp(Buffer.from(svg))
    .flatten({ background: "#141414" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_DIR, filename));

  return filename;
};

/** Список изображений: аттракционы, новости, альбомы. */
const IMAGES = require("./image-manifest");

const main = async () => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const created = [];

  for (const item of IMAGES) {
    const filename = await render(item.name, {
      width: item.width ?? 1200,
      height: item.height ?? 800,
      palette: PALETTES[item.palette ?? "news"],
      title: item.title,
      subtitle: item.subtitle ?? "Парк Чудес",
      badge: item.badge,
    });

    created.push({ ...item, filename });
    console.log(`  ${filename}`);
  }

  fs.writeFileSync(
    path.join(__dirname, ".generated-images.json"),
    JSON.stringify(created, null, 2)
  );

  console.log(`\nГотово: ${created.length} изображений`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});