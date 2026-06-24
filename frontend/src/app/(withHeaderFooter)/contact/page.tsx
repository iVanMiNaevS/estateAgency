"use client";
import React, {useState} from "react";
import styles from "./contact.module.scss";
import {CardTextLogo, typeCardTextLogo} from "@/ui/cardTextLogo/cardTextLogo";

import emaiLogo from "@/../public/icons/email2.svg";
import phoneLogo from "@/../public/icons/phone.svg";
import geoLogo from "@/../public/icons/geo.svg";
import logo from "@/../public/icons/logo2.svg";


type FormState = {
	name: string;
	secondName: string;
	email: string;
	phone: string;
	message: string;
};

type FormErrors = Partial<Record<keyof FormState | "accept", string>>;

const page = () => {
	const cards: typeCardTextLogo[] = [
		{logo: emaiLogo, text: "info@uptrend.ru"},
		{logo: phoneLogo, text: "+7 (930) 653 56-65"},
		{logo: geoLogo, text: "г. Москва, ул. Тверская, д. 7"},
		{logo: logo, text: "UpTrend"},
	];
	const [accept, setAccept] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
	const [success, setSuccess] = useState(false);

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
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const validate = (): boolean => {
		const newErrors: FormErrors = {};
		if (!form.name.trim()) newErrors.name = "Имя обязательно";
		if (!form.secondName.trim()) newErrors.secondName = "Название компании обязательно";
		if (!form.email.trim()) {
			newErrors.email = "Email обязателен";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			newErrors.email = "Неверный формат email";
		}
		if (!form.phone.trim()) newErrors.phone = "Телефон обязателен";
		if (!form.message.trim()) newErrors.message = "Сообщение обязательно";
		if (!accept) newErrors.accept = "Примите условия использования";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const payload = {
			...form,
		};
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-requests`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({data:payload})
		})
		setSuccess(true);
		setTimeout(() => setSuccess(false), 4000);
	};
	return (
		<div>
			<section id="contact-sectionHello" className={styles.helloSection}>
				<div className="container">
					<h1 className="h2">Свяжитесь с нами — поможем вырасти вашему бизнесу</h1>
					<p className={styles.helloSection__desc}>
						Добро пожаловать в UpTrend — мы здесь, чтобы помочь вашему бизнесу найти новых клиентов 
						и увеличить продажи. Хотите узнать, как работает контекстная реклама, нужен ли вам SMM 
						или вы хотите заказать комплексное продвижение — мы всегда на связи. Заполните форму, 
						позвоните или напишите нам, и мы бесплатно проконсультируем вас по всем вопросам 
						интернет-маркетинга.
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
						<h2 className="h2">Давайте обсудим ваш проект</h2>
						<p>
							Заполните форму, и мы подберём маркетинговую стратегию под ваш бюджет и цели. 
							Первая консультация — бесплатно и без обязательств.
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className={styles.inputWrapp}>
							<p>Имя</p>
							<input
								type="text"
								name="name"
								placeholder="Введите ваше имя"
								value={form.name}
								onChange={handleChange}
							/>
							{errors.name && <span className={styles.error}>{errors.name}</span>}
						</div>

						<div className={styles.inputWrapp}>
							<p>Компания</p>
							<input
								type="text"
								name="secondName"
								placeholder="Введите название компании"
								value={form.secondName}
								onChange={handleChange}
							/>
							{errors.secondName && <span className={styles.error}>{errors.secondName}</span>}
						</div>

						<div className={styles.inputWrapp}>
							<p>Email</p>
							<input
								type="email"
								name="email"
								placeholder="Введите ваш email"
								value={form.email}
								onChange={handleChange}
							/>
							{errors.email && <span className={styles.error}>{errors.email}</span>}
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
							{errors.phone && <span className={styles.error}>{errors.phone}</span>}
						</div>

						<div className={`${styles.inputWrapp} ${styles.inputWrappArea}`}>
							<p>Сообщение</p>
							<textarea
								name="message"
								placeholder="Опишите вашу задачу: что вы хотите продвинуть, какой у вас бизнес и какие цели"
								style={{ resize: "none" }}
								value={form.message}
								onChange={handleChange}
							/>
							{errors.message && <span className={styles.error}>{errors.message}</span>}
						</div>

						<div className={styles.formSection__bottomWrapp}>
							<div className={styles.acceptWrapp}>
								<div
									onClick={() => {
										setAccept((prev) => !prev);
										if (errors.accept) setErrors((prev) => ({ ...prev, accept: undefined }));
									}}
									className={styles.checkbox}
								>
									{accept ? "✓" : ""}
								</div>
								<p>
									Я согласен с Условиями использования и Политикой конфиденциальности
								</p>
							</div>
							{errors.accept && <span className={styles.error}>{errors.accept}</span>}

							<button className="btn btn-purple" type="submit">
								Отправить заявку
							</button>
							{success && <span className={styles.success}>Заявка отправлена!</span>}
						</div>
					</form>
				</div>
			</section>
		</div>
	);
};

export default page;