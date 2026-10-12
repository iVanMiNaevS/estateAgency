'use client'
import Image from "next/image";
import React, { useState } from "react";
import logo from "@/../public/imgs/ParkMark.svg";
import {AppRouter} from "@/AppRouter";
import Link from "next/link";
import styles from "./header.module.scss";
import {HeaderLinks} from "./headerLinks";

/** Данные текущего пользователя, полученные сервером в layout. */
type HeaderUser = {name: string | null; email: string} | null;

type Props = {
	/** null — гость. Проверка сессии выполнена на сервере. */
	user?: HeaderUser;
};

const nav = [
	{text: "Главная", link: AppRouter.home},
	{text: "Аттракционы", link: AppRouter.attractions},
	{text: "Расписание", link: AppRouter.schedule},
	{text: "Цены", link: AppRouter.prices},
	{text: "Галерея", link: AppRouter.gallery},
	{text: "Новости", link: AppRouter.news},
	{text: "Контакты", link: AppRouter.contact},
];

/**
 * Шапка сайта.
 *
 * Признак входа приходит из серверного layout, поэтому ссылка всегда
 * соответствует реальной сессии: гость видит «Войти», авторизованный —
 * ссылку в кабинет. Сам токен в компоненте не участвует и в браузер
 * не попадает.
 */
export const Header = ({user = null}: Props) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className={styles.header}>
			<div className={styles.header__container + " container"}>
				<Link href={AppRouter.home} className={styles.logo}>
					<Image src={logo} alt="" width={40} height={40} />
					{/* Название обычным текстом: в старом SVG оно было
					    нарисовано контурами и осталось от шаблона. */}
					<span className={styles.logoName}>Парк Чудес</span>
				</Link>

				<button
					className={styles.mobileMenuButton}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					aria-label="Открыть меню"
					aria-expanded={isMenuOpen}
				>
					{isMenuOpen ? '✕' : '☰'}
				</button>

				<HeaderLinks setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} links={nav} />

				{user ? (
					<Link
						href={AppRouter.account}
						className={styles.account}
						title={user.email}
					>
						{user.name ?? "Личный кабинет"}
					</Link>
				) : (
					<Link href={AppRouter.login} className={styles.account}>
						Войти
					</Link>
				)}
			</div>
		</header>
	);
};