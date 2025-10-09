import Image from "next/image";
import React from "react";
import logo from "@/../public/imgs/Logo.svg";
import {AppRouter} from "@/AppRouter";
import Link from "next/link";
import styles from "./header.module.scss";
import {HeaderLinks} from "./headerLinks";
export const Header = () => {
	const nav = [
		{text: "Главная", link: AppRouter.home},
		{text: "О нас", link: AppRouter.about},
		{text: "Каталог", link: AppRouter.catalog},
		{text: "Сервисы", link: AppRouter.services},
	];
	return (
		<header className={styles.header}>
			<div className={styles.header__container + " container"}>
				<Link href={AppRouter.home} className="logo">
					<Image src={logo} alt="Логотип ЭлитДом" />
				</Link>
				<HeaderLinks links={nav} />
				<Link href={"#callback"} className={styles.active + " " + styles.buttonLink}>
					Связаться с нами
				</Link>
			</div>
		</header>
	);
};
