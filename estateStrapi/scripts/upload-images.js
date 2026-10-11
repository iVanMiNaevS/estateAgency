/**
 * Загрузка сгенерированных изображений в Strapi и привязка их
 * к аттракционам, новостям, альбомам галереи и первому экрану.
 *
 * Запуск:
 *   node scripts/generate-images.js
 *   node scripts/upload-images.js
 *
 * Скрипт работает через REST API с временным токеном полного доступа
 * (см. scripts/create-api-token.js), поэтому Strapi сам создаёт записи
 * в files и нужные таблицы связей.
 */

const fs = require("fs");
const path = require("path");

const STRAPI = (process.env.STRAPI_URL ?? "http://localhost:1337/api").replace(/\/+$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN;
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

if (!TOKEN) {
  console.error(
    "Не задан STRAPI_API_TOKEN. Создайте временный токен:\n" +
      "  node scripts/create-api-token.js\n" +
      "Затем: STRAPI_API_TOKEN=<ключ> node scripts/upload-images.js"
  );
  process.exit(1);
}

/**
 * Запрос к Strapi с повторами.
 *
 * При загрузке файлов dev-сервер Strapi может перезапускаться,
 * поэтому «fetch failed» — это временная недоступность, а не отказ.
 * Повторяем запрос несколько раз с паузой.
 */
const api = async (endpoint, { method = "GET", body, form } = {}, attempt = 1) => {
  const headers = { Authorization: `Bearer ${TOKEN}` };
  if (body) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(`${STRAPI}${endpoint}`, {
      method,
      headers,
      body: form ?? (body ? JSON.stringify(body) : undefined),
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
        `${method} ${endpoint} -> ${res.status}: ${JSON.stringify(data).slice(0, 300)}`
      );
    }

    return data;
  } catch (error) {
    const retriable = error instanceof TypeError || /fetch failed/i.test(error.message);
    if (retriable && attempt < 6) {
      const wait = 1500 * attempt;
      console.log(`  повтор ${attempt}/5 через ${wait} мс (${error.message})`);
      await new Promise((resolve) => setTimeout(resolve, wait));
      return api(endpoint, { method, body, form }, attempt + 1);
    }
    throw error;
  }
};

/**
 * Ищет уже загруженный файл, чтобы повторный запуск скрипта
 * не плодил дубликаты в медиатеке.
 */
const findUploaded = async (filename) => {
  try {
    const data = await api(`/upload/files?filters[name][$eq]=${encodeURIComponent(filename)}`);
    return data?.[0] ?? null;
  } catch {
    return null;
  }
};

