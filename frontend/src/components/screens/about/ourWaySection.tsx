import React from "react";
import styles from "@/app/(withHeaderFooter)/about/about.module.scss";
import Image from "next/image";
import homeInHand from "@/../public/imgs/aboutHomeInHand.png";

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
						Наша история - это история постоянного роста и эволюции. Мы начинали как небольшая команда
						с большими мечтами, полная решимости создать платформу для работы с недвижимостью,
						выходящую за рамки обычного. С годами мы расширили сферу своей деятельности, наладили
						ценные партнерские отношения и завоевали доверие бесчисленного количества клиентов.
					</p>
					<div className={styles.ourWaySection__stat}>
						<div className={styles.ourWaySection__statBlock}>
							<h2>200+</h2>
							<p>Довольные клиенты</p>
						</div>
						<div className={styles.ourWaySection__statBlock}>
							<h2>10k+</h2>
							<p>Недвижимости</p>
						</div>
						<div className={styles.ourWaySection__statBlock}>
							<h2>16+</h2>
							<p>Опыт работы</p>
						</div>
					</div>
				</div>
				<Image src={homeInHand} alt="home in hand" />
			</div>
		</section>
	);
};
