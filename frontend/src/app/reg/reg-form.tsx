"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./reg.module.scss";
import logo from "@/../public/icons/iconLogo.svg";
import { AppRouter } from "@/AppRouter";
import { registerAction, type FormState } from "@/app/actions/auth";

const initialState: FormState = {};

/**
 * Форма регистрации.
 *
 * Чекбокс согласия на обработку персональных данных обязателен —
 * это требование 152-ФЗ из ТЗ. Логином клиента служит e-mail.
 */
export const RegisterForm = ({ next }: { next: string }) => {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div className={styles.container}>
      <form action={formAction}>
        <input type="hidden" name="next" value={next} />

        <div className={styles.top}>
          <Image src={logo} alt="Логотип парка" width={40} height={40} />
          Регистрация
        </div>

        {state.error && (
          <p role="alert" className={styles.error}>
            {state.error}
          </p>
        )}

        <div className={styles.inputs}>
          <div className={styles.inputWrapp}>
            <p>Имя</p>
            <input
              type="text"
              name="name"
              placeholder="Как к вам обращаться"
              autoComplete="name"
              required
            />
          </div>

          <div className={styles.inputWrapp}>
            <p>E-mail</p>
            <input
              type="email"
              name="email"
              placeholder="Используется для входа"
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.inputWrapp}>
            <p>Телефон</p>
            <input type="tel" name="phone" placeholder="+7 (900) 000-00-00" autoComplete="tel" />
          </div>

          <div className={styles.inputWrapp}>
            <p>Пароль</p>
            <input
              type="password"
              name="password"
              placeholder="Не короче 6 символов"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className={styles.inputWrapp}>
            <p>Пароль ещё раз</p>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Повторите пароль"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <label className={styles.consent}>
          <input type="checkbox" name="consent" value="yes" required />
          <span>
            Я согласен на обработку персональных данных в соответствии с{" "}
            <Link href={AppRouter.privacy}>политикой конфиденциальности</Link>
          </span>
        </label>

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </button>

        <div className={styles.bottom}>
          <span>
            Уже есть аккаунт? <Link href={AppRouter.login}>Войти</Link>
          </span>
        </div>
      </form>
    </div>
  );
};