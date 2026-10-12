import type { Metadata } from "next";
import Link from "next/link";
import { getObjects } from "@/services/getInfo";
import type { IAttraction, ISession, ITicketPrice } from "@/types/park.interface";
import { ScheduleBoard } from "@/components/screens/schedule/schedule-board";
import { SiteSearch } from "@/components/forms/site-search";
import { ATTRACTION_TYPE_LABELS, formatSessionDate } from "@/constants/park";
import styles from "./schedule.module.scss";

export const metadata: Metadata = {
	title: "Расписание и запись — Парк Чудес",
	description:
		"Расписание сеансов аттракционов и онлайн-запись. Видно свободные места, бронирование занимает время без очередей.",
};

/**
 * Расписание сеансов и форма записи (ТЗ F-1.5, F-1.9).
 *
 * Расписание умеет фильтроваться по аттракциону: со страницы
 * аттракциона гость попадает сразу на его сеансы, а не в общий
 * список, где нужное пришлось бы искать среди сотни строк.
 *
 * Список сеансов и форма записи показывает клиентский компонент:
 * нажатие на время в расписании выбирает этот сеанс в форме.
 * Данные приходят с сервера, число свободных мест считает Strapi.
 */
const Page = async ({
	searchParams,
}: {
	searchParams: Promise<{ date?: string; attraction?: string }>;
}) => {
	const params = await searchParams;

	// По умолчанию показываем ближайшие даты, начиная с сегодняшней.
	const dateFilter =
		params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : undefined;

	// Фильтр по аттракциону приходит с его страницы и из карточки.
	// Неизвестный слаг игнорируем, чтобы не показать пустую страницу.
	const attractions = await getObjects<IAttraction>(
		"attractions",
		[],
		[{ filter: "$eq", field: "isActive", value: "true" }],
	);
	const attractionList = attractions.data ?? [];

	const attraction = attractionList.find((item) => item.slug === params.attraction);

	const result = await getObjects<ISession>(
		"sessions",
		["attraction"],
		[...(dateFilter ? [{ filter: "$eq" as const, field: "date", value: dateFilter }] : [])],
		[{ params: "pageSize" as const, value: 200 }],
	);

	// Фильтруем по аттракциону сами: связь в сеансе приходит числом,
	// а полем в запросе Strapi не фильтрует по чужой связи так же
	// надёжно, как это делает проверка по уже загруженным данным.
	const sessions = (result.data ?? []).filter(
		(session) => !attraction || session.attraction?.id === attraction.id,
	);

	// Тарифы нужны форме бронирования, картинки здесь не выводятся.
	const tariffs = await getObjects<ITicketPrice>("ticket-prices");
	const tariffList = (tariffs.data ?? []).filter((tariff) => tariff.category === "ticket");

	const dates = [...new Set(sessions.map((session) => session.date))].sort().slice(0, 10);

	const buildQuery = (patch: Record<string, string | undefined>) => {
		const query = new URLSearchParams();

		if (dateFilter) query.set("date", dateFilter);
		if (attraction?.slug) query.set("attraction", attraction.slug);

		for (const [key, value] of Object.entries(patch)) {
			if (value) query.set(key, value);
			else query.delete(key);
		}

		const search = query.toString();
		return search ? `/schedule?${search}` : "/schedule";
	};

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">
						{attraction ? `Расписание: ${attraction.title}` : "Расписание и запись"}
					</h1>
					<p className={styles.lead}>
						Выберите сеанс, укажите количество взрослых и детей. Число свободных мест обновляется
						сразу после бронирования.
					</p>
				</div>
			</section>

			<section className={styles.scheduleSection}>
				<div className="container">
					{/* Фильтр по аттракциону: выбор делается на сервере ссылкой,
					    поэтому работает без JavaScript и шарится ссылкой. */}
					<nav className={styles.filters} aria-label="Фильтр по аттракциону">
						<Link
							href={buildQuery({ attraction: undefined })}
							className={attraction ? styles.filterChip : styles.filterChipActive}
						>
							Все аттракционы
						</Link>
						{attractionList.map((item) => (
							<Link
								key={item.id}
								href={buildQuery({ attraction: item.slug })}
								className={attraction?.id === item.id ? styles.filterChipActive : styles.filterChip}
							>
								{item.title}
								<span className={styles.filterType}>
									{ATTRACTION_TYPE_LABELS[item.type] ?? item.type}
								</span>
							</Link>
						))}
					</nav>

					<nav className={styles.dates} aria-label="Выбор даты">
						<Link
							href={buildQuery({ date: undefined })}
							className={!dateFilter ? styles.dateActive : styles.date}
						>
							Все даты
						</Link>
						{dates.map((date) => (
							<Link
								key={date}
								href={buildQuery({ date })}
								className={dateFilter === date ? styles.dateActive : styles.date}
							>
								{formatSessionDate(date)}
							</Link>
						))}
					</nav>

					{attraction && (
						<Link href={`/attractions/${attraction.slug}`} className={styles.backToAttraction}>
							← О аттракционе
						</Link>
					)}

					<ScheduleBoard
						sessions={sessions}
						tariffs={tariffList}
						attractionTitle={attraction?.title ?? null}
					/>
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
