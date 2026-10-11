import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./card-attraction.module.scss";
import type { IAttraction } from "@/types/park.interface";
import { ATTRACTION_TYPE_LABELS } from "@/constants/park";

interface Props {
	attraction: IAttraction;
	/** Ссылка на карточку. На главной карточки кликабельны, в списке — нет. */
	href?: string;
	/** Показывать ограничения по росту и возрасту. */
	showLimits?: boolean;
}

/**
 * Карточка аттракциона.
 *
 * Используется в каталоге, на главной и в расписании. Ограничения
 * по возрасту и росту показываются явно: это требование безопасности
 * из ТЗ, гость должен видеть их до покупки билета.
 */
export const CardAttraction = ({
	attraction,
	href,
	showLimits = true,
}: Props) => {
	const content = (
		<>
			{attraction.poster?.url && (
				<Image
					src={attraction.poster.url}
					alt={attraction.title}
					width={480}
					height={320}
					className={styles.image}
				/>
			)}

			<div className={styles.body}>
				<span className={styles.type}>
					{ATTRACTION_TYPE_LABELS[attraction.type] ?? attraction.type}
				</span>

				<h3 className={styles.title}>{attraction.title}</h3>

				{attraction.shortFact && <p className={styles.fact}>{attraction.shortFact}</p>}

				{showLimits && (attraction.heightMinCm || attraction.ageMin) && (
					<ul className={styles.limits}>
						{attraction.heightMinCm && (
							<li>
								рост от {attraction.heightMinCm}
								{attraction.heightMaxCm ? `–${attraction.heightMaxCm}` : ""} см
							</li>
						)}
						{attraction.ageMin ? (
							<li>
								{attraction.ageMax
									? `${attraction.ageMin}–${attraction.ageMax} лет`
									: `от ${attraction.ageMin} лет`}
							</li>
						) : (
							<li>без ограничений по возрасту</li>
						)}
					</ul>
				)}

				<p className={styles.price}>
					{attraction.basePrice > 0
						? `${attraction.basePrice.toLocaleString("ru-RU")} ₽`
						: "Бесплатно"}
				</p>
			</div>
		</>
	);

	if (!href) {
		return <article className={styles.card}>{content}</article>;
	}

	return (
		<Link href={href} className={styles.card}>
			{content}
		</Link>
	);
};