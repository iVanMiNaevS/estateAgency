import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getObjects } from "@/services/getInfo";
import type { IAttraction } from "@/types/park.interface";
import { ATTRACTION_TYPE_LABELS } from "@/constants/park";
import styles from "./attraction.module.scss";

type Props = {
	params: Promise<{ slug: string }>;
};

/** Титул страницы зависит от карточки, поэтому metadata собираем там же. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const attraction = await findAttraction(slug);

	if (!attraction) {
		return { title: "Аттракцион не найден — Парк Чудес" };
	}

	return {
		title: `${attraction.title} — Парк Чудес`,
		description: attraction.shortFact ?? attraction.description.slice(0, 160),
	};
}

/** Загружает аттракцион по слагу. */
const findAttraction = async (slug: string): Promise<IAttraction | undefined> => {
	const result = await getObjects<IAttraction>(
		"attractions",
		["poster", "images", "restrictions", "options"],
		[{ filter: "$eq", field: "slug", value: slug }],
	);

	return result.data?.[0];
};

/**
 * Карточка аттракциона (ТЗ п.4.2.5, F-1.3).
 *
 * Первым показываем ограничения по росту и возрасту: это то, из-за
 * чего чаще всего отказывают на входе, и гостю лучше знать заранее.
 */
const Page = async ({ params }: Props) => {
	const { slug } = await params;
	const attraction = await findAttraction(slug);

	if (!attraction) {
		notFound();
	}

	const restrictions = attraction.restrictions ?? [];

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<nav className={styles.breadcrumbs}>
						<Link href="/attractions">Аттракционы</Link>
						<span>/</span>
						<span>{attraction.title}</span>
					</nav>

					<div className={styles.heroGrid}>
						<div className={styles.heroText}>
							<span className={styles.type}>
								{ATTRACTION_TYPE_LABELS[attraction.type] ?? attraction.type}
							</span>

							<h1 className="h2">{attraction.title}</h1>

							{attraction.shortFact && <p className={styles.lead}>{attraction.shortFact}</p>}

							<div className={styles.limitsBox}>
								<h2 className="h4">Ограничения</h2>
								<ul className={styles.limits}>
									<li>
										Рост:{" "}
										{attraction.heightMinCm
											? `от ${attraction.heightMinCm}${
													attraction.heightMaxCm ? ` до ${attraction.heightMaxCm}` : ""
												} см`
											: "без ограничений"}
									</li>
									<li>
										Возраст:{" "}
										{attraction.ageMax
											? `${attraction.ageMin}–${attraction.ageMax} лет`
											: `от ${attraction.ageMin ?? 0} лет`}
									</li>
									<li>Длительность: {attraction.durationMinutes ?? "—"} мин</li>
									<li>
										Стоимость:{" "}
										{attraction.basePrice > 0
											? `${attraction.basePrice.toLocaleString("ru-RU")} ₽ за посетителя`
											: "бесплатно"}
									</li>
								</ul>
							</div>

							<Link
								href={`/schedule?attraction=${attraction.slug}`}
								className={`btn btn-purple ${styles.btn}`}
							>
								Записаться на сеанс
							</Link>
						</div>

						{attraction.poster?.url && (
							<Image
								src={attraction.poster.url}
								alt={attraction.title}
								width={720}
								height={520}
								className={styles.poster}
								priority
							/>
						)}
					</div>
				</div>
			</section>

			<section>
				<div className="container">
					<h2 className="h2">Об аттракционе</h2>
					<p className={styles.description}>{attraction.description}</p>
				</div>
			</section>

			{restrictions.length > 0 && (
				<section>
					<div className="container">
						<h2 className="h2">Правила безопасности</h2>
						<ul className={styles.restrictions}>
							{restrictions.map((rule) => (
								<li key={rule.id} className={rule.isCritical ? styles.ruleCritical : styles.rule}>
									<strong>{rule.title}</strong>
									{rule.text && <span>{rule.text}</span>}
								</li>
							))}
						</ul>
					</div>
				</section>
			)}
		</main>
	);
};

export default Page;
