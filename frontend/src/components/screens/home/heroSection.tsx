import React from "react";
import styles from "@/app/(home)/home.module.scss";
import Image from "next/image";
import {IMainScreen} from "@/types/screens/mainScreen.interface";

type props = {
	sectionId: string;
	data: IMainScreen;
};

export const HeroSection = ({sectionId, data}: props) => {
	return (
		<section id={sectionId} className={styles.heroSection + " container"}>
			<div className={styles.left}>
				<div className={styles.heroSection__mainText}>
					<h1>{data.heroSection.title}</h1>
					<p>{data.heroSection.description}</p>
				</div>
				<div className={styles.heroSection__btns}>
					<button className="btn">Узнать больше</button>
					<button className="btn-purple">Посмотреть недвижимость</button>
				</div>
				<div className={styles.heroSection__stat}>
					<div className={styles.heroSection__statBlock}>
						<h2>200+</h2>
						<p>Довольные клиенты</p>
					</div>
					<div className={styles.heroSection__statBlock}>
						<h2>10k+</h2>
						<p>Недвижимости</p>
					</div>
					<div className={styles.heroSection__statBlock}>
						<h2>16+</h2>
						<p>Опыт работы</p>
					</div>
				</div>
			</div>
			<div className={styles.right}>
				<Image
					src={"http://localhost:1337" + data.heroSection.image.url}
					width={data.heroSection.image.width}
					height={data.heroSection.image.height}
					alt={data.heroSection.image.alternativeText}
				/>
			</div>
		</section>
	);
};
