import { cookies } from "next/headers";

/**
 * Серверная работа с авторизацией.
 *
 * Токен хранится в httpOnly cookie: код в браузере его не читает,
 * поэтому украсть его XSS-скриптом нельзя. Проверка роли выполняется
 * на сервере Next.js — клиентские компоненты сюда не имеют доступа.
 */

/** Кука с JWT. httpOnly — недоступна из JS, sameSite=lax — защита от CSRF. */
export const AUTH_COOKIE = "park_jwt";

/** Сколько живёт сессия в секундах. Должна совпадать с JWT_SECRET_TTL в Strapi. */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней

export type SessionUser = {
  id: number;
  username: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  birthDate: string | null;
};

/**
 * Адрес Strapi. На сервере берём обычный env без NEXT_PUBLIC_,
 * чтобы можно было держать бэкенд на внутренней сети.
 */
const strapiUrl = () =>
  (process.env.STRAPI_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

type StrapiAuthResponse = {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
    phone?: string | null;
  };
};

/**
 * Регистрация клиента.
 * Strapi требует username и email, поэтому логин клиента
 * формируется из e-mail, а телефон остаётся необязательным полем.
 */
export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${strapiUrl()}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? "Не удалось зарегистрироваться" };
    }

    const auth = data as StrapiAuthResponse;
    if (auth.jwt) {
      await setSessionCookie(auth.jwt);
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Сервер авторизации недоступен" };
  }
}

/** Вход по e-mail (или логину) и паролю. */
export async function loginUser(input: {
  identifier: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${strapiUrl()}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, error: data?.error?.message ?? "Неверный логин или пароль" };
    }

    const auth = data as StrapiAuthResponse;
    if (auth.jwt) {
      await setSessionCookie(auth.jwt);
      return { ok: true };
    }

    return { ok: false, error: "Сервер не вернул токен" };
  } catch {
    return { ok: false, error: "Сервер авторизации недоступен" };
  }
}

/** Записывает токен в httpOnly cookie. */
async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Завершает сессию: удаляем куку на сервере. */
export async function logout() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

/** Возвращает JWT из куки или null. */
export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

/**
 * Проверяет токен на сервере и возвращает профиль пользователя.
 *
 * Именно этот вызов и есть «проверка роли на сервере»: без валидного
 * токена ответ 401, поэтому чужие данные получить нельзя.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${strapiUrl()}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const { data } = await res.json();

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      name: data.name ?? null,
      lastName: data.lastName ?? null,
      phone: data.phone ?? null,
      city: data.city ?? null,
      birthDate: data.birthDate ?? null,
    };
  } catch {
    return null;
  }
}

/** Запрос к Strapi от имени текущего пользователя. */
export async function authFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  const token = await getToken();

  if (!token) {
    return { ok: false, error: "Требуется авторизация", status: 401 };
  }

  try {
    const res = await fetch(`${strapiUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: errorData?.error?.message ?? `Ошибка запроса: ${res.status}`,
        status: res.status,
      };
    }

    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, error: "Сервер недоступен", status: 500 };
  }
}