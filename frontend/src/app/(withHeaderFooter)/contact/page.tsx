"use client";
import React, {useState} from "react";
import styles from "./contact.module.scss";
import {CardTextLogo, typeCardTextLogo} from "@/ui/cardTextLogo/cardTextLogo";

import emaiLogo from "@/../public/icons/email2.svg";
import phoneLogo from "@/../public/icons/phone.svg";
import geoLogo from "@/../public/icons/geo.svg";
import logo from "@/../public/icons/logo2.svg";

const page = () => {
	const cards: typeCardTextLogo[] = [
		{logo: emaiLogo, text: "info@estatein.com"},
		{logo: phoneLogo, text: "+7 (930) 653 56-65 "},
		{logo: geoLogo, text: "г.Рязань"},
		{logo: logo, text: "Max"},
	];
	const [accept, setAccept] = useState(false);

	return (
		<div>
			<section id="contact-sectionHello" className={styles.helloSection}>
				<div className="container">
					<h1 className="h2">Свяжитесь с компанией ЭлитДом</h1>
					<p className={styles.helloSection__desc}>
						Добро пожаловать на страницу контактов ЭлитДом. Мы здесь, чтобы помочь вам с любыми
						вопросами, пожеланиями или отзывами, которые у вас могут возникнуть. Хотите ли вы купить
						или продать недвижимость, изучить инвестиционные возможности или просто хотите связаться
						с нами, мы всегда готовы помочь. Свяжитесь с нами, и давайте начнем разговор.
					</p>
				</div>
			</section>
			<section id="contact-sectionCardText" className={styles.cardsTextLogoSection}>
				{cards.map((card) => {
					return <CardTextLogo key={card.text} logo={card.logo} text={card.text} />;
				})}
			</section>
			<section id="contact-sectionForm" className={styles.formSection}>
				<div className="container">
					<div className={styles.formSection__top}>
						<h2 className="h2">Давайте соединимся</h2>
						<p>
							Мы будем рады связаться с вами и узнать больше о ваших целях в сфере недвижимости.
							Воспользуйтесь формой ниже, чтобы связаться с ЭлитДом. Являетесь ли вы потенциальным
							клиентом, партнером или просто интересуетесь нашими услугами, мы всегда готовы
							ответить на ваши вопросы и оказать необходимую помощь.
						</p>
					</div>
					<form action="">
						<div className={styles.inputWrapp}>
							<p>Имя</p>
							<input type="text" placeholder="Введите имя" />
						</div>
						<div className={styles.inputWrapp}>
							<p>Фамилия</p>
							<input type="text" placeholder="Введите фамилию" />
						</div>
						<div className={styles.inputWrapp}>
							<p>Email</p>
							<input type="text" placeholder="Введите email" />
						</div>
						<div className={styles.inputWrapp + " " + styles.inputWrappFull}>
							<p>Телефон</p>
							<input type="text" placeholder="Введите номер телефона" />
						</div>
						<div className={styles.inputWrapp + " " + styles.inputWrappArea}>
							<p>Сообщение</p>
							<textarea style={{resize: "none"}} placeholder="Введите своё сообщение здесь" />
						</div>
						<div className={styles.formSection__bottomWrapp}>
							<div className={styles.acceptWrapp}>
								<div
									onClick={() => {
										setAccept((prev) => !prev);
									}}
									className={styles.checkbox}
								>
									{accept ? "✓" : ""}
								</div>
								<p>Я согласен с Условиями использования и Политикой конфиденциальности</p>
							</div>
							<button className="btn btn-purple">Отправьте свое сообщение</button>
						</div>
					</form>
				</div>
			</section>
		</div>
	);
};

export default page;
