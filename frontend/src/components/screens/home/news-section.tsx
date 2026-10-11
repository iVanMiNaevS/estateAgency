import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getObjects } from "@/services/getInfo";
import type { INewsItem } from "@/types/park.interface";
import { formatFullDate } from "@/constants/park";
import styles from "./news-section.module.scss";

interface Props {
	sectionId?: string;
	title?: string | null;
}

/**
 * Блок последних новостей на главной (ТЗ F-1.1).
 *
 * Серверный компонент: новости приходят из Strapi напрямую,
 * браузер в бэкенд не обращается.
 */
export const NewsSection = async ({ sectionId, title }: Props) => {
	const result = await getObjects<INewsItem>(
		"news-items",
		["cover"],
		undefined,
		[{ params: "pageSize", value: 3 }]
	);

	const news = result.data ?? [];

	if (news.length === 0) {
		return null;
	}

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				<div className={styles.head}>
					<h2 className="h2">{title ?? "Новости парка"}</h2>
					<Link href="/news" className="buttonLink">
						Все новости
					</Link>
				</div>

				<div className={styles.grid}>
					{news.map((item) => (
						<article key={item.id} className={styles.card}>
							<Link href={`/news/${item.slug}`}>
								{item.cover?.url && (
									<Image
										src={item.cover.url}
										alt={item.title}
										width={560}
										height={300}
										className={styles.cover}
									/>
								)}

								<div className={styles.body}>
									{item.eventDate && (
										<span className={styles.date}>{formatFullDate(item.eventDate)}</span>
									)}
									<h3 className={styles.title}>{item.title}</h3>
									{item.excerpt && <p className={styles.excerpt}>{item.excerpt}</p>}
								</div>
							</Link>
						</article>
					))}
				</div>
			</div>
		</section>
	);
};