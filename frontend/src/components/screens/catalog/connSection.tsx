"use client";
import React, { useState } from "react";
import styles from "../../../app/(withHeaderFooter)/catalog/catalog.module.scss";


type Props = {
	sectionId: string;
};

type FormState = {
	name: string;
	secondName: string;
	budget: string;
	phone: string | null;
	email: string | null;
	message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export const ConnSection = ({ sectionId }: Props) => {
	const [activeMethod, setActiveMethod] = useState<"phone" | "email">("phone");
	const [errors, setErrors] = useState<FormErrors>({});
	const [success, setSuccess] = useState(false);

	const [form, setForm] = useState<FormState>({
		name: "",
		secondName: "",
		budget: "",
		phone: null,
		email: null,
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
		if (!form.budget.trim()) newErrors.budget = "Бюджет обязателен";
		if (activeMethod === "phone" && !form.phone?.trim()) newErrors.phone = "Телефон обязателен";
		if (activeMethod === "email" && !form.email?.trim()) newErrors.email = "Email обязателен";
		if (activeMethod === "email" && form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Неверный формат email";
		if (!form.message.trim()) newErrors.message = "Сообщение обязательно";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const payload = {
			...form,
			activeContact:activeMethod,
		};
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-requests`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({data:payload})
		})
		setErrors({});
		setSuccess(true);
		setTimeout(() => setSuccess(false), 4000);
		setForm({
			name: "",
			secondName: "",
			budget: "",
			phone: null,
			email: null,
			message: "",
		})
	};

	return (
		<section className={styles.connSection} id={sectionId}>
			<div className="container">
				<div className={styles.connSection__top}>
					<h2 className="h2">Давайте обсудим ваш проект</h2>
					<p>
						Заполните форму, и мы бесплатно проконсультируем вас по всем вопросам маркетинга.
						Подберём стратегию, рассчитаем бюджет и расскажем, как увеличить продажи.
					</p>
				</div>

				<form className={styles.connSection__form} onSubmit={handleSubmit}>
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
						<p>Название компании</p>
						<input
							type="text"
							name="secondName"
							placeholder="Введите название компании"
							value={form.secondName}
							onChange={handleChange}
						/>
						{errors.secondName && <span className={styles.error}>{errors.secondName}</span>}
					</div>

					<div className={`${styles.inputWrapp} ${styles.inputWrappHalf}`}>
						<p>Бюджет на маркетинг (₽)</p>
						<input
							type="number"
							name="budget"
							placeholder="Укажите примерный бюджет"
							value={form.budget}
							onChange={handleChange}
						/>
						{errors.budget && <span className={styles.error}>{errors.budget}</span>}
					</div>

					<div
						className={`${styles.inputWrapp} ${styles.inputWrappHalf} ${styles.mode}`}
					>
						<p>Предпочтительный способ связи</p>

						<div className={styles.inputWrappInner}>
							<div
								onClick={() => {
									setActiveMethod("phone");
									if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
								}}
								className={activeMethod !== "phone" ? styles.notActive : ""}
							>
								<input
									type="tel"
									name="phone"
									className={styles.phone}
									placeholder="Введите номер телефона"
									value={form.phone ? form.phone : ''}
									onChange={handleChange}
									disabled={activeMethod !== "phone"}
								/>
							</div>

							<div
								onClick={() => {
									setActiveMethod("email");
									if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
								}}
								className={activeMethod !== "email" ? styles.notActive : ""}
							>
								<input
									type="email"
									name="email"
									className={styles.email}
									placeholder="Введите адрес почты"
									value={form.email ? form.email : ''}
									onChange={handleChange}
									disabled={activeMethod !== "email"}
								/>
							</div>
						</div>
						{errors.phone && <span className={styles.error}>{errors.phone}</span>}
						{errors.email && <span className={styles.error}>{errors.email}</span>}
					</div>

					<div className={`${styles.inputWrapp} ${styles.inputWrappArea}`}>
						<p>Сообщение</p>
						<textarea
							name="message"
							placeholder="Опишите вашу задачу: что нужно продвинуть, какой бюджет и какие цели"
							style={{ resize: "none" }}
							value={form.message}
							onChange={handleChange}
						/>
						{errors.message && <span className={styles.error}>{errors.message}</span>}
					</div>

					<button className="btn btn-purple" type="submit">
						Отправить заявку
					</button>
					{success && <span className={styles.success}>Заявка отправлена!</span>}
				</form>
			</div>
		</section>
	);
};
