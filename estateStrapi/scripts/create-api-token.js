/**
 * Выпуск временного API-токена Strapi для служебных скриптов.
 *
 * Нужен, чтобы загружать изображения через REST API: публичная роль
 * не может писать в медиатеку, а заводить токен вручную в админке
 * ради одной операции неудобно.
 *
 * Запуск:  node scripts/create-api-token.js
 * Ключ печатается в консоль — его и передаём дальше:
 *   STRAPI_API_TOKEN=<ключ> node scripts/attach-images.js
 *
 * Скрипт рассчитан на локальную разработку и требует доступа к
 * файлу .tmp/data.db, поэтому в продакшене так делать не нужно.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const Database = require("better-sqlite3");

const root = path.join(__dirname, "..");
const envFile = path.join(root, ".env");
const dbFile = path.join(root, ".tmp", "data.db");

if (!fs.existsSync(dbFile)) {
  console.error("База не найдена. Сначала запустите Strapi хотя бы один раз.");
  process.exit(1);
}

const saltLine = fs
  .readFileSync(envFile, "utf8")
  .split("\n")
  .find((line) => line.startsWith("API_TOKEN_SALT="));

if (!saltLine) {
  console.error("В .env нет API_TOKEN_SALT — токен выпустить нельзя.");
  process.exit(1);
}

const salt = saltLine.slice("API_TOKEN_SALT=".length).trim();

const db = new Database(dbFile);

/** Strapi хеширует ключ ток��на через HMAC-SHA512 с солью из .env. */
const hash = (accessKey) =>
  crypto.createHmac("sha512", salt).update(accessKey).digest("hex");

const accessKey = crypto.randomBytes(32).toString("hex");
const now = Date.now();

db.prepare(
  `insert into strapi_api_tokens
     (document_id, name, description, type, access_key, last_used_at,
      expires_at, lifespan, created_at, updated_at, published_at)
   values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
).run(
  crypto.randomUUID(),
  "Временный токен для скриптов",
  "Создан скриптом create-api-token.js. Удалите после использования.",
  "full-access",
  hash(accessKey),
  now,
  null,
  null,
  now,
  now,
  now
);

db.close();

console.log("Токен создан. Выполните следующую команду:\n");
console.log(`  STRAPI_API_TOKEN=${accessKey} node scripts/attach-images.js\n`);
console.log("Удалить токен после работы:");
console.log("  node scripts/delete-api-token.js");