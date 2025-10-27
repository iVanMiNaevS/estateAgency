import React from "react";
import styles from "./footer.module.scss";
import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/imgs/Logo.svg";
import {FormEmail} from "./formEmail";
import {AppRouter} from "@/AppRouter";
export const Footer = () => {
	const footerLinks = [
		{
			page: {text: "Главная", link: AppRouter.home},
			anchors: [
				{text: "Встречающая секция", link: "#main-heroSection"},
				{text: "Рекомендуемые объекты", link: "#main-recomendedEstateSection"},
				{text: "Отзывы", link: "#main-recomendedEstateSection"},
				{text: "Часто задаваемые вопросы", link: "#main-faqSection"},
			],
		},
		{
			page: {text: "О нас", link: AppRouter.about},
			anchors: [
				{text: "Наш путь", link: "#"},
				{text: "Наши ценности", link: "#"},
				{text: "Наши достижения", link: "#"},
				{text: "Наша команда", link: "#"},
				{text: "Наши клиенты", link: "#"},
			],
		},
		{
			page: {text: "Каталог", link: AppRouter.catalog},
			anchors: [
				{text: "Недвижимость", link: "#"},
				{text: "Связь", link: "#"},
			],
		},
		{
			page: {text: "Войти", link: AppRouter.login},
		},
		{
			page: {text: "Зарегестрироваться", link: AppRouter.signIn},
		},
	];
	return (
		<footer className={styles.footer}>
			<div className="container">
				<div className={styles.feedback}>
					<Image src={logo} alt="Логотип ЭлитДом" />
					<FormEmail />
				</div>
				<div className={styles.linksWrapp}>
					{footerLinks.map((column) => {
						return (
							<div key={column.page.text} className={styles.column}>
								<Link href={column.page.link} className={styles.page}>
									{column.page.text}
								</Link>
								<ul className={styles.links}>
									{column.anchors &&
										column.anchors.map((anchor) => {
											return (
												<li key={anchor.text}>
													<Link href={anchor.link}>{anchor.text}</Link>
												</li>
											);
										})}
								</ul>
							</div>
						);
					})}
				</div>
			</div>
		</footer>
	);
};
