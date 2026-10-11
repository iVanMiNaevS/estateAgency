import React from "react";
import Link from "next/link";
import { AppRouter } from "@/AppRouter";
import styles from "./intro-section.module.scss";

interface Props {
	sectionId?: string;
	title?: string | null;
	description?: string | null;
}

/**
 * Вводный блок на главной — первый экран почти целиком занят
 * фотографией и кнопками, поэтому после него нужен короткий
 * текст, объясняющий, что вообще можно сделать на сайте.
 *
 * Заголовок и текст приходят из админки: без них блок не рисуется,
 * как и остальные секции главной.
 */
export const IntroSection = ({ sectionId, title, description }: Props) => {
	if (!title && !description) {
		return null;
	}

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				<div className={styles.inner}>
					<div className={styles.text}>
						{title && <h2 className="h2">{title}</h2>}
						{description && <p className={styles.description}>{description}</p>}
					</div>

					{/* Ссылки повторяют главное действие: посмотреть
					    аттракционы и выбрать время, а не разбираться
					    в структуре сайта. */}
					<div className={styles.actions}>
						<Link href={AppRouter.attractions} className="btn">
							Все аттракционы
						</Link>
						<Link href={AppRouter.schedule} className="btn-purple">
							Выбрать сеанс
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};