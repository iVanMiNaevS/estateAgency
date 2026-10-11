/**
 * Поиск свободно лицензированных фотографий на Wikimedia Commons.
 *
 * Печатает кандидатов с лицензией и автором, чтобы выбрать файлы
 * вручную. Скачивание делает download-sources.js.
 *
 * Запуск: node scripts/find-sources.js "drop tower"
 *
 * Между запросами ставится пауза: Wikimedia отвечает ошибкой
 * «You are making too many requests» на частые обращения.
 */

const API = "https://commons.wikimedia.org/w/api.php";
// Wikimedia отклоняет запросы с generic User-Agent и блокирует
// запросы без контактов, поэтому указываем ссылку и почту.
const UA =
  "park-site-dev/1.0 (https://github.com/student-project; student@example.org) node-fetch";

/**
 * Бесплатные лицензии: общественное достояние, CC0, CC BY и CC BY-SA.
 * Для каждой найденной фотографии автор и лицензия попадают в файл
 * атрибуции, поэтому CC BY и CC BY-SA допустимы — их нужно указать.
 */
const ALLOWED = /^(public domain|cc0|cc by)/i;

const TERMS = process.argv.slice(2);

const search = async (term, limit = 10) => {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${term}`,
    gsrnamespace: "6",
    gsrlimit: String(limit),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|mime",
  });

  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
  const text = await res.text();

  if (!text.startsWith("{")) {
    throw new Error(text.slice(0, 80));
  }

  const pages = JSON.parse(text)?.query?.pages ?? {};
  const strip = (html) =>
    typeof html === "string" ? html.replace(/<[^>]+>/g, "").trim() : "";

  return Object.values(pages)
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};

      return {
        title: page.title.replace("File:", ""),
        width: info.width,
        height: info.height,
        mime: info.mime,
        url: info.url,
        license: strip(meta.LicenseShortName?.value),
        author: strip(meta.Artist?.value).slice(0, 50),
      };
    })
    .filter(Boolean)
    .filter((item) => ALLOWED.test(item.license))
    .filter((item) => item.mime === "image/jpeg" || item.mime === "image/png")
    .filter((item) => (item.width ?? 0) >= 1400);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const queries = TERMS.length
    ? TERMS
    : [
        "ferris wheel amusement park",
        "roller coaster amusement park",
        "drop tower ride",
        "swing carousel ride fairground",
        "carousel merry go round",
        "water slide amusement park",
        "amusement park evening lights",
        "toddler kiddie ride playground",
        "escape room puzzle",
        "boat ride lake park",
      ];

  for (const query of queries) {
    console.log(`\n=== ${query}`);
    try {
      const items = await search(query);
      if (!items.length) {
        console.log("  подходящих нет");
      }
      for (const item of items.slice(0, 5)) {
        console.log(`  ${item.title}`);
        console.log(`     ${item.width}x${item.height} | ${item.license} | ${item.author}`);
      }
    } catch (error) {
      console.log(`  ошибка: ${error.message}`);
    }
    await sleep(2000);
  }
};

main();