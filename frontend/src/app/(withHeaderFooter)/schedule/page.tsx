import type { Metadata } from "next";
import Link from "next/link";
import { getObjects } from "@/services/getInfo";
import type { IAttraction, ISession } from "@/types/park.interface";
import { BookingForm } from "@/components/forms/booking-form";
import { SiteSearch } from "@/components/forms/site-search";
import {
	ATTRACTION_TYPE_LABELS,
	SESSION_STATUS_LABELS,
	formatSessionDate,
	formatTime,
} from "@/constants/park";
import styles from "./schedule.module.scss";

export const metadata: Metadata = {
	title: "Расписание и запись — Парк Чудес",
	description:
		"Расписание сеансов аттракционов и онлайн-запись. Видно свободные места, бронирование занимает время без очередей.",
};

/**
 * Расписание сеансов и форма записи (ТЗ F-1.5, F-1.9).
 *
 * Список сеансов приходит серверным компонентом, число свободных мест
 * считает Strapi, а не клиент. Форма отправляется через server action,
 * где проверяется авторизация и состав гостей.
 */
const Page = async ({
	searchParams,
}: {
	searchParams: Promise<{ date?: string; attraction?: string }>;
}) => {
	const params = await searchParams;

	// По умолчанию показываем ближайшие даты, начиная с сегодняшней.
	const today = new Date().toISOString().slice(0, 10);
	const dateFilter = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : undefined;

	const result = await getObjects<ISession>(
		"sessions",
		["attraction"],
		[
			...(dateFilter ? [{ filter: "$eq" as const, field: "date", value: dateFilter }] : []),
		],
		[{ params: "pageSize" as const, value: 100 }]
	);

	const sessions = result.data ?? [];

	const attractions = await getObjects<IAttraction>("attractions", ["poster"], [
		{ filter: "$eq", field: "isActive", value: "true" },
	]);
	const attractionList = attractions.data ?? [];

	const dates = [
		...new Set(sessions.map((session) => session.date)),
	].sort().slice(0, 10);

	// Группируем сеансы по дате — так расписание читается легче.
	const byDate = sessions.reduce<Record<string, ISession[]>>((acc, session) => {
		(acc[session.date] ??= []).push(session);
		return acc;
	}, {});

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">Расписание и запись</h1>
					<p className={styles.lead}>
						Выберите дату и аттракцион, затем укажите количество взрослых и детей.
						Число свободных мест обновляется сразу после бронирования.
					</p>
				</div>
			</section>

			<section className={styles.scheduleSection}>
				<div className="container">
					<nav className={styles.dates} aria-label="Выбор даты">
						<Link
							href="/schedule"
							className={!dateFilter ? styles.dateActive : styles.date}
						>
							Все даты
						</Link>
						{dates.map((date) => (
							<Link
								key={date}
								href={`/schedule?date=${date}`}
								className={dateFilter === date ? styles.dateActive : styles.date}
							>
								{formatSessionDate(date)}
							</Link>
						))}
					</nav>

					{sessions.length === 0 ? (
						<p className={styles.empty}>
							На выбранную дату сеансов нет. Выберите другую или посмотрите все даты.
						</p>
					) : (
						Object.entries(byDate).map(([date, items]) => (
							<div key={date} className={styles.group}>
								<h2 className="h4">{formatSessionDate(date)}</h2>

								<ul className={styles.list}>
									{items.map((session) => {
										const isFull =
											session.status === "full" || session.freeSeats <= 0;
										const isCancelled = session.status === "cancelled";

										return (
											<li key={session.id} className={styles.item}>
												<div className={styles.itemMain}>
													<span className={styles.time}>
														{formatTime(session.startTime)}
													</span>
													<div>
														<p className={styles.itemTitle}>
															{session.attraction?.title ?? "Аттракцион"}
														</p>
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
												</div>
											</li>
										);
									})}
								</ul>
							</div>
						))
					)}
				</div>
			</section>

			<section className={styles.bookingSection}>
				<div className={styles.bookingGrid}>
					<div>
						<h2 className="h2">Записаться на сеанс</h2>
						<p className={styles.lead}>
							Бронирование бесплатно и оплачивается на месте в кассе парка.
							Отменить запись можно в личном кабинете.
						</p>
					</div>

					<BookingForm sessions={sessions} attractions={attractionList} />
				</div>
			</section>

			<section>
				<div className="container">
					<h2 className="h2">Не нашли нужное?</h2>
					<SiteSearch />
				</div>
			</section>
		</main>
	);
};

export default Page;