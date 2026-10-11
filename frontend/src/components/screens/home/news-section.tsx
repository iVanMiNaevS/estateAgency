import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getObjects } from "@/services/getInfo";
import type { INewsItem } from "@/types/park.interface";
import { UiSwiper } from "@/ui/uiSwiper/uiSwiper";
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
 * а показ карточек поручен слайдеру — как в блоке отзывов.
 */
export const NewsSection = async ({ sectionId, title }: Props) => {
	const result = await getObjects<INewsItem>(
		"news-items",
		["cover"],
		undefined,
		[{ params: "pageSize", value: 6 }]
	);

	const news = [...(result.data ?? [])].sort((a, b) => {
		if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
		return (b.eventDate ?? "").localeCompare(a.eventDate ?? "");
	});

	if (news.length === 0) {
		return null;
	}

	const slides = news.map((item) => (
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
					<div className={styles.meta}>
						{item.isPinned && <span className={styles.pinned}>Важное</span>}
						{item.eventDate && (
							<span className={styles.date}>{formatFullDate(item.eventDate)}</span>
						)}
					</div>

					<h3 className={styles.title}>{item.title}</h3>
					{item.excerpt && <p className={styles.excerpt}>{item.excerpt}</p>}
				</div>
			</Link>
		</article>
	));

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				<div className={styles.head}>
					<h2 className="h2">{title ?? "Новости парка"}</h2>
					<Link href="/news" className="buttonLink">
						Все новости
					</Link>
				</div>

				<UiSwiper
					slides={slides}
					slidesPerView={3}
					spaceBetween={24}
					navigation={news.length > 3}
					showCount={news.length > 3}
					loop={news.length > 4}
					autoplay={{ delay: 6000 }}
				/>
			</div>
		</section>
	);
};