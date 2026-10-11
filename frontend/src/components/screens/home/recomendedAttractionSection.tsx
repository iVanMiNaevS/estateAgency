import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./recomendedAttractionSection.module.scss";
import { IAttraction } from "@/types/park.interface";
import { AppRouter } from "@/AppRouter";

interface Props {
	sectionId?: string;
	attractions?: IAttraction[] | null;
	title?: string | null;
	description?: string | null;
}

const TYPE_LABELS: Record<string, string> = {
	extreme: "Экстремальный",
	family: "Семейный",
	child: "Детский",
};

/**
 * Блок популярных аттракционов на главной.
 *
 * Раньше здесь был каталог объектов недвижимости; после перехода
 * на модель парка блок показывает аттракционы из
 * recomendedSection.attractions.
 */
export const RecomendedAttractionSection = ({
	sectionId,
	attractions,
	title,
	description,
}: Props) => {
	const list = attractions ?? [];

	if (list.length === 0) {
		return null;
	}

	const cards = list.map((attraction) => {
		const limits: string[] = [];
		if (attraction.heightMinCm) {
			limits.push(`рост от ${attraction.heightMinCm} см`);
		}
		if (attraction.ageMin) {
			limits.push(
				attraction.ageMax
					? `${attraction.ageMin}–${attraction.ageMax} лет`
					: `от ${attraction.ageMin} лет`
			);
		}

		return (
			<article key={attraction.id} className={styles.card}>
				<Link href={`${AppRouter.attractions}/${attraction.slug}`}>
					{attraction.poster?.url && (
						<Image
							src={attraction.poster.url}
							alt={attraction.title}
							width={400}
							height={300}
							className={styles.image}
						/>
					)}

					<div className={styles.body}>
						<span className={styles.type}>
							{TYPE_LABELS[attraction.type] ?? attraction.type}
						</span>

						<h3 className={styles.title}>{attraction.title}</h3>

						{attraction.shortFact && (
							<p className={styles.fact}>{attraction.shortFact}</p>
						)}

						<ul className={styles.limits}>
							{limits.map((limit) => (
								<li key={limit}>{limit}</li>
							))}
						</ul>

						<p className={styles.price}>
							{attraction.basePrice > 0
								? `${attraction.basePrice.toLocaleString("ru-RU")} ₽`
								: "Бесплатно"}
						</p>
					</div>
				</Link>
			</article>
		);
	});

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				{title && <h2 className={styles.heading}>{title}</h2>}
				{description && <p className={styles.description}>{description}</p>}

				<div className={styles.grid}>{cards}</div>
			</div>
		</section>
	);
};