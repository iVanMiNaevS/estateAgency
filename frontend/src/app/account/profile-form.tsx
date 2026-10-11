"use client";

import React, { useActionState } from "react";
import styles from "./profile-form.module.scss";
import { updateProfileAction, type FormState } from "@/app/actions/auth";

const initialState: FormState = {};

/**
 * Редактирование профиля (ТЗ п.4.2.3).
 *
 * Поля отправляются в server action, который обращается к Strapi
 * от имени текущего пользователя. Роль в запрос не входит: смена роли
 * доступна только администратору, а набор полей задан белым списком
 * в api::profile на бэкенде.
 */
export const ProfileForm = ({
	user,
}: {
	user: {
		name: string | null;
		lastName: string | null;
		phone: string | null;
		city: string | null;
		birthDate: string | null;
		email: string;
	};
}) => {
	const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

	return (
		<form action={formAction} className={styles.form}>
			{state.error && (
				<p role="alert" className={styles.error}>
					{state.error}
				</p>
			)}

			<div className={styles.row}>
				<div className={styles.field}>
					<label htmlFor="profile-name">Имя</label>
					<input id="profile-name" name="name" defaultValue={user.name ?? ""} />
				</div>

				<div className={styles.field}>
					<label htmlFor="profile-lastName">Фамилия</label>
					<input
						id="profile-lastName"
						name="lastName"
						defaultValue={user.lastName ?? ""}
					/>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.field}>
					<label htmlFor="profile-phone">Телефон</label>
					<input
						id="profile-phone"
						name="phone"
						type="tel"
						placeholder="+7 (900) 000-00-00"
						defaultValue={user.phone ?? ""}
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor="profile-city">Город</label>
					<input id="profile-city" name="city" defaultValue={user.city ?? ""} />
				</div>
			</div>

			<div className={styles.field}>
				<label htmlFor="profile-birthDate">Дата рождения</label>
				<input
					id="profile-birthDate"
					name="birthDate"
					type="date"
					defaultValue={user.birthDate ?? ""}
				/>
				<span className={styles.hint}>
					Нужна для проверки возрастных ограничений на аттракционах.
				</span>
			</div>

			<div className={styles.field}>
				<label htmlFor="profile-email">E-mail</label>
				<input id="profile-email" value={user.email} disabled readOnly />
				<span className={styles.hint}>Логин и адрес для связи изменить нельзя.</span>
			</div>

			<button type="submit" className="btn btn-purple" disabled={isPending}>
				{isPending ? "Сохраняем…" : "Сохранить изменения"}
			</button>
		</form>
	);
};