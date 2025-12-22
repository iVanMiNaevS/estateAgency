"use client";
import React, {useState} from "react";
import styles from "./contact.module.scss";
import {CardTextLogo, typeCardTextLogo} from "@/ui/cardTextLogo/cardTextLogo";

import emaiLogo from "@/../public/icons/email2.svg";
import phoneLogo from "@/../public/icons/phone.svg";
import geoLogo from "@/../public/icons/geo.svg";
import logo from "@/../public/icons/logo2.svg";
import { makeRequest } from "@/services/getInfo";

type FormState = {
	name: string;
	secondName: string;
	email: string;
	phone: string;
	message: string;
};
const page = () => {
	const cards: typeCardTextLogo[] = [
		{logo: emaiLogo, text: "info@estatein.com"},
		{logo: phoneLogo, text: "+7 (930) 653 56-65 "},
		{logo: geoLogo, text: "г.Рязань"},
		{logo: logo, text: "Max"},
	];
	const [accept, setAccept] = useState(false);

	const [form, setForm] = useState<FormState>({
		name: "",
		secondName: "",
		email: "",
		phone: "",
		message: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if(accept){
			const payload = {
				...form,
			};
			const res = await makeRequest('user-requests', undefined, false, "POST", {data:payload})
		}
	};
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
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className={styles.inputWrapp}>
							<p>Имя</p>
							<input
								type="text"
								name="name"
								placeholder="Введите имя"
								value={form.name}
								onChange={handleChange}
							/>
						</div>

						<div className={styles.inputWrapp}>
							<p>Фамилия</p>
							<input
								type="text"
								name="secondName"
								placeholder="Введите фамилию"
								value={form.secondName}
								onChange={handleChange}
							/>
						</div>

						<div className={styles.inputWrapp}>
							<p>Email</p>
							<input
								type="email"
								name="email"
								placeholder="Введите email"
								value={form.email}
								onChange={handleChange}
							/>
						</div>

						<div className={`${styles.inputWrapp} ${styles.inputWrappFull}`}>
							<p>Телефон</p>
							<input
								type="tel"
								name="phone"
								placeholder="Введите номер телефона"
								value={form.phone}
								onChange={handleChange}
							/>
						</div>

						<div className={`${styles.inputWrapp} ${styles.inputWrappArea}`}>
							<p>Сообщение</p>
							<textarea
								name="message"
								placeholder="Введите своё сообщение здесь"
								style={{ resize: "none" }}
								value={form.message}
								onChange={handleChange}
							/>
						</div>

						<div className={styles.formSection__bottomWrapp}>
							<div className={styles.acceptWrapp}>
								<div
									onClick={() => setAccept((prev) => !prev)}
									className={styles.checkbox}
								>
									{accept ? "✓" : ""}
								</div>
								<p>
									Я согласен с Условиями использования и Политикой конфиденциальности
								</p>
							</div>

							<button className="btn btn-purple" type="submit">
								Отправьте свое сообщение
							</button>
						</div>
					</form>
				</div>
			</section>
		</div>
	);
};

export default page;
