"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.scss";
import logo from "@/../public/icons/iconLogo.svg";
import { AppRouter } from "@/AppRouter";
import { loginAction, type FormState } from "@/app/actions/auth";

const initialState: FormState = {};

/**
 * Форма входа.
 *
 * Отправка идёт в server action: пароль уходит на сервер Next.js,
 * который обменивает его на JWT у Strapi и кладёт токен в httpOnly
 * cookie. В браузере токен не появляется.
 */
export const LoginForm = ({ next }: { next: string }) => {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className={styles.container}>
      <form action={formAction}>
        <input type="hidden" name="next" value={next} />

        <div className={styles.top}>
          <Image src={logo} alt="Логотип парка" width={40} height={40} />
          Вход в личный кабинет
        </div>

        {state.error && (
          <p role="alert" className={styles.error}>
            {state.error}
          </p>
        )}

        <div className={styles.inputs}>
          <div className={styles.inputWrapp}>
            <p>E-mail или логин</p>
            <input
              type="text"
              name="identifier"
              placeholder="Введите e-mail"
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.inputWrapp}>
            <p>Пароль</p>
            <input
              type="password"
              name="password"
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? "Входим…" : "Войти"}
        </button>

        <div className={styles.bottom}>
          <span>
            Нет аккаунта? <Link href={AppRouter.signIn}>Зарегистрироваться</Link>
          </span>
        </div>
      </form>
    </div>
  );
};