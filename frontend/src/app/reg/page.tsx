"use client";
import React, { useState } from "react";
import styles from "./reg.module.scss";
import Image from "next/image";
import logo from "@/../public/icons/iconLogo.svg";
import Link from "next/link";
import { AppRouter } from "@/AppRouter";
import { makeRequest } from "@/services/getInfo";
import { useRouter } from "next/navigation";

type FormState = {
	name: string;
	username: string;
	email: string;
	password: string;
};

const Page = () => {
	const [accept, setAccept] = useState(false);
	const router = useRouter();
	const [form, setForm] = useState<FormState>({
		name: "",
		username: "",
		email: "",
		password: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>
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
			try{
				const res = await makeRequest('auth/local/register', undefined, false, "POST", payload)
				const data = await res.json()
				localStorage.setItem('jwt', data.jwt)
				router.push('/')
			}catch(err){
				
			}
		}
	};

	return (
		<div className={styles.container}>
			<form onSubmit={handleSubmit}>
				<div className={styles.top}>
					<Image src={logo} alt="logo" />
					Регистрация
				</div>

				<div className={styles.inputs}>
					<div className={`${styles.inputWrapp} ${styles.inputWrappHalf}`}>
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
						<p>Email</p>
						<input
							type="email"
							name="email"
							className={styles.inputWithIcon}
							placeholder="Введите email"
							value={form.email}
							onChange={handleChange}
						/>
					</div>
					<div className={styles.inputWrapp}>
						<p>Username</p>
						<input
							type="text"
							name="username"
							className={styles.inputWithIcon}
							placeholder="Введите username"
							value={form.username}
							onChange={handleChange}
						/>
					</div>

					<div className={`${styles.inputWrapp} ${styles.inputWrappHalf}`}>
						<p>Пароль</p>
						<input
							type="password"
							name="password"
							className={styles.inputWithIcon}
							placeholder="Введите пароль"
							value={form.password}
							onChange={handleChange}
						/>
					</div>
				</div>

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

				<div className={styles.bottom}>
					<button className="btn-purple btn" type="submit">
						Зарегистрироваться
					</button>
					<p>
						Уже есть аккаунт?
						<span>
							<Link href={AppRouter.login}> Войти</Link>
						</span>
					</p>
				</div>
			</form>
		</div>
	);
};

export default Page;
