"use client";

import React, { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppRouter } from "@/AppRouter";
import type { ISession, ITicketPrice } from "@/types/park.interface";
import { createBooking, type ActionState } from "@/app/actions/public";
import {
	formatSessionDate,
	formatTime,
	tariffAvailability,
	tariffTotal,
} from "@/constants/park";
import styles from "./booking-form.module.scss";

const initialState: ActionState = {};

interface Props {
	sessions: ISession[];
	/** Тарифы выбираются из списка, id уходит в server action. */
	tariffs: ITicketPrice[];
	/**
	 * Выбранный сеанс и обработчик выбора.
	 *
	 * Нужны, чтобы список сеансов и форма были одной системой: гость
	 * нажимает на время в расписании, и форма сразу его подхватывает.
	 * Если их не передавать, форма работает сама по себе.
	 */
	sessionId?: string;
	onSessionChange?: (id: string) => void;
}

/**
 * Форма бронирования (ТЗ F-1.9).
 *
 * Тариф выбирается не из выпадающего списка, а карточкой с готовой
 * суммой: гостю не нужно считать в уме, чем дешевле пойти с семьёй.
 * Недоступные тарифы показываются с причиной — молча исчезнувший
 * пункт выглядит как ошибка.
 *
 * Суммы на экране совпадают с серверными: используются те же
 * проценты и то же округление. Но доверяем всё равно только ответу
 * Strapi — клиент может подделать разметку.
 */
export const BookingForm = ({
	sessions,
	tariffs,
	sessionId: controlledSessionId,
	onSessionChange,
}: Props) => {
	const [state, formAction, isPending] = useActionState(createBooking, initialState);
	const [ownSessionId, setOwnSessionId] = useState<string>("");
	// Когда сеанс выбирают снаружи, источником правды считаем его.
	const sessionId = controlledSessionId ?? ownSessionId;

	const setSessionId = (id: string) => {
		setOwnSessionId(id);
		onSessionChange?.(id);
	};
	const [adults, setAdults] = useState(2);
	const [children, setChildren] = useState(1);
	const [tariffId, setTariffId] = useState<string>("");

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

	// Услуги и льготы не оформляются как проход на сеанс.
	const ticketTariffs = useMemo(
		() => tariffs.filter((tariff) => tariff.category === "ticket"),
		[tariffs]
	);

	// Услуги и льготы сервер не примет: у них нет правил покрытия.
	const options = useMemo(() => {
		const price = selected?.price ?? 0;

		return ticketTariffs.map((tariff) => {
			const availability = tariffAvailability(tariff, adults, children);

			return {
				tariff,
				available: availability.ok,
				reason: availability.ok ? null : availability.reason,
				total: tariffTotal(tariff, price, adults, children),
			};
		});
	}, [ticketTariffs, selected, adults, children]);


	const guests = adults + children;

	// Выбранный тариф подсвечивается, а из доступных показываем
	// самый выгодный — на нём гость скорее всего и остановится.
	const availableOptions = options.filter((option) => option.available);

	const cheapest = availableOptions.reduce<(typeof options)[number] | null>(
		(best, option) => (!best || option.total < best.total ? option : best),
		null
	);

	// Тариф со скидкой 100% и есть обычный: он же запасной вариант,
	// когда выбранный стал недоступен.
	const ordinary = availableOptions.find(
		(option) =>
			(option.tariff.adultPercent ?? 100) === 100 &&
			(option.tariff.childPercent ?? 100) === 100
	);

	// По умолчанию берём обычный тариф: он доступен при любом составе,
	// а «самый выгодный» подставлять молча нельзя — гость должен
	// видеть, за что платит.
	const fallbackId = String(ordinary?.tariff.id ?? ticketTariffs[0]?.id ?? "");

	// Состав изменился — ранее выбранный тариф мог стать недоступным.
	useEffect(() => {
		const chosen = options.find((option) => String(option.tariff.id) === tariffId);
		if (!chosen || chosen.available) return;

		setTariffId(fallbackId);
	}, [options, tariffId, fallbackId]);

	const unavailableOptions = options.filter((option) => !option.available);

	const current =
		options.find((option) => String(option.tariff.id) === (tariffId || fallbackId)) ?? null;

	const estimate = current?.available ? current.total : 0;

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

			{selected && (
				<fieldset className={styles.tariffs}>
					<legend>Тариф</legend>

					{/* Тарифы карточками с готовой суммой: гостю не нужно
					    считать, чем дешевле пойти с семьёй. */}

					{/* Показываем только подходящие тарифы. Раньше
					    недоступные выводились серыми карточками, и гость,
					    пришедший без детей, читал их как «вам нельзя».
					    Теперь о них короткая строка с условием. */}
					{availableOptions.map(({ tariff, total }) => {
						// Метка «выгодно» осмысленна только когда есть из чего выбирать.
						const isBest = availableOptions.length > 1 && cheapest?.tariff.id === tariff.id;
						// Пустой tariffId означает «выбран обычный по умолчанию».
						const checked = String(tariff.id) === (tariffId || fallbackId);

						return (
							<label
								key={tariff.id}
								className={`${styles.tariff} ${
									checked ? styles.tariffChecked : ""
								}`}
							>
								<input
									type="radio"
									name="tariffChoice"
									value={tariff.id}
									checked={checked}
									onChange={() => setTariffId(String(tariff.id))}
								/>
								<span className={styles.tariffName}>
									{tariff.title}
									{isBest && <span className={styles.tariffBest}>выгодно</span>}
								</span>
								<span className={styles.tariffHint}>{tariff.description}</span>
								<span className={styles.tariffTotal}>
									{total.toLocaleString("ru-RU")} ₽
								</span>
							</label>
						);
					})}

					{unavailableOptions.length > 0 && (
						<p className={styles.tariffNote}>
							{unavailableOptions.map(({ tariff, reason }) => (
								<span key={tariff.id}>
									«{tariff.title}» действует {reason}
								</span>
							))}
						</p>
					)}
				</fieldset>
			)}

			{!selected && (
				<p className={styles.hint}>
					Сначала выберите сеанс — тогда появятся тарифы и итоговая сумма.
				</p>
			)}

			{/* id выбранного тарифа уходит на сервер отдельным полем:
			    радиокнопки выше нужны только для показа сумм. */}
			{/* На сервер всегда уходит конкретный тариф: обычный —
			    это и есть «полная цена», отдельного режима без тарифа нет. */}
			<input type="hidden" name="tariff" value={tariffId || fallbackId} />

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
					<Link href={AppRouter.privacy}>политикой конфиденциальности</Link>
				</span>
			</label>
			{fieldError("consent") && <span className={styles.fieldError}>{fieldError("consent")}</span>}

			{estimate > 0 && (
				<p className={styles.total}>
					К оплате: <strong>{estimate.toLocaleString("ru-RU")} ₽</strong>
				</p>
			)}

			<button type="submit" className="btn btn-purple" disabled={isPending}>
				{isPending ? "Бронируем…" : "Забронировать"}
			</button>
		</form>
	);
};