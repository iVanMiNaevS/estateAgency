"use client";

import React, { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import type { IAttraction, ISession } from "@/types/park.interface";
import { createBooking, type ActionState } from "@/app/actions/public";
import { formatSessionDate, formatTime } from "@/constants/park";
import styles from "./booking-form.module.scss";

const initialState: ActionState = {};

interface Props {
	sessions: ISession[];
	attractions: IAttraction[];
}

/**
 * Форма бронирования (ТЗ F-1.9).
 *
 * Стоимость на экране считается как ориентир, окончательную считает
 * сервер: клиент может подделать разметку, поэтому доверяем только
 * ответу Strapi. Форма отправляется через server action, где проверяется
 * авторизация и количество гостей.
 */
export const BookingForm = ({ sessions, attractions }: Props) => {
	const [state, formAction, isPending] = useActionState(createBooking, initialState);
	const [sessionId, setSessionId] = useState<string>("");
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(1);

	// В форму попадают только открытые сеансы: закрытые нельзя выбрать.
	const available = useMemo(
		() =>
			sessions
				.filter((session) => session.status !== "cancelled" && session.freeSeats > 0)
				.sort((a, b) =>
					`${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
				),
		[sessions]
	);

	const selected = available.find((session) => String(session.id) === sessionId);

	// Ориентировочная сумма по цене места: тариф может разделить
	// взрослых и детей, тогда итог посчитает сервер.
	const estimate = selected ? (adults + children) * selected.price : 0;

	const attractionBySlug = new Map(attractions.map((item) => [item.slug, item]));

	const fieldError = (field: string) => state.fieldErrors?.[field];

	if (state.ok) {
		return (
			<div className={styles.done}>
				<h3 className="h4">Запись создана</h3>
				<p>Бронь в статусе «новая». Оплата в кассе парка.</p>
				<Link href="/account" className="btn btn-purple">
					Открыть личный кабинет
				</Link>
			</div>
		);
	}

	return (
		<form action={formAction} className={styles.form}>
			{state.error && Object.keys(state.fieldErrors ?? {}).length === 0 && (
				<p role="alert" className={styles.error}>
					{state.error}
				</p>
			)}

			<div className={styles.field}>
				<label htmlFor="booking-session">Сеанс</label>
				<select
					id="booking-session"
					name="session"
					value={sessionId}
					onChange={(event) => setSessionId(event.target.value)}
					required
				>
					<option value="">Выберите время</option>
					{available.map((session) => (
						<option key={session.id} value={session.id}>
							{formatSessionDate(session.date)}, {formatTime(session.startTime)} —{" "}
							{session.attraction?.title ?? "Аттракцион"} (мест: {session.freeSeats})
						</option>
					))}
				</select>
				{fieldError("session") && (
					<span className={styles.fieldError}>{fieldError("session")}</span>
				)}
			</div>

			<div className={styles.row}>
				<div className={styles.field}>
					<label htmlFor="booking-adults">Взрослых</label>
					<input
						id="booking-adults"
						name="adultsCount"
						type="number"
						min={0}
						max={selected?.freeSeats ?? 20}
						value={adults}
						onChange={(event) => setAdults(Number(event.target.value))}
					/>
					{fieldError("adultsCount") && (
						<span className={styles.fieldError}>{fieldError("adultsCount")}</span>
					)}
				</div>

				<div className={styles.field}>
					<label htmlFor="booking-children">Детей</label>
					<input
						id="booking-children"
						name="childrenCount"
						type="number"
						min={0}
						max={selected?.freeSeats ?? 20}
						value={children}
						onChange={(event) => setChildren(Number(event.target.value))}
					/>
					{fieldError("childrenCount") && (
						<span className={styles.fieldError}>{fieldError("childrenCount")}</span>
					)}
				</div>
			</div>

			{selected && (
				<p className={styles.hint}>
					Осталось мест: {selected.freeSeats}. Гостей выбрано: {adults + children}.
					{adults + children > selected.freeSeats && (
						<span className={styles.warn}> Больше, чем есть свободных мест.</span>
					)}
				</p>
			)}

			<div className={styles.field}>
				<label htmlFor="booking-tariff">Тариф</label>
				<select id="booking-tariff" name="tariff" defaultValue="">
					<option value="">Без тарифа — цена места</option>
					{attractions.map((attraction) => (
						<option key={attraction.slug} value="">
							{attractionBySlug.get(attraction.slug)?.title ?? attraction.title}
						</option>
					))}
				</select>
			</div>

			<div className={styles.field}>
				<label htmlFor="booking-wishes">Пожелания</label>
				<textarea
					id="booking-wishes"
					name="wishes"
					rows={3}
					placeholder="Например: едем с двумя детьми, нужна помощь с шкафчиком"
				/>
			</div>

			<label className={styles.consent}>
				<input type="checkbox" name="consent" value="yes" required />
				<span>
					Я согласен на обработку персональных данных в соответствии с{" "}
					<Link href="/privacy">политикой конфиденциальности</Link>
				</span>
			</label>
			{fieldError("consent") && <span className={styles.fieldError}>{fieldError("consent")}</span>}

			{estimate > 0 && (
				<p className={styles.total}>
					Ориентировочно: {estimate.toLocaleString("ru-RU")} ₽
				</p>
			)}

			<button type="submit" className="btn btn-purple" disabled={isPending}>
				{isPending ? "Бронируем…" : "Забронировать"}
			</button>
		</form>
	);
};