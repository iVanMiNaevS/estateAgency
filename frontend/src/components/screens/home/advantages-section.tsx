import React from "react";
import styles from "./advantages-section.module.scss";

interface Props {
	sectionId?: string;
	title?: string | null;
	advantages?: { id: number; title: string; text?: string | null }[] | null;
}

/**
 * Блок преимуществ парка на главной (ТЗ п.2.2 — сервисная цель).
 *
 * Тексты берутся из админки, поэтому правки не требуют правки кода.
 */
export const AdvantagesSection = ({ sectionId, title, advantages }: Props) => {
	const list = advantages ?? [];

	if (list.length === 0) {
		return null;
	}

	return (
		<section id={sectionId} className={styles.section}>
			<div className="container">
				{title && <h2 className="h2">{title}</h2>}

				<div className={styles.grid}>
					{list.map((advantage) => (
						<article key={advantage.id} className={styles.card}>
							<h3 className="h4">{advantage.title}</h3>
							{advantage.text && <p>{advantage.text}</p>}
						</article>
					))}
				</div>
			</div>
		</section>
	);
};