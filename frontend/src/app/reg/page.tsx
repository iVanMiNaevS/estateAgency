"use client";
import React, {useState} from "react";
import styles from "./reg.module.scss";
import Image from "next/image";
import logo from "@/../public/icons/iconLogo.svg";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";

const Page = () => {
	const [accept, setAccept] = useState(false);
	return (
		<div className={styles.container}>
			<form action="">
				<div className={styles.top}>
					<Image src={logo} alt="logo" />
					Регистрация
				</div>
				<div className={styles.inputs}>
					<div className={styles.inputWrapp + " " + styles.inputWrappHalf}>
						<p>Имя</p>
						<input type="text" placeholder="Введите имя" />
					</div>
					<div className={styles.inputWrapp + " " + styles.inputWrappHalf}>
						<p>Фамилия</p>
						<input type="text" placeholder="Введите фамилию" />
					</div>
					<div className={styles.inputWrapp}>
						<p>Email</p>
						<input className={styles.inputWithIcon} type="email" placeholder="Введите email" />
					</div>
					<div className={styles.inputWrapp}>
						<p>Телефон</p>
						<input className={styles.inputWithIcon} type="tel" placeholder="Введите телефон" />
					</div>
					<div className={styles.inputWrapp + " " + styles.inputWrappHalf}>
						<p>Пароль</p>
						<input type="password" className={styles.inputWithIcon} placeholder="Введите пароль" />
					</div>
					<div className={styles.inputWrapp + " " + styles.inputWrappHalf}>
						<p>Повтор пароля</p>
						<input type="password" className={styles.inputWithIcon} placeholder="Повтор пароля" />
					</div>
				</div>
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
				<div className={styles.bottom}>
					<button className="btn-purple btn">Зарегестрироваться</button>
					<p>
						Уже естть аккаунт?
						<span>
							<Link href={AppRouter.login}>Войти</Link>
						</span>
					</p>
				</div>
			</form>
		</div>
	);
};

export default Page;
