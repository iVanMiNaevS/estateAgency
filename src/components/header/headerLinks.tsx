"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import React from "react";
import styles from "./header.module.scss";
type props = {
	links: {text: string; link: string}[];
};

export const HeaderLinks = ({links}: props) => {
	const path = usePathname();
	return (
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
	);
};
