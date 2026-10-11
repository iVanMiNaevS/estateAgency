import React from "react";
import styles from "./footer.module.scss";
import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/imgs/Logo.svg";
import {FormEmail} from "./formEmail";
import {AppRouter} from "@/AppRouter";
type Props = {
	/** Признак входа из серверного layout. */
	isAuthenticated?: boolean;
};

export const Footer = ({isAuthenticated = false}: Props) => {
	const footerLinks = [
		{
			page: { text: "Главная", link: AppRouter.home },
			anchors: [
				{ text: "Популярные аттракционы", link: `${AppRouter.home}#main-recomendedAttractionSection` },
				{ text: "Отзывы", link: `${AppRouter.home}#main-reviewsSection` },
				{ text: "Частые вопросы", link: `${AppRouter.home}#main-faqSection` },
			],
		},
		{
			page: { text: "Аттракционы", link: AppRouter.attractions },
			anchors: [
				{ text: "Все аттракционы", link: AppRouter.attractions },
				{ text: "Экстремальные", link: `${AppRouter.attractions}?type=extreme` },
				{ text: "Семейные", link: `${AppRouter.attractions}?type=family` },
				{ text: "Детские", link: `${AppRouter.attractions}?type=child` },
			],
		},
		{
			page: { text: "Посетителям", link: AppRouter.schedule },
			anchors: [
				{ text: "Расписание и запись", link: AppRouter.schedule },
				{ text: "Цены на билеты", link: AppRouter.prices },
				{ text: "Правила посещения", link: AppRouter.rules },
				{ text: "О парке", link: AppRouter.about },
			],
		},
		{
			page: { text: "Парк", link: AppRouter.news },
			anchors: [
				{ text: "Новости", link: AppRouter.news },
				{ text: "Галерея", link: AppRouter.gallery },
				{ text: "Контакты", link: AppRouter.contact },
			],
		},
		{
			page: isAuthenticated
				? { text: "Личный кабинет", link: AppRouter.account }
				: { text: "Войти", link: AppRouter.login },
		},
		{
			page: { text: "Политика конфиденциальности", link: AppRouter.privacy },
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
