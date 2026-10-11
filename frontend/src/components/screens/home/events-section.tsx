import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getObjects } from "@/services/getInfo";
import type { INewsItem } from "@/types/park.interface";
import { formatFullDate } from "@/constants/park";
import styles from "./events-section.module.scss";

interface Props {
	sectionId?: string;
	title?: string | null;
	description?: string | null;
}

/** Сколько событий показываем — больше не разглядеть без прокрутки. */
const LIMIT = 3;

/** «Сегодня», «Завтра» — помогает не искать событие в календаре. */
const relativeLabel = (value: string): string | null => {
	const event = new Date(value);
	if (Number.isNaN(event.getTime())) return null;

	// Сравниваем по календарным дням: время суток на «сегодня»
	// не должно превращать вечернее событие в «завтрашнее».
	const startOfDay = (date: Date) =>
		new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

	const diffDays = Math.round(
		(startOfDay(event) - startOfDay(new Date())) / 86_400_000
	);

	if (diffDays === 0) return "Сегодня";
	if (diffDays === 1) return "Завтра";
	return null;
};

/**
 * Ближайшие события парка (ТЗ F-1.1: «ближайшие события»
 * в составе главной страницы).
 *
 * События хранятся в той же сущности, что и новости, — отдельной
 * таблицы событий в ТЗ нет. Отличие в поле eventDate: у события
 * оно обязательно и означает дату, когда событие состоится.
 *
 * Показываются только предстоящие события. Прошедшие исчезают из
 * блока сами — вручную чистить список в админке не нужно.
 *
 * Компонент серверный: дата «сегодня» считается на сервере в момент
 * запроса, поэтому у всех посетителей блок одинаковый.
 */
export const EventsSection = async ({ sectionId, title, description }: Props) => {
	const result = await getObjects<INewsItem>("news-items", ["cover"], undefined, [
		{ params: "pageSize", value: 50 },
	]);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const upcoming = (result.data ?? [])
		.filter((item) => item.eventDate && new Date(item.eventDate) >= today)
		.sort((a, b) => (a.eventDate ?? "").localeCompare(b.eventDate ?? ""))
		.slice(0, LIMIT);

	// Блок пуст, когда предстоящих событий нет: пустая секция
	// с заголовком «Ближайшие события» выглядела бы ошибкой.
	if (upcoming.length === 0) {
		return null;
	}

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				<div className={styles.head}>
					<div>
						<h2 className="h2">{title ?? "Ближайшие события"}</h2>
						{description && <p className={styles.description}>{description}</p>}
					</div>
				</div>

				<ul className={styles.list}>
					{upcoming.map((item) => {
						const soon = item.eventDate ? relativeLabel(item.eventDate) : null;

						return (
							<li key={item.id} className={styles.card}>
								<Link href={`/news/${item.slug}`}>
									{item.cover?.url && (
										<Image
											src={item.cover.url}
											alt={item.title}
											width={440}
											height={260}
											className={styles.cover}
										/>
									)}

									<div className={styles.body}>
										{soon && <span className={styles.soon}>{soon}</span>}

										<time className={styles.date} dateTime={item.eventDate ?? ""}>
											{item.eventDate && formatFullDate(item.eventDate)}
										</time>

										<h3 className={styles.title}>{item.title}</h3>
										{item.excerpt && (
											<p className={styles.excerpt}>{item.excerpt}</p>
										)}
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
};