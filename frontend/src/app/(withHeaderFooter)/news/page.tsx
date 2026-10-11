import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getObjects } from "@/services/getInfo";
import type { INewsItem } from "@/types/park.interface";
import { formatFullDate } from "@/constants/park";
import styles from "./news.module.scss";

export const metadata: Metadata = {
	title: "Новости — Парк Чудес",
	description: "Новости парка развлечений: открытие аттракционов, акции и анонсы событий.",
};

/** Список новостей (ТЗ п.4.2.2). */
const Page = async () => {
	const result = await getObjects<INewsItem>(
		"news-items",
		["cover"],
		undefined,
		[{ params: "pageSize", value: 50 }]
	);

	// Закреплённая новость показывается первой, остальные — по дате.
	const news = [...(result.data ?? [])].sort((a, b) => {
		if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
		return (b.eventDate ?? "").localeCompare(a.eventDate ?? "");
	});

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">Новости парка</h1>
					<p className={styles.lead}>
						Анонсы событий, открытия и сезонные акции.
					</p>
				</div>
			</section>

			<section>
				<div className="container">
					{news.length === 0 ? (
						<p className={styles.empty}>Новостей пока нет.</p>
					) : (
						<div className={styles.grid}>
							{news.map((item) => (
								<article key={item.id} className={styles.card}>
									<Link href={`/news/${item.slug}`}>
										{item.cover?.url && (
											<Image
												src={item.cover.url}
												alt={item.title}
												width={560}
												height={320}
												className={styles.cover}
											/>
										)}

										<div className={styles.body}>
											<div className={styles.meta}>
												{item.isPinned && (
													<span className={styles.pinned}>Важное</span>
												)}
												{item.eventDate && (
													<span className={styles.date}>
														{formatFullDate(item.eventDate)}
													</span>
												)}
											</div>

											<h2 className={styles.title}>{item.title}</h2>

											{item.excerpt && (
												<p className={styles.excerpt}>{item.excerpt}</p>
											)}
										</div>
									</Link>
								</article>
							))}
						</div>
					)}
				</div>
			</section>
		</main>
	);
};

export default Page;