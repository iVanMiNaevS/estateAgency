import { NextResponse } from "next/server";
import { searchSite } from "@/app/actions/public";

/**
 * BFF-эндпоинт поиска по сайту (ТЗ F-1.7).
 *
 * Клиент ходит сюда, а не в Strapi: адрес бэкенда не попадает в
 * бандл, поиск ограничен по длине запроса и числу результатов,
 * а ответ собирается на сервере.
 *
 * Реализация намеренно использует тот же серверный код, что и
 * server action: правила валидации не расходятся между путями.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const results = await searchSite(query);

  return NextResponse.json(
    { data: results, meta: { query: query.slice(0, 100), count: results.length } },
    {
      // Поиск персонализирован по сессии, поэтому без общего кеша.
      headers: { "Cache-Control": "no-store" },
    }
  );
}