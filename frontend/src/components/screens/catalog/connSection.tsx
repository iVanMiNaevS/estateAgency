"use client";
import React, {useState} from "react";
import styles from "../../../app/catalog/catalog.module.scss";

export const ConnSection = () => {
	const [activeMethod, setActiveMethod] = useState<"phone" | "email">("phone");

	return (
		<section className={styles.connSection}>
			<div className="container">
				<div className={styles.connSection__top}>
					<h2 className="h2">Давайте сделаем так, чтобы это произошло</h2>
					<p>
						Готовы сделать первый шаг к приобретению недвижимости вашей мечты? Заполните форму ниже,
						и наши мастера по недвижимости приложат все усилия, чтобы найти для вас идеальную пару.
						Не ждите, давайте отправимся в это увлекательное путешествие вместе.
					</p>
				</div>
				<form className={styles.connSection__form}>
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
					<div className={styles.inputWrapp}>
						<p>Телефон</p>
						<input type="text" placeholder="Введите номер телефона" />
					</div>
					<div className={styles.inputWrapp + " " + styles.inputWrappHalf}>
						<p>Бюджет</p>
						<input type="text" placeholder="Выберите бюджет" />
					</div>
					<div className={styles.inputWrapp + " " + styles.inputWrappHalf}>
						<p>Предпочтительный способ конттакта</p>
						<div className={styles.inputWrappInner}>
							<div
								onClick={() => {
									setActiveMethod("phone");
								}}
								className={activeMethod !== "phone" ? styles.notActive : ""}
							>
								<input type="text" className={styles.phone} placeholder="Введите свой телефон" />
							</div>
							<div
								onClick={() => {
									setActiveMethod("email");
								}}
								className={activeMethod !== "email" ? styles.notActive : ""}
							>
								<input type="text" className={styles.email} placeholder="Введите свою почту" />
							</div>
						</div>
					</div>
					<div className={styles.inputWrapp + " " + styles.inputWrappArea}>
						<p>Сообщение</p>
						<textarea style={{resize: "none"}} placeholder="Введите своё сообщение здесь" />
					</div>
					<button className="btn btn-purple">Отправьте свое сообщение</button>
				</form>
			</div>
		</section>
	);
};
