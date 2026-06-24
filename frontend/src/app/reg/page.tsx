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

type FormErrors = Partial<Record<keyof FormState | "accept", string>>;

const Page = () => {
	const [accept, setAccept] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});
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
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const validate = (): boolean => {
		const newErrors: FormErrors = {};
		if (!form.name.trim()) {
			newErrors.name = "Имя обязательно";
		}
		if (!form.username.trim()) {
			newErrors.username = "Username обязателен";
		} else if (form.username.trim().length < 3) {
			newErrors.username = "Username минимум 3 символа";
		}
		if (!form.email.trim()) {
			newErrors.email = "Email обязателен";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			newErrors.email = "Неверный формат email";
		}
		if (!form.password) {
			newErrors.password = "Пароль обязателен";
		} else if (form.password.length < 6) {
			newErrors.password = "Пароль должен быть минимум 6 символов";
		}
		if (!accept) {
			newErrors.accept = "Примите условия использования";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const payload = {
			...form,
		};
		try{
			const res = await makeRequest('auth/local/register', undefined, "POST", payload)
			const data = await res.json()
			localStorage.setItem('jwt', data.jwt)
			router.push('/')
		}catch(err){
			
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
						{errors.name && <span className={styles.error}>{errors.name}</span>}
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
						{errors.email && <span className={styles.error}>{errors.email}</span>}
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
						{errors.username && <span className={styles.error}>{errors.username}</span>}
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
						{errors.password && <span className={styles.error}>{errors.password}</span>}
					</div>
				</div>

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
