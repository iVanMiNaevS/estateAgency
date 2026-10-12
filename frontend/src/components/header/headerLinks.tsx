"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import React from "react";
import styles from "./header.module.scss";

type props = {
	links: {text: string; link: string}[];
	isMenuOpen: boolean;
	setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
};

/**
 * Ссылки навигации.
 *
 * Раньше здесь была ещё и кнопка «Связаться с нами» рядом с
 * пунктом «Контакты» — дубль, который при 1440px выдавливал
 * кнопку «Войти» за край экрана. Теперь список один.
 */
export const HeaderLinks = ({links, setIsMenuOpen, isMenuOpen}: props) => {
	const path = usePathname();

	return (
		<nav className={isMenuOpen ? styles.active : ''}>
			{links.map((link) => (
				<Link
					key={link.text}
					className={path === link.link ? styles.active : ""}
					href={link.link}
					onClick={() => setIsMenuOpen(false)}
				>
					{link.text}
				</Link>
			))}
		</nav>
	);
};