const uploadFile = async (filename) => {
  const existing = await findUploaded(filename);
  if (existing) {
    console.log(`  уже загружен ${filename} (${existing.id})`);
    return existing;
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  const buffer = fs.readFileSync(filePath);

  const form = new FormData();
  form.append(
    "files",
    new Blob([buffer], { type: "image/jpeg" }),
    filename
  );
  form.append("fileInfo", JSON.stringify({ name: filename.split("_")[0] }));

  const result = await api("/upload", { method: "POST", form });
  return result[0];
};

/** Находит запись по полю и сопоставляет ей изображение по имени файла. */
const findBy = async (endpoint, field, value, fields = ["id", "documentId"]) => {
  const data = await api(
    `${endpoint}?filters[${field}][$eq]=${encodeURIComponent(value)}&fields[0]=${fields[0]}&fields[1]=${fields[1]}`
  );
  return data.data?.[0];
};

const main = async () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, ".generated-images.json"), "utf8")
  );

  const byBaseName = new Map();
  for (const item of manifest) {
    byBaseName.set(item.name, item.filename);
  }

  console.log("Загружаю файлы в Strapi…");

  /** @type {Map<string, object>} */
  const uploaded = new Map();

  for (const item of manifest) {
    try {
      const file = await uploadFile(item.filename);
      uploaded.set(item.name, file);
      console.log(`  загружен ${item.name} (${file.id})`);
    } catch (error) {
      console.error(`  ОШИБКА ${item.name}: ${error.message}`);
    }
  }

  console.log("\nПривязываю к записям…");

  const ATTRACTION_SLUGS = [
    "attrakcion-svobodnoe-padenie-60-m",
    "amerikanskie-gorki-ekstrim-pik",
    "koleso-obozreniya-vzglyad-na-ryazan",
    "lodochnaya-dorozhka-reka",
    "detskaya-ploschadka-ostrov-sokrovisch",
    "komnata-vyzhivaniya-zatochka",
  ];

  const NEWS_SLUGS = [
    "noch-ekstremala",
    "novyy-atrakcion-svobodnoe-padenie",
    "fotokonkurs-luchshiy-kadr",
    "izmenilos-raspisanie",
  ];

  const ALBUM_SLUGS = [
    "ekstremalnaya-zona",
    "semeynaya-zona",
    "detskiy-ostrov",
    "territoriya-parka",
  ];

  /** Навешивает медиа на запись через PUT документа. */
  const attachWithField = async (endpoint, slug, field, file) => {
    const record = await findBy(endpoint, "slug", slug);
    if (!record || !file) return false;

    // В теле PUT documentId не допускается: адрес уже содержит его.
    await api(`${endpoint}/${record.documentId}`, {
      method: "PUT",
      body: { data: { [field]: file.id } },
    });

    return true;
  };

  let done = 0;

  // Аттракционы: по порядку слагов из seed-данных.
  const attractionFiles = [
    "attraction-svobodnoe-padenie",
    "attraction-ekstrim-pik",
    "attraction-koleso-obozreniya",
    "attraction-lodochnaya-dorozhka",
    "attraction-ostrov-sokrovisch",
    "attraction-komnata-vyzhivaniya",
  ];

  for (let i = 0; i < ATTRACTION_SLUGS.length; i += 1) {
    const ok = await attachWithField(
      "/attractions",
      ATTRACTION_SLUGS[i],
      "poster",
      uploaded.get(attractionFiles[i])
    );
    if (ok) {
      done += 1;
      console.log(`  аттракцион ${ATTRACTION_SLUGS[i]}`);
    }
  }

  const newsFiles = [
    "news-noch-ekstremala",
    "news-svobodnoe-padenie",
    "news-fotokonkurs",
    "news-raspisanie",
  ];

  for (let i = 0; i < NEWS_SLUGS.length; i += 1) {
    const ok = await attachWithField(
      "/news-items",
      NEWS_SLUGS[i],
      "cover",
      uploaded.get(newsFiles[i])
    );
    if (ok) {
      done += 1;
      console.log(`  новость ${NEWS_SLUGS[i]}`);
    }
  }

  const albumFiles = [
    "album-ekstremalnaya-zona",
    "album-semeynaya-zona",
    "album-detskiy-ostrov",
    "album-territoriya",
  ];

  for (let i = 0; i < ALBUM_SLUGS.length; i += 1) {
    const ok = await attachWithField(
      "/albums",
      ALBUM_SLUGS[i],
      "cover",
      uploaded.get(albumFiles[i])
    );
    if (ok) {
      done += 1;
      console.log(`  альбом ${ALBUM_SLUGS[i]}`);
    }
  }

  // Первый экран главной — singleType main-screen.
  const hero = uploaded.get("park-hero");
  if (hero) {
    try {
      const mainScreen = await api("/main-screen");
      const docId = mainScreen?.data?.documentId;
      if (docId) {
        await api("/main-screen", {
          method: "PUT",
          body: { data: { heroSection: { image: hero.id } } },
        });
        done += 1;
        console.log("  первый экран главной");
      }
    } catch (error) {
      console.error(`  ОШИБКА первого экрана: ${error.message}`);
    }
  }

  console.log(`\nПривязано записей: ${done}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});