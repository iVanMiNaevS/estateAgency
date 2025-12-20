"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import React from "react";
import styles from "./header.module.scss";
import {AppRouter} from "@/AppRouter";
type props = {
	links: {text: string; link: string}[];
	isMenuOpen: boolean;
	setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
};

export const HeaderLinks = ({links, setIsMenuOpen, isMenuOpen}: props) => {
	const path = usePathname();
	return (
		<>
			<nav className={isMenuOpen ? styles.active : ''}>
				{links.map((link) => {
					return (
						<Link
							key={link.text}
							className={path === link.link ? styles.active : ""}
							href={link.link}
							onClick={()=>{setIsMenuOpen(false)}}
						>
							{link.text}
						</Link>
					);
				})}
				<Link
					onClick={()=>{setIsMenuOpen(false)}}
					href={AppRouter.contact}
					className={`${path === AppRouter.contact
							? styles.active + " " + styles.buttonLink + ' ' + styles.mob
							:   styles.buttonLink + ' ' + styles.mob} ${isMenuOpen && styles.activeMob}`
					}
				>
					Связаться с нами
				</Link>
			</nav>
			<Link
				href={AppRouter.contact}
				className={`${path === AppRouter.contact
						? styles.activeBtn + " " + styles.active + " " + styles.buttonLink
						: styles.active + " " + styles.buttonLink}`
				}
			>
				Связаться с нами
			</Link>
		</>
	);
};
