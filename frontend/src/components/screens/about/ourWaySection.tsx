import React from "react";
import styles from "@/app/(withHeaderFooter)/about/about.module.scss";
import Image from "next/image";
import homeInHand from "@/../public/imgs/about.png";

type props = {
	sectionId: string;
};

export const OurWaySection = ({sectionId}: props) => {
	return (
		<section id={sectionId} className={styles.ourWaySection}>
			<div className="container">
				<div className={styles.ourWaySection__text}>
					<h1 className="h2">Наш путь</h1>
					<p className={styles.ourWaySection__desc}>
						Мы начали свой путь в 2018 году как небольшая команда маркетологов-энтузиастов, 
						которые верили, что реклама может быть эффективной и прозрачной. За 8 лет работы 
						мы превратились в полноценное digital-агентство, помогающее бизнесам расти 
						в интернете. Мы перепробовали десятки стратегий, протестировали сотни гипотез 
						и накопили экспертизу, которой готовы делиться с каждым клиентом. Сегодня мы — 
						это команда профессионалов, которые знают, как привести клиента и не слить бюджет.
					</p>
					<div className={styles.ourWaySection__stat}>
						<div className={styles.ourWaySection__statBlock}>
							<h2>250+</h2>
							<p>Успешных проектов</p>
						</div>
						<div className={styles.ourWaySection__statBlock}>
							<h2>98%</h2>
							<p>Довольных клиентов</p>
						</div>
						<div className={styles.ourWaySection__statBlock}>
							<h2>6 лет</h2>
							<p>На рынке</p>
						</div>
					</div>
				</div>
				<Image src={homeInHand} alt="home in hand" />
			</div>
		</section>
	);
};
