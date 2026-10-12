import React from "react";
import styles from "./footer.module.scss";
import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/imgs/ParkMark.svg";
import { FormEmail } from "./formEmail";
import { AppRouter } from "@/AppRouter";
type Props = {
	/** Признак входа из серверного layout. */
	isAuthenticated?: boolean;
};

export const Footer = ({ isAuthenticated = false }: Props) => {
	const footerLinks = [
		{
			page: { text: "Главная", link: AppRouter.home },
			anchors: [
				{
					text: "Популярные аттракционы",
					link: `${AppRouter.home}#main-recomendedAttractionSection`,
				},
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
			anchors: isAuthenticated
				? undefined
				: [
						// Без этой ссылки зарегистрироваться можно было
						// только вручную набрав адрес в строке браузера.
						{ text: "Регистрация", link: AppRouter.signIn },
					],
		},
		{
			// Раньше это были две отдельные колонки с одной ссылкой
			// каждая — они выглядели пусто рядом с колонками,
			// где ссылок несколько. Теперь это один раздел.
			page: { text: "Документы", link: AppRouter.privacy },
			anchors: [{ text: "Политика конфиденциальности", link: AppRouter.privacy }],
		},
	];
	return (
		<footer className={styles.footer}>
			<div className="container">
				<div className={styles.feedback}>
					<Image src={logo} alt="" width={48} height={48} />
					<span className={styles.logoName}>Парк Чудес</span>
					<FormEmail />
				</div>
				<div className={styles.linksWrapp}>
					{footerLinks.map((column) => {
						return (
							<div key={column.page.text} className={styles.column}>
								<Link href={column.page.link} className={styles.page}>
									{column.page.text}
								</Link>
								{/* Список выводим, только когда есть что показать:
								    пустой <ul> в разметке ничего не даёт. */}
								{column.anchors && column.anchors.length > 0 && (
									<ul className={styles.links}>
										{column.anchors.map((anchor) => (
											<li key={anchor.text}>
												<Link href={anchor.link}>{anchor.text}</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</footer>
	);
};
