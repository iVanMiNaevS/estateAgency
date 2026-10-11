/**
 * Удаление временного API-токена, созданного скриптом
 * create-api-token.js.
 *
 * Запуск:  node scripts/delete-api-token.js
 *
 * Токен удобен для служебных загрузок, но хранить его в базе
 * после работы не нужно: доступ ко всему API он даёт полный.
 */

const fs = require("fs");
const path = require("path");

const Database = require("better-sqlite3");

const dbFile = path.join(__dirname, "..", ".tmp", "data.db");

if (!fs.existsSync(dbFile)) {
  console.error("База не найдена.");
  process.exit(1);
}

const db = new Database(dbFile);

const removed = db
  .prepare("delete from strapi_api_tokens where name = ?")
  .run("Временный токен для скриптов");

db.close();

console.log(`Удалено токенов: ${removed.changes}`);