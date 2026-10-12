"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  strapiFetch,
  cleanText,
  clamp,
  isEmail,
  isPhone,
  parseCount,
} from "@/lib/strapi";

/**
 * Действия BFF-слоя для публичной части.
 *
 * Клиентские компоненты не знают адрес Strapi и не формируют запросы
 * к нему сами: они отправляют форму, а валидация, сборка payload
 * и проверка прав происходят здесь, на сервере.
 */

export type ActionState = {
  ok?: boolean;
  error?: string;
  /** Тексты ошибок по конкретным полям — для подсветки формы. */
  fieldErrors?: Record<string, string>;
};

/* ------------------------------------------------------------------ */
/*  Быстрая заявка гостя (ТЗ п.4.2.2)                                   */
/* ------------------------------------------------------------------ */

const CONTACT_METHODS = ["phone", "email", "telegram", "whatsapp"] as const;

export async function submitGuestRequest(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = cleanText(formData.get("name"));
  const email = cleanText(formData.get("email"));
  const phone = cleanText(formData.get("phone"));
  const message = clamp(cleanText(formData.get("message")) ?? "", 2000);
  const preferredContact = cleanText(formData.get("activeContact")) ?? "phone";
  const consent = formData.get("consent");

  const fieldErrors: Record<string, string> = {};

  if (!name || name.length < 2) fieldErrors.name = "Укажите имя";
  if (!phone && !email) {
    fieldErrors.phone = "Укажите телефон или e-mail";
  }
  if (email && !isEmail(email)) fieldErrors.email = "Некорректный e-mail";
  if (phone && !isPhone(phone)) fieldErrors.phone = "Некорректный телефон";
  // Согласие на обработку персональных данных обязательно (152-ФЗ).
  if (!consent) fieldErrors.consent = "Требуется согласие на обработку данных";


  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Проверьте заполнение формы", fieldErrors };
  }

  const result = await strapiFetch<unknown>("/user-requests", {
    method: "POST",
    body: {
      data: {
        name,
        email: email ?? undefined,
        phone: phone ?? undefined,
        message: message || undefined,
        activeContact: CONTACT_METHODS.includes(
          preferredContact as (typeof CONTACT_METHODS)[number]
        )
          ? preferredContact
          : "phone",
      },
    },
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/contact");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/*  Поиск по сайту (ТЗ F-1.7)                                          */
/* ------------------------------------------------------------------ */

export type SearchItem = {
  kind: "attraction" | "news";
  id: number;
  title: string;
  description: string;
  href: string;
};

/**
 * Поиск по аттракционам и новостям.
 *
 * Фильтрация выполняется на сервере в JavaScript, а не через
 * filters[title][$containsi], потому что SQLite LOWER() не приводит
 * регистр кириллицы: запрос «колесо» не находил бы «Колесо обозрения».
 * Объём контента небольшой, поэтому это безопаснее, чем включение ICU.
 *
 * Строка запроса обрезается, число результатов ограничено, а наружу
 * отдаются только нужные поля.
 */
export async function searchSite(rawQuery: string): Promise<SearchItem[]> {
  const query = clamp(cleanText(rawQuery) ?? "", 100);
  if (query.length < 2) return [];

  const needle = query.toLowerCase();
  const matches = (value: unknown) =>
    typeof value === "string" && value.toLowerCase().includes(needle);

  const [attractions, news] = await Promise.all([
    strapiFetch<{ data: any[] }>("/attractions", {
      query: {
        "pagination[pageSize]": 100,
        "fields[0]": "title",
        "fields[1]": "shortFact",
        "fields[2]": "slug",
      },
    }),
    strapiFetch<{ data: any[] }>("/news-items", {
      query: {
        "pagination[pageSize]": 100,
        "fields[0]": "title",
        "fields[1]": "excerpt",
        "fields[2]": "slug",
      },
    }),
  ]);

  const items: SearchItem[] = [];

  for (const attraction of attractions.ok ? attractions.data.data ?? [] : []) {
    if (!matches(attraction.title)) continue;
    items.push({
      kind: "attraction",
      id: attraction.id,
      title: attraction.title ?? "",
      description: attraction.shortFact ?? "",
      href: `/attractions/${attraction.slug ?? ""}`,
    });
  }

  for (const entry of news.ok ? news.data.data ?? [] : []) {
    if (!matches(entry.title)) continue;
    items.push({
      kind: "news",
      id: entry.id,
      title: entry.title ?? "",
      description: entry.excerpt ?? "",
      href: `/news/${entry.slug ?? ""}`,
    });
  }

  return items.slice(0, 20);
}

/* ------------------------------------------------------------------ */
/*  Бронирование (ТЗ F-1.9)                                            */
/* ------------------------------------------------------------------ */

export type BookingResult = {
  ok: boolean;
  error?: string;
  totalPrice?: number;
  freeSeats?: number;
};

/**
 * Оформление брони клиентом.
 *
 * Требует авторизации: проверка роли выполняется на сервере при запросе
 * к Strapi, а сам состав гостей и тариф валидируются здесь до похода
 * на бэкенд. Итоговую цену считает Strapi — клиентскому значению
 * здесь не доверяем.
 */
export async function createBooking(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sessionId = parseCount(formData.get("session"), 1, Number.MAX_SAFE_INTEGER);
  const adultsCount = parseCount(formData.get("adultsCount"), 0, 50);
  const childrenCount = parseCount(formData.get("childrenCount"), 0, 50);
  const consent = formData.get("consent");

  const fieldErrors: Record<string, string> = {};

  if (sessionId === null) fieldErrors.session = "Выберите сеанс";
  if (adultsCount === null || adultsCount < 0) {
    fieldErrors.adultsCount = "Проверьте количество взрослых";
  }
  if (childrenCount === null || childrenCount < 0) {
    fieldErrors.childrenCount = "Проверьте количество детей";
  }
  if (adultsCount !== null && childrenCount !== null && adultsCount + childrenCount < 1) {
    fieldErrors.adultsCount = "Укажите хотя бы одного гостя";
  }
  if (!consent) fieldErrors.consent = "Требуется согласие на обработку данных";

  // Тариф обязателен: отдельного варианта «без тарифа» в форме
  // больше нет — обычный тариф и есть полная цена. Пустое значение
  // приходит только при подделанной форме.
  const tariffRaw = formData.get("tariff");
  const tariff = parseCount(tariffRaw, 1, Number.MAX_SAFE_INTEGER);
  if (tariff === null) fieldErrors.tariff = "Выберите тариф";

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Проверьте заполнение формы", fieldErrors };
  }

  const wishes = clamp(cleanText(formData.get("wishes")) ?? "", 1000);

  const result = await strapiFetch<{ data: any }>("/bookings", {
    method: "POST",
    auth: true,
    body: {
      data: {
        session: sessionId,
        adultsCount,
        childrenCount,
        ...(tariff !== null ? { tariff } : {}),
        ...(wishes ? { wishes } : {}),
      },
    },
  });

  if (!result.ok) {
    if (result.status === 401) {
      return {
        error: "Войдите в личный кабинет, чтобы забронировать",
        fieldErrors: { session: "Требуется авторизация" },
      };
    }
    return { error: result.error, fieldErrors: { session: result.error } };
  }

  revalidatePath("/account");
  return { ok: true };
}

/** Отмена брони и возврат к форме — используется после успеха. */
export async function finishBooking() {
  redirect("/account");
}