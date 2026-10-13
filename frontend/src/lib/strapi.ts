import { cookies } from "next/headers";

/**
 * BFF-слой: единственное место в проекте, где frontend общается со Strapi.
 *
 * Обращается только серверный код (server actions и server-компоненты),
 * поэтому адрес бэкенда не попадает в бандл браузера и не может быть
 * изменён клиентом. Здесь же проверяются роли и входные данные.
 *
 * Раньше те же запросы уходили из клиентских компонентов напрямую
 * через NEXT_PUBLIC_API_URL, из-за чего адрес Strapi был виден любому
 * посетителю, а проверки прав на стороне сервера не происходили.
 */

/** Кука с JWT, см. src/lib/auth.ts. */
export const AUTH_COOKIE = "park_jwt";

/**
 * Время жизни кеша публичных GET-ответов Strapi (ISR), секунды.
 *
 * Страницы пререндериваются на билде вместе с данными и обновляются
 * раз в этот интервал без пересборки. Только для публичного контента:
 * авторизованные запросы и мутации кешировать нельзя.
 */
const REVALIDATE_SECONDS = 60;

/**
 * Корень REST API Strapi, без завершающего слэша.
 *
 * В .env адрес задан как http://localhost:1337/api, поэтому хвост /api
 * не добавляется второй раз — иначе запрос ушёл бы в /api/api/...
 */
export const apiBase = (): string => {
  const raw = process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!raw) {
    throw new Error(
      "Не задан STRAPI_URL (или NEXT_PUBLIC_API_URL) — некуда обращаться к бэкенду"
    );
  }

  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

/**
 * Адрес Strapi для серверного кода. NEXT_PUBLIC_* остаётся запасным
 * вариантом для локальной разработки, но сам модуль импортируется
 * только серверным кодом и в бандл браузера не попадает.
 */
export const strapiUrl = (): string => apiBase();

/** Корень сайта Strapi без /api — файлы лежат в /uploads. */
const mediaOrigin = (): string => {
  const trimmed = (process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "")
    .trim()
    .replace(/\/+$/, "");

  return trimmed.replace(/\/api$/, "");
};

/**
 * Превращает относительный путь медиа в абсолютный адрес.
 *
 * Strapi отдаёт «/uploads/photo.jpg», а next/image такой путь
 * ищет на собственном домене Next и получает 400 — картинка
 * не появляется, хотя ссылка в разметке есть. Компонент
 * отдаёт только файлы с разрешённого хоста, поэтому адрес
 * собирается здесь, на сервере, и не раскрывает ничего лишнего:
 * хост Strapi и так известен из next.config.
 */
export const absoluteMediaUrl = (url?: string | null): string | null => {
  if (!url) return null;

  // Уже абсолютный адрес — например, если в CMS записан внешний URL.
  if (/^https?:\/\//i.test(url)) return url;

  return `${mediaOrigin()}${url.startsWith("/") ? "" : "/"}${url}`;
};

/**
 * Проставляет абсолютные адреса во всех полях url ответа Strapi.
 *
 * Обход в ширину: структура произвольная — атрибуции у тарифов,
 * форматы картинок (thumbnail, large), альбомы с вложенными фото.
 */
const withAbsoluteMediaUrls = <T>(node: T): T => {
  if (Array.isArray(node)) {
    return node.map((item) => withAbsoluteMediaUrls(item)) as unknown as T;
  }

  if (node === null || typeof node !== "object") {
    return node;
  }

  const source = node as Record<string, unknown>;

  for (const [key, value] of Object.entries(source)) {
    if (key === "url" && typeof value === "string") {
      source[key] = absoluteMediaUrl(value);
    } else if (typeof value === "object" && value !== null) {
      source[key] = withAbsoluteMediaUrls(value);
    }
  }

  return node;
};

/** Ответ Strapi, приведённый к единому виду. */
export type StrapiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** Требовать авторизованного пользователя. */
  auth?: boolean;
};

/**
 * Запрос к Strapi с сервера.
 *
 * Ошибки Strapi не пробрасываются в UI как есть: клиенту отдаётся
 * безопасный текст, а детали остаются в серверном логе.
 */
export const strapiFetch = async <T>(
  /** Путь относительно корня API: «attractions» или «/attractions». */
  path: string,
  { method = "GET", query, body, auth = false }: RequestOptions = {}
): Promise<StrapiResult<T>> => {
  // Путь приходит и как «/attractions», и как «attractions» — приводим
  // к одному виду, иначе корневой адрес склеивается с путём.
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${apiBase()}${normalized}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = (await cookies()).get(AUTH_COOKIE)?.value;
    if (!token) {
      return { ok: false, error: "Требуется вход в личный кабинет", status: 401 };
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // Публичные GET кешируются (ISR): на билде страницы пререндерятся
      // вместе с данными Strapi и обновляются раз в REVALIDATE_SECONDS.
      // Авторизованные запросы зависят от кук, а мутации меняют данные —
      // их кешировать нельзя, поэтому они всегда идут напрямую.
      ...(method === "GET" && !auth
        ? { next: { revalidate: REVALIDATE_SECONDS } }
        : { cache: "no-store" as const }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Сообщение Strapi полезно для отладки, но может содержать
      // детали реализации — клиенту отдаём текст из наших правил.
      console.error(`Strapi ${method} ${path} -> ${res.status}`, payload);
      return {
        ok: false,
        error: readableError(res.status, payload),
        status: res.status,
      };
    }

    return { ok: true, data: withAbsoluteMediaUrls(payload as T) };
  } catch (error) {
    console.error(`Strapi ${method} ${path} недоступен`, error);
    return { ok: false, error: "Сервер временно недоступен", status: 503 };
  }
};

/** Переводит код ответа Strapi в понятное гостю сообщение. */
const readableError = (status: number, payload: any): string => {
  const fromApi = payload?.error?.message;

  if (typeof fromApi === "string" && !/internal server error/i.test(fromApi)) {
    return fromApi;
  }

  switch (status) {
    case 400:
      return "Проверьте заполнение формы";
    case 401:
      return "Требуется вход в личный кабинет";
    case 403:
      return "Недостаточно прав для этого действия";
    case 404:
      return "Запись не найдена";
    case 429:
      return "Слишком много попыток, попробуйте позже";
    default:
      return "Не удалось выполнить запрос";
  }
};

/* ------------------------------------------------------------------ */
/*  Валидация                                                          */
/* ------------------------------------------------------------------ */

/** Возвращает строку без surrounding пробелов или null, если пусто. */
export const cleanText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

/** Телефон: цифры, пробелы, скобки, плюс. */
export const isPhone = (value: string): boolean => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

/**
 * Обрезает строку до предела, чтобы клиент не записал в базу
 * мегабайт «описания визита».
 */
export const clamp = (value: string, max: number): string =>
  value.length > max ? value.slice(0, max) : value;

/**
 * Целое число в диапазоне. Возвращает null, если значение некорректно,
 * чтобы вызывающий код сам решил, что показать гостю.
 */
export const parseCount = (value: unknown, min: number, max: number): number | null => {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return null;
  return number;
};

/** Строка из ограниченного набора значений. */
export const parseEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | null => (typeof value === "string" && (allowed as readonly string[]).includes(value)
  ? (value as T)
  : null);