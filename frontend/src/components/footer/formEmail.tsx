"use client";

import React, { useActionState } from "react";
import styles from "./footer.module.scss";
import sendImg from "@/../public/icons/sendEmail.svg";
import Image from "next/image";
import { submitGuestRequest, type ActionState } from "@/app/actions/public";

const initialState: ActionState = {};

/**
 * Подписка на новости в подвале.
 *
 * Использует тот же server action, что и форма на странице контактов,
 * поэтому адрес Strapi и правила валидации остаются на сервере.
 */
export const FormEmail = () => {
  const [state, formAction, isPending] = useActionState(submitGuestRequest, initialState);

  return (
    <form action={formAction}>
      <input placeholder="Введите email" type="email" name="email" required />

      {/* Скрытые поля обязательны для правил серверной валидации. */}
      <input type="hidden" name="name" value="Подписчик рассылки" />
      <input type="hidden" name="message" value="Прошу присылать анонсы парка" />
      <input type="hidden" name="consent" value="yes" />

      <button type="submit" disabled={isPending} aria-label="Подписаться на новости">
        <Image src={sendImg} alt="Подписаться на новости" width={24} height={24} />
      </button>

      {state.error && !state.fieldErrors?.email && (
        <span role="alert" className={styles.subscribeError}>
          {state.error}
        </span>
      )}
    </form>
  );
};