/**
 * Привязка уже загруженных изображений к записям Strapi.
 *
 * Отдельный шаг от upload-images.js: загрузка создаёт файлы,
 * а этот скрипт связывает их с аттракционами, новостями, альбомами
 * и первым экраном главной.
 *
 * Почему значения полей перечитываются перед PUT: у новостей и
 * альбомов включён draftAndPublish, а PUT в Strapi 5 заменяет
 * документ целиком — если отправить только media, обязательные
 * поля станут null и Strapi ответит 400.
 *
 * Запуск:
 *   node scripts/create-api-token.js
 *   STRAPI_API_TOKEN=<ключ> node scripts/attach-images.js
 */

const fs = require("fs");
const path = require("path");

const STRAPI = (process.env.STRAPI_URL ?? "http://localhost:1337/api").replace(/\/+$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN;

if (!TOKEN) {
  console.error(
    "Не задан STRAPI_API_TOKEN. Создайте токен: node scripts/create-api-token.js"
  );
  process.exit(1);
}

const api = async (endpoint, { method = "GET", body } = {}) => {
  const headers = { Authorization: `Bearer ${TOKEN}` };
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${STRAPI}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(
      `${method} ${endpoint} -> ${res.status}: ${JSON.stringify(data).slice(0, 400)}`
    );
  }

  return data;
};

/** Поля, которые нельзя терять при замене документа. */
const SCALAR_FIELDS = [
  "title",
  "slug",
  "shortFact",
  "description",
  "excerpt",
  "content",
  "subtitle",
  "eventDate",
  "type",
  "sortOrder",
  "isPinned",
  "isActive",
  "date",
  "startTime",
  "capacity",
  "price",
  "basePrice",
  "durationMinutes",
  "ageMin",
  "ageMax",
  "heightMinCm",
  "heightMaxCm",
];

const main = async () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, ".generated-images.json"), "utf8")
  );

  // Сопоставляем по полю name: Strapi переименовывает файл при загрузке,
  // поэтому имя в URL не совпадает с именем на диске, а name — совпадает.
  const files = await api("/upload/files");
  const byBaseName = new Map();

  for (const file of files) {
    // При нескольких дублях оставляем самый свежий.
    const current = byBaseName.get(file.name);
    if (!current || file.id > current.id) {
      byBaseName.set(file.name, file);
    }
  }

  const usedIds = new Set();

  const pick = (baseName) => {
    const item = manifest.find((candidate) => candidate.name === baseName);
    if (!item) {
      console.log(`  нет записи в манифесте: ${baseName}`);
      return null;
    }
    const file = byBaseName.get(baseName) ?? null;
    if (!file) {
      console.log(`  нет загруженного файла: ${baseName}`);
      return null;
    }
    usedIds.add(file.id);
    return file;
  };

  let attached = 0;

  /**
   * Привязывает файл к записи: читаем запись целиком, добавляем
   * медиа и отправляем обратно, чтобы не обнулить остальные поля.
   */
  const attach = async (endpoint, slug, mediaField, file) => {
    if (!file) return false;

    const found = await api(
      `${endpoint}?filters[slug][$eq]=${encodeURIComponent(slug)}`
    );
    const record = found?.data?.[0];
    if (!record) return false;

    const payload = {};
    for (const field of SCALAR_FIELDS) {
      if (record[field] !== undefined && record[field] !== null) {
        payload[field] = record[field];
      }
    }
    payload[mediaField] = file.id;

    await api(`${endpoint}/${record.documentId}`, {
      method: "PUT",
      body: { data: payload },
    });

    return true;
  };

  const ATTRACTIONS = [
    ["attrakcion-svobodnoe-padenie-60-m", "attraction-svobodnoe-padenie"],
    ["amerikanskie-gorki-ekstrim-pik", "attraction-ekstrim-pik"],
    ["koleso-obozreniya-vzglyad-na-ryazan", "attraction-koleso-obozreniya"],
    ["lodochnaya-dorozhka-reka", "attraction-lodochnaya-dorozhka"],
    ["detskaya-ploschadka-ostrov-sokrovisch", "attraction-ostrov-sokrovisch"],
    ["komnata-vyzhivaniya-zatochka", "attraction-komnata-vyzhivaniya"],
  ];

  const NEWS = [
    ["noch-ekstremala", "news-noch-ekstremala"],
    ["novyy-atrakcion-svobodnoe-padenie", "news-svobodnoe-padenie"],
    ["fotokonkurs-luchshiy-kadr", "news-fotokonkurs"],
    ["izmenilos-raspisanie", "news-raspisanie"],
  ];

  const ALBUMS = [
    ["ekstremalnaya-zona", "album-ekstremalnaya-zona"],
    ["semeynaya-zona", "album-semeynaya-zona"],
    ["detskiy-ostrov", "album-detskiy-ostrov"],
    ["territoriya-parka", "album-territoriya"],
  ];

  for (const [slug, image] of ATTRACTIONS) {
    if (await attach("/attractions", slug, "poster", pick(image))) {
      attached += 1;
      console.log(`  аттракцион: ${slug}`);
    }
  }

  for (const [slug, image] of NEWS) {
    if (await attach("/news-items", slug, "cover", pick(image))) {
      attached += 1;
      console.log(`  новость: ${slug}`);
    }
  }

  for (const [slug, image] of ALBUMS) {
    if (await attach("/albums", slug, "cover", pick(image))) {
      attached += 1;
      console.log(`  альбом: ${slug}`);
    }
  }

  // Первый экран главной: singleType с компонентом heroSection.
  const hero = pick("park-hero");
  if (hero) {
    // Компонент обязателен в запросе: без populate он не приходит,
    // и {...current.heroSection} подставит undefined, а PUT с
    // heroSection: { image } затрёт заголовок и описание блока.
    const mainScreen = await api(
      "/main-screen?populate[heroSection][populate]=image"
    );
    const current = mainScreen?.data;

    if (current?.heroSection) {
      const { image, ...heroFields } = current.heroSection;

      await api("/main-screen", {
        method: "PUT",
        body: {
          data: {
            heroSection: { ...heroFields, image: hero.id },
          },
        },
      });
      attached += 1;
      console.log("  первый экран главной");
    } else {
      console.log("  первый экран главной: блок heroSection не найден");
    }
  }

  // Неиспользуемые дубликаты удаляем, чтобы медиатека не засорялась.
  const generated = files.filter((file) =>
    /^(park-hero|attraction|news|album)-/.test(file.name ?? "")
  );
  const unused = generated.filter((file) => !usedIds.has(file.id));

  for (const file of unused) {
    try {
      await api(`/upload/files/${file.id}`, { method: "DELETE" });
    } catch (error) {
      console.log(`  не удалось удалить дубль ${file.id}: ${error.message}`);
    }
  }
  if (unused.length) {
    console.log(`  удалено дублей: ${unused.length}`);
  }

  console.log(`\nПривязано: ${attached}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});