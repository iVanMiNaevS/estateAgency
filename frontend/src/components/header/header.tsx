'use client'
import Image from "next/image";
import React, { useState } from "react";
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
	];
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	return (
		<header className={styles.header}>
			<div className={styles.header__container + " container"}>
				<Link href={AppRouter.home} className={styles.logo}>
					<Image src={logo} alt="Логотип ЭлитДом" />
				</Link>
				 <button 
					className={styles.mobileMenuButton}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					aria-label="Открыть меню"
				>
					{isMenuOpen ? '✕' : '☰'}
				</button>
				<HeaderLinks setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} links={nav} />
			</div>
		</header>
	);
};
