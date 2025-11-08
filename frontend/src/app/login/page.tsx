"use client";
import React, {useState} from "react";
import styles from "./login.module.scss";
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
					Вход в аккаунт
				</div>
				<div className={styles.inputs}>
					<div className={styles.inputWrapp}>
						<p>Email</p>
						<input className={styles.inputWithIcon} type="email" placeholder="Введите email" />
					</div>

					<div className={styles.inputWrapp}>
						<p>Пароль</p>
						<input type="password" className={styles.inputWithIcon} placeholder="Введите пароль" />
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
					<button className="btn-purple btn">Войти</button>
					<p>
						Нет аккаунтта
						<span>
							<Link href={AppRouter.signIn}>Зарегестрироваться</Link>
						</span>
					</p>
				</div>
			</form>
		</div>
	);
};

export default Page;
