import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getObjects } from "@/services/getInfo";
import type { INewsItem } from "@/types/park.interface";
import { formatFullDate } from "@/constants/park";
import styles from "../news.module.scss";

type Props = { params: Promise<{ slug: string }> };

const findNews = async (slug: string): Promise<INewsItem | undefined> => {
	const result = await getObjects<INewsItem>(
		"news-items",
		["cover"],
		[{ filter: "$eq", field: "slug", value: slug }]
	);

	return result.data?.[0];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const item = await findNews(slug);

	if (!item) return { title: "Новость не найдена — Парк Чудес" };

	return {
		title: `${item.title} — Парк Чудес`,
		description: item.excerpt ?? "",
	};
}

/**
 * Отдельная новость.
 *
 * Контент приходит richtext-строкой из Strapi. Значения, которые там
 * допустимы, ограничены редактором в админке, а React экранирует текст
 * при выводе — поэтому сырой HTML здесь не используется.
 */
const Page = async ({ params }: Props) => {
	const { slug } = await params;
	const item = await findNews(slug);

	if (!item) notFound();

	const paragraphs = (item.content ?? "").split("\n\n").filter(Boolean);

	return (
		<main>
			<article className={styles.article}>
				<div className="container">
					<nav className={styles.breadcrumbs}>
						<Link href="/news">Новости</Link>
						<span>/</span>
						<span>{item.title}</span>
					</nav>

					{item.eventDate && <p className={styles.articleDate}>{formatFullDate(item.eventDate)}</p>}

					<h1 className="h2">{item.title}</h1>

					{item.cover?.url && (
						<Image
							src={item.cover.url}
							alt={item.title}
							width={1200}
							height={640}
							className={styles.articleCover}
							priority
						/>
					)}

					{paragraphs.map((text, index) => (
						<p key={index} className={styles.articleText}>
							{text}
						</p>
					))}
				</div>
			</article>
		</main>
	);
};

export default Page;