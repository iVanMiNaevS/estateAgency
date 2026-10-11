import { strapiFetch, type StrapiResult } from "@/lib/strapi";
import type { IMeta } from "@/types/meta.interface";

/**
 * Обёртки над серверным доступом к Strapi.
 *
 * Раньше здесь собирался запрос и уходил напрямую из клиентских
 * компонентов через NEXT_PUBLIC_API_URL, из-за чего адрес бэкенда
 * был виден в браузере. Теперь всё общение идёт через BFF-слой
 * src/lib/strapi.ts, который доступен только серверному коду.
 */

/** Данные singleType-экрана, например главной страницы. */
export const getScreenInfo = async <T>(
  endPoint: string,
  queryValues?: string[] | []
): Promise<{ data: T }> => {
  const result = await strapiFetch<{ data: T }>(endPoint, {
    query: buildPopulate(queryValues),
  });

  return { data: result.ok ? result.data.data : ({} as T) };
};

export const getObjects = async <T>(
  endPoint: string,
  queryValues?: string[] | [],
  filters?: { filter: FilterOperator; field: string; value: string }[],
  pagination?: { params: "page" | "pageSize"; value: number }[]
): Promise<{ data: T[]; meta: IMeta }> => {
  const result = await strapiFetch<{ data: T[]; meta: IMeta }>(endPoint, {
    query: {
      ...buildPopulate(queryValues),
      ...buildFilters(filters),
      ...buildPagination(pagination),
    },
  });

  return result.ok
    ? { data: result.data.data ?? [], meta: result.data.meta ?? ({} as IMeta) }
    : { data: [], meta: {} as IMeta };
};

/**
 * Запрос к Strapi от имени авторизованного пользователя.
 * Токен берётся из httpOnly cookie, клиент его не видит.
 */
export const authRequest = async <T>(
  endPoint: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  body?: Record<string, unknown>
): Promise<StrapiResult<T>> =>
  strapiFetch<T>(endPoint, { method, body, auth: true });

/* ------------------------------------------------------------------ */
/*  Сборка query-параметров                                            */
/* ------------------------------------------------------------------ */

type FilterOperator = "$eq" | "$contains";

/** Поля для populate: ["poster", "options.icon"] -> populate[0]=poster… */
const buildPopulate = (queryValues?: string[] | []): Record<string, string> => {
  const query: Record<string, string> = {};
  if (!queryValues) return query;

  queryValues.forEach((value, index) => {
    query[`populate[${index}]`] = value;
  });

  return query;
};

const buildFilters = (
  filters?: { filter: FilterOperator; field: string; value: string }[]
): Record<string, string> => {
  const query: Record<string, string> = {};
  if (!filters) return query;

  filters.forEach((filter) => {
    query[`filters[${filter.field}][${filter.filter}]`] = filter.value;
  });

  return query;
};

const buildPagination = (
  pagination?: { params: "page" | "pageSize"; value: number }[]
): Record<string, string> => {
  const query: Record<string, string> = {};
  if (!pagination) return query;

  pagination.forEach((one) => {
    query[`pagination[${one.params}]`] = String(one.value);
  });

  return query;
};