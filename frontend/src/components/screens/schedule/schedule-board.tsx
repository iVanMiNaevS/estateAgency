"use client";

import React, { useMemo, useState } from "react";
import { BookingForm } from "@/components/forms/booking-form";
import type { ISession, ITicketPrice } from "@/types/park.interface";
import {
	ATTRACTION_TYPE_LABELS,
	SESSION_STATUS_LABELS,
	formatSessionDate,
	formatTime,
} from "@/constants/park";
import styles from "@/app/(withHeaderFooter)/schedule/schedule.module.scss";

/** Сколько сеансов показывать в дате до нажатия «показать ещё». */
const PAGE_SIZE = 5;

interface Props {
	sessions: ISession[];
	tariffs: ITicketPrice[];
	/** Название аттракциона, если расписание отфильтровано. */
	attractionTitle?: string | null;
}

/**
 * Расписание и форма записи как одно целое (ТЗ F-1.5, F-1.9).
 *
 * Список сеансов и форма делят выбранный сеанс: нажали на время
 * в расписании — форма сразу его подхватывает. Раньше это были
 * две независимые части страницы, и выбранное в расписании никуда
 * не попадало: гостю приходилось искать то же время ещё раз в
 * выпадающем списке формы.
 *
 * Списки длинные — сотни сеансов, — поэтому за день показывается
 * первые пять, остальные раскрываются по кнопке. Браузер получает
 * весь список сразу, но прокручивать вручную ничего не нужно.
 */
export const ScheduleBoard = ({ sessions, tariffs, attractionTitle }: Props) => {
	const [sessionId, setSessionId] = useState("");
	const [visible, setVisible] = useState<Record<string, number>>({});

	const byDate = useMemo(() => {
		const grouped: Record<string, ISession[]> = {};

		for (const session of sessions) {
			(grouped[session.date] ??= []).push(session);
		}

		for (const items of Object.values(grouped)) {
			items.sort((a, b) => a.startTime.localeCompare(b.startTime));
		}

		return grouped;
	}, [sessions]);

	const dates = Object.keys(byDate).sort();
	const chosen = sessions.find((session) => String(session.id) === sessionId);

	return (
		<>
			{chosen && (
				<p className={styles.chosen}>
					Выбран сеанс: <strong>{chosen.attraction?.title ?? "Аттракцион"}</strong>,{" "}
					{formatSessionDate(chosen.date)} в {formatTime(chosen.startTime)}
				</p>
			)}

			<BookingForm
				sessions={sessions}
				tariffs={tariffs}
				sessionId={sessionId}
				onSessionChange={setSessionId}
			/>

			{/* Название аттракциона уже стоит в заголовке страницы,
			    поэтому здесь его не повторяем. */}
			{!attractionTitle && <h2 className="h2">Расписание сеансов</h2>}

			{dates.length === 0 ? (
				<p className={styles.empty}>Сеансов нет. Выберите другую дату или аттракцион.</p>
			) : (
				dates.map((date) => {
					const items = byDate[date];
					const shown = visible[date] ?? PAGE_SIZE;
					const rest = items.length - shown;

					return (
						<div key={date} className={styles.group}>
							<h3 className="h4">{formatSessionDate(date)}</h3>

							<ul className={styles.list}>
								{items.slice(0, shown).map((session) => {
									const isFull =
										session.sessionStatus === "full" || session.freeSeats <= 0;
									const isCancelled = session.sessionStatus === "cancelled";
									const isChosen = String(session.id) === sessionId;

									return (
										<li
											key={session.id}
											className={`${styles.item} ${
												isChosen ? styles.itemChosen : ""
											}`}
										>
											<div className={styles.itemMain}>
												<span className={styles.time}>
													{formatTime(session.startTime)}
												</span>
												<div>
													{/* Когда расписание отфильтровано, название
													    аттракциона в каждой строке лишнее. */}
													{!attractionTitle && (
														<p className={styles.itemTitle}>
															{session.attraction?.title ?? "Аттракцион"}
														</p>
													)}
													<p className={styles.itemMeta}>
														{session.attraction?.type
															? ATTRACTION_TYPE_LABELS[session.attraction.type]
															: ""}
														{session.attraction?.heightMinCm
															? ` · рост от ${session.attraction.heightMinCm} см`
															: ""}
													</p>
												</div>
											</div>

											<div className={styles.itemSide}>
												<span className={styles.price}>
													{session.price.toLocaleString("ru-RU")} ₽
												</span>

												{isCancelled ? (
													<span className={styles.cancelled}>
														{SESSION_STATUS_LABELS.cancelled}
													</span>
												) : isFull ? (
													<span className={styles.full}>
														{SESSION_STATUS_LABELS.full}
													</span>
												) : (
													<span className={styles.free}>
														осталось {session.freeSeats} из {session.capacity}
													</span>
												)}

												{!isCancelled && !isFull && (
													<button
														type="button"
														className={styles.pick}
														onClick={() => setSessionId(String(session.id))}
													>
														{isChosen ? "Выбрано" : "Выбрать"}
													</button>
												)}
											</div>
										</li>
									);
								})}
							</ul>

							{rest > 0 && (
								<button
									type="button"
									className={styles.more}
									onClick={() =>
										setVisible((prev) => ({ ...prev, [date]: shown + PAGE_SIZE }))
									}
								>
									Показать ещё {Math.min(PAGE_SIZE, rest)}
									{rest > PAGE_SIZE && ` (осталось ${rest})`}
								</button>
							)}
						</div>
					);
				})
			)}
		</>
	);
};