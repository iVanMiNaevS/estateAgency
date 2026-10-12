"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginUser, logout, registerUser, getSessionUser, authFetch } from "@/lib/auth";

/**
 * Действия сервера для форм авторизации.
 *
 * Формы работают без JavaScript: состояние и ошибки приходят
 * обратно через useActionState. Обработчики отдают сообщение,
 * пригодное для показа пользователю, и не пробрасывают стек.
 */

export type FormState = {
  error?: string;
};

const safeNext = (value: unknown): string => {
  // Разрешаем только внутренние пути: защита от open redirect.
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/account";
};

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  if (!identifier || !password) {
    return { error: "Заполните логин и пароль" };
  }

  const result = await loginUser({ identifier, password });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect(safeNext(next));
}

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("passwordConfirm") ?? "");
  const consent = formData.get("consent");
  const next = formData.get("next");

  if (!name) return { error: "Укажите имя" };
  if (!email) return { error: "Укажите e-mail" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Некорректный e-mail" };
  if (password.length < 6) return { error: "Пароль должен быть не короче 6 символов" };
  if (password !== confirmPassword) return { error: "Пароли не совпадают" };

  // Согласие на обработку персональных данных обязательно (152-ФЗ).
  if (!consent) return { error: "Требуется согласие на обработку персональных данных" };

  const result = await registerUser({
    // Strapi требует username; используем e-mail как логин клиента.
    username: email,
    email,
    password,
    name,
    phone: phone || undefined,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect(safeNext(next));
}

export async function logoutAction() {
  await logout();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Отмена бронирования клиентом. */
export async function cancelBookingAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;

  await authFetch(`/bookings/${id}/cancel`, { method: "POST" });
  revalidatePath("/account");
}

/**
 * Предоплата бронирования.
 *
 * Демонстрационный режим: платёжного провайдера нет, остаток суммы
 * по ТЗ сдаётся в кассе на месте. Действие лишь записывает в бронь
 * внесённую сумму. На боевом сайте такую кнопку выводить нельзя.
 */
export async function prepayBookingAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;

  await authFetch(`/bookings/${id}/prepay`, { method: "POST" });
  revalidatePath("/account");
}

/** Сохранение профиля. */
export async function updateProfileAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const data: Record<string, string> = {};

  for (const field of ["name", "lastName", "phone", "city"] as const) {
    const value = String(formData.get(field) ?? "").trim();
    if (value) data[field] = value;
  }

  const birthDate = String(formData.get("birthDate") ?? "").trim();
  if (birthDate) data.birthDate = birthDate;

  if (Object.keys(data).length === 0) {
    return { error: "Нет полей для сохранения" };
  }

  const result = await authFetch<{ data: unknown }>("/profile", {
    method: "PUT",
    body: JSON.stringify({ data }),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/account");
  return { error: undefined };
}

/** Текущий пользователь для server-компонентов. */
export async function currentUser() {
  return getSessionUser();
}