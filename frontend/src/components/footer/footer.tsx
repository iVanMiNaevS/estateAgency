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
				{text: "Встречающая секция", link: `${AppRouter.home}#main-heroSection`},
				{text: "Рекомендуемые объекты", link: `${AppRouter.home}#main-recomendedEstateSection`},
				{text: "Отзывы", link: `${AppRouter.home}#main-recomendedEstateSection`},
				{text: "Часто задаваемые вопросы", link: `${AppRouter.home}#main-faqSection`},
			],
		},
		{
			page: {text: "О нас", link: AppRouter.about},
			anchors: [
				{text: "Наш путь", link: `${AppRouter.about}#about-ourWaySection`},
				{text: "Наши ценности", link: `${AppRouter.about}#about-ourValuesSection`},
				{text: "Наши достижения", link: `${AppRouter.about}#about-ourAch`},
			],
		},
		{
			page: {text: "Каталог", link: AppRouter.catalog},
			anchors: [
				{text: "Поиск", link: `${AppRouter.catalog}#catalog-catalogSearch`},
				{text: "Недвижимость", link: `${AppRouter.catalog}#catalog-catalogSection`},
				{text: "Форма связи", link: `${AppRouter.catalog}#catalog-connSection`},
			],
		},
		{
			page: {text: "Котнакты", link: AppRouter.contact},
			anchors: [
				{text: "Контакты", link: `${AppRouter.contact}#contact-sectionCardText`},
				{text: "Форма связи", link: `${AppRouter.contact}#contact-sectionForm`},
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
