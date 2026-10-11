/**
 * Загрузка фотографий с Wikimedia Commons в public/uploads.
 *
 * Берём свободно лицензированные снимки вместо рисованных обложек:
 * на готовом сайте аттракцион должен выглядеть как аттракцион.
 * Список файлов и условия использования — в image-sources.js,
 * автоматически собранная атрибуция попадает в IMAGE-CREDITS.md.
 *
 * Фотографии уменьшаются до размеров из ТЗ (200 КБ на файл),
 * поэтому большие оригиналы Commons не тащим в репозиторий.
 *
 * Запуск:
 *   node scripts/generate-images.js   # рисованные заглушки
 *   node scripts/download-sources.js  # фотографии вместо них
 *   STRAPI_API_TOKEN=<ключ> node scripts/upload-images.js
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const SOURCES = require("./image-sources");

const API = "https://commons.wikimedia.org/w/api.php";

// Wikimedia отклоняет запросы без описательного User-Agent
// и блокирует запросы без контактов, поэтому указываем и то и другое.
const UA =
  "park-site-dev/1.0 (https://github.com/student-project; student@example.org) node-fetch";

const OUT_DIR = path.join(__dirname, "..", "public", "uploads");

/** Спецификация ограничивает размер изображения 200 КБ. */
const MAX_BYTES = 200 * 1024;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Уточняет адрес файла на Wikimedia: в манифесте хранится
 * название, а скачивать нужно по прямой ссылке upload.wikimedia.org.
 */
const resolveUrl = async (title) => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: `File:${title}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
  });

  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  const text = await res.text();

  if (!text.startsWith("{")) {
    throw new Error(text.slice(0, 100));
  }

  const pages = Object.values(JSON.parse(text)?.query?.pages ?? {});
  const info = pages[0]?.imageinfo?.[0];

  if (!info) {
    throw new Error(`файл не найден: ${title}`);
  }

  return info.url;
};

/**
 * Уменьшает снимок и подбирает качество так, чтобы он влезал
 * в ограничение по размеру.
 *
 * Сначала пробуем JPEG с падающим качеством. Если даже минимальное
 * не помогает — сложный кадр в высоком разрешении — переходим на
 * WEBP: он при том же качестве весит заметно меньше. Формат
 * возвращается вместе с данными, иначе файл получит расширение .jpg
 * при содержимом другого формата.
 */
const fitToBudget = async (buffer, width, height) => {
  const resize = () =>
    sharp(buffer).rotate().resize(width, height, {
      fit: "cover",
      position: "attention",
    });

  for (const quality of [82, 76, 70, 64, 58, 50]) {
    const candidate = await resize()
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (candidate.length <= MAX_BYTES) {
      return { data: candidate, extension: "jpg" };
    }
  }

  for (const quality of [80, 70, 60]) {
    const candidate = await resize().webp({ quality }).toBuffer();

    if (candidate.length <= MAX_BYTES) {
      return { data: candidate, extension: "webp" };
    }
  }

  // Предел недостижим без заметной потери качества — оставляем
  // лучшее из найденного, но сообщаем, что файл крупнее нормы.
  const fallback = await resize().webp({ quality: 55 }).toBuffer();
  console.warn(
    `    не уложился в ${MAX_BYTES / 1024} КБ: ${(fallback.length / 1024).toFixed(0)} КБ`
  );
  return { data: fallback, extension: "webp" };
};

const main = async () => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const created = [];

  for (const source of SOURCES) {
    try {
      const url = await resolveUrl(source.title);
      const response = await fetch(url, { headers: { "User-Agent": UA } });

      if (!response.ok) {
        throw new Error(`загрузка вернула ${response.status}`);
      }

      const original = Buffer.from(await response.arrayBuffer());

      const { data, extension } = await fitToBudget(
        original,
        source.width,
        source.height
      );

      const filename = `${source.name}_${crypto.randomBytes(6).toString("hex")}.${extension}`;
      fs.writeFileSync(path.join(OUT_DIR, filename), data);

      created.push({ ...source, filename, url });
      console.log(
        `  ${source.name.padEnd(30)} ${(data.length / 1024).toFixed(0)} КБ  ${extension}`
      );
    } catch (error) {
      console.log(`  ${source.name}: не удалось — ${error.message}`);
    }

    await sleep(800);
  }

  fs.writeFileSync(
    path.join(__dirname, ".generated-images.json"),
    JSON.stringify(created, null, 2)
  );

  // Атрибуция обязательна для CC BY и CC BY-SA: без неё
  // использование фотографий нарушает условия лицензии.
  const credits = created.map((item) => ({
    title: item.title,
    author: item.author,
    license: item.license,
    url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.title)}`,
  }));

  const markdown = [
    "# Атрибуция изображений",
    "",
    "Фотографии взяты с Wikimedia Commons. Условия использования",
    "требуют указать автора и лицензию — этот список нужно сохранить",
    "при публикации проекта.",
    "",
    "| Файл | Автор | Лицензия |",
    "| --- | --- | --- |",
    ...credits.map(
      (item) => `| [${item.title}](${item.url}) | ${item.author} | ${item.license} |`
    ),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(__dirname, "IMAGE-CREDITS.md"), markdown);

  // Тот же список отдаём фронтенду: страница /credits обязана
  // показывать авторов, иначе условия лицензии не соблюдены.
  const frontendDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "src",
    "constants",
    "image-credits.json"
  );

  if (fs.existsSync(path.dirname(frontendDir))) {
    fs.writeFileSync(frontendDir, JSON.stringify(credits, null, 2) + "\n");
    console.log("Атрибуция на сайте: frontend/src/constants/image-credits.json");
  }

  console.log(`\nГотово: ${created.length} из ${SOURCES.length}`);
  console.log("Атрибуция: scripts/IMAGE-CREDITS.md");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});