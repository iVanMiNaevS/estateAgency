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
		{text: "Услуги", link: AppRouter.catalog},
		{text: "Корзина", link: AppRouter.cart},
	];
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	return (
		<header className={styles.header}>
			<div className={styles.header__container + " container"}>
				<Link href={AppRouter.home} className={styles.logo}>
					UpTrend Agency
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
