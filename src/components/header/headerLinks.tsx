"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import React from "react";
import styles from "./header.module.scss";
import {AppRouter} from "@/AppRouter";
type props = {
	links: {text: string; link: string}[];
};

export const HeaderLinks = ({links}: props) => {
	const path = usePathname();
	return (
		<>
			<nav>
				{links.map((link) => {
					return (
						<Link
							key={link.text}
							className={path === link.link ? styles.active : ""}
							href={link.link}
						>
							{link.text}
						</Link>
					);
				})}
			</nav>
			<Link
				href={AppRouter.contact}
				className={
					path === AppRouter.contact
						? styles.activeBtn + " " + styles.active + " " + styles.buttonLink
						: styles.active + " " + styles.buttonLink
				}
			>
				Связаться с нами
			</Link>
		</>
	);
};
