import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getObjects } from "@/services/getInfo";
import type { IPage } from "@/types/park.interface";
import styles from "./page.module.scss";

type Props = { params: Promise<{ slug: string }> };

/** Загружает текстовую страницу по слагу. */
const findPage = async (slug: string): Promise<IPage | undefined> => {
	const result = await getObjects<IPage>(
		"pages",
		["heroImage", "blocks.items"],
		[{ filter: "$eq", field: "slug", value: slug }]
	);

	return result.data?.[0];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const page = await findPage(slug);

	if (!page) return { title: "Страница не найдена — Парк Чудес" };

	return { title: `${page.title} — Парк Чудес`, description: page.subtitle ?? "" };
}

/**
 * Универсальная страница контента из Strapi.
 *
 * На неё опираются «О парке», «Правила посещения» и «Политика
 * конфиденциальности»: текст хранится в админке, поэтому страницу
 * не нужно править в коде.
 */
const Page = async ({ params }: Props) => {
	const { slug } = await params;
	const page = await findPage(slug);

	if (!page) notFound();

	const paragraphs = (page.content ?? "").split("\n\n").filter(Boolean);

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">{page.title}</h1>
					{page.subtitle && <p className={styles.lead}>{page.subtitle}</p>}

					{page.heroImage?.url && (
						<Image
							src={page.heroImage.url}
							alt={page.title}
							width={1200}
							height={520}
							className={styles.heroImage}
							priority
						/>
					)}
				</div>
			</section>

			{paragraphs.length > 0 && (
				<section>
					<div className="container">
						{paragraphs.map((text, index) => (
							<p key={index} className={styles.text}>
								{text}
							</p>
						))}
					</div>
				</section>
			)}

			{page.blocks?.map((block) => (
				<section key={block.id} className={styles.block}>
					<div className="container">
						{block.title && <h2 className="h2">{block.title}</h2>}

						{block.text && <p className={styles.text}>{block.text}</p>}

						{(block.items?.length ?? 0) > 0 && (
							<ol className={styles.items}>
								{block.items?.map((item) => (
									<li key={item.id} className={styles.item}>
										{item.title && <strong>{item.title}</strong>}
										{item.text && <span>{item.text}</span>}
									</li>
								))}
							</ol>
						)}
					</div>
				</section>
			))}
		</main>
	);
};

export default Page;