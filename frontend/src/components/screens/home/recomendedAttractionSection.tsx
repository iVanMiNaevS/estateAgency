import React from "react";
import { UiSwiper } from "@/ui/uiSwiper/uiSwiper";
import { CardAttraction } from "@/ui/card-attraction/card-attraction";
import { AppRouter } from "@/AppRouter";
import type { IAttraction } from "@/types/park.interface";
import styles from "./recomendedAttractionSection.module.scss";

interface Props {
	sectionId?: string;
	attractions?: IAttraction[] | null;
	title?: string | null;
	description?: string | null;
}

/**
 * Блок популярных аттракционов на главной.
 *
 * Карточки показываются слайдером, как блок отзывов: аттракционов
 * может быть больше, чем помещается в первый экран.
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

	const slides = list.map((attraction) => (
		<CardAttraction
			key={attraction.id}
			attraction={attraction}
			href={`${AppRouter.attractions}/${attraction.slug}`}
		/>
	));

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				<div className={styles.head}>
					<div>
						<h2 className="h2">{title}</h2>
						{description && <p className={styles.description}>{description}</p>}
					</div>
				</div>

				<UiSwiper
					slides={slides}
					slidesPerView={3}
					spaceBetween={24}
					navigation={list.length > 3}
					showCount={list.length > 3}
					loop={list.length > 4}
					autoplay={{ delay: 6000 }}
				/>
			</div>
		</section>
	);
};