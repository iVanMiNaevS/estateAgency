"use client";
import React, { useState } from "react";
import styles from "../../../app/(withHeaderFooter)/catalog/catalog.module.scss";
import { makeRequest } from "@/services/getInfo";

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

export const ConnSection = ({ sectionId }: Props) => {
	const [activeMethod, setActiveMethod] = useState<"phone" | "email">("phone");

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
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const payload = {
			...form,
			activeContact:activeMethod,
		};
		const res = await makeRequest('user-requests', undefined, false, "POST", {data:payload})
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
					<h2 className="h2">Давайте сделаем так, чтобы это произошло</h2>
					<p>
						Готовы сделать первый шаг к приобретению недвижимости вашей мечты?
					</p>
				</div>

				<form className={styles.connSection__form} onSubmit={handleSubmit}>
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

					<div className={`${styles.inputWrapp} ${styles.inputWrappHalf}`}>
						<p>Бюджет</p>
						<input
							type="number"
							name="budget"
							placeholder="Выберите бюджет"
							value={form.budget}
							onChange={handleChange}
						/>
					</div>

					<div
						className={`${styles.inputWrapp} ${styles.inputWrappHalf} ${styles.mode}`}
					>
						<p>Предпочтительный способ контакта</p>

						<div className={styles.inputWrappInner}>
							<div
								onClick={() => setActiveMethod("phone")}
								className={activeMethod !== "phone" ? styles.notActive : ""}
							>
								<input
									type="tel"
									name="phone"
									className={styles.phone}
									placeholder="Введите свой телефон"
									value={form.phone ? form.phone : ''}
									onChange={handleChange}
									disabled={activeMethod !== "phone"}
								/>
							</div>

							<div
								onClick={() => setActiveMethod("email")}
								className={activeMethod !== "email" ? styles.notActive : ""}
							>
								<input
									type="email"
									name="email"
									className={styles.email}
									placeholder="Введите свою почту"
									value={form.email ? form.email : ''}
									onChange={handleChange}
									disabled={activeMethod !== "email"}
								/>
							</div>
						</div>
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

					<button className="btn btn-purple" type="submit">
						Отправьте свое сообщение
					</button>
				</form>
			</div>
		</section>
	);
};
