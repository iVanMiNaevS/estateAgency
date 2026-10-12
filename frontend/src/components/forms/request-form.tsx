"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { AppRouter } from "@/AppRouter";
import styles from "./request-form.module.scss";
import { submitGuestRequest, type ActionState } from "@/app/actions/public";

const initialState: ActionState = {};

/**
 * Форма быстрой заявки гостя (ТЗ п.4.2.2).
 *
 * Компонент не знает адрес Strapi и не собирает payload для бэкенда:
 * он отправляет FormData в server action, где проверяются поля,
 * согласие на обработку данных и только потом уходит запрос.
 */
export const RequestForm = () => {
  const [state, formAction, isPending] = useActionState(submitGuestRequest, initialState);
  const [contact, setContact] = useState("phone");

  if (state.ok) {
    return (
      <p className={styles.success} role="status">
        Заявка отправлена. Мы свяжемся с вами в ближайшее время.
      </p>
    );
  }

  const fieldError = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className={styles.form}>
      {state.error && !state.fieldErrors && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="request-name">Имя</label>
        <input
          id="request-name"
          name="name"
          placeholder="Как к вам обращаться"
          required
          aria-invalid={Boolean(fieldError("name"))}
        />
        {fieldError("name") && <span className={styles.fieldError}>{fieldError("name")}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="request-phone">Телефон</label>
        <input
          id="request-phone"
          name="phone"
          type="tel"
          placeholder="+7 (900) 000-00-00"
          aria-invalid={Boolean(fieldError("phone"))}
        />
        {fieldError("phone") && <span className={styles.fieldError}>{fieldError("phone")}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="request-email">E-mail</label>
        <input id="request-email" name="email" type="email" placeholder="Для ответа на заявку" />
        {fieldError("email") && <span className={styles.fieldError}>{fieldError("email")}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="request-contact">Удобный способ связи</label>
        <select
          id="request-contact"
          name="activeContact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
        >
          <option value="phone">Телефон</option>
          <option value="email">E-mail</option>
          <option value="telegram">Telegram</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="request-message">Сообщение</label>
        <textarea
          id="request-message"
          name="message"
          rows={4}
          placeholder="Например: хотим приехать 15-го с двумя детьми"
        />
      </div>

      <label className={styles.consent}>
        <input type="checkbox" name="consent" value="yes" required />
        <span>
          Я согласен на обработку персональных данных в соответствии с{" "}
          <Link href={AppRouter.privacy}>политикой конфиденциальности</Link>
        </span>
      </label>
      {fieldError("consent") && <span className={styles.fieldError}>{fieldError("consent")}</span>}

      <button type="submit" className="btn btn-purple" disabled={isPending}>
        {isPending ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
};