import React from "react";
import styles from "@/app/(withHeaderFooter)/(home)//home.module.scss";
import Image from "next/image";
import {IMainScreen} from "@/types/screens/mainScreen.interface";

type props = {
	sectionId: string;
	data: IMainScreen;
};

export const HeroSection = ({sectionId, data}: props) => {
	const sectionData = data.heroSection;
	if (!sectionData) {
		return (
			<section id={sectionId} className={styles.heroSection}>
				<div className="container">
					<div className={styles.left}>
						<h1>Данные временно недоступны</h1>
						<p>Пожалуйста, попробуйте позже</p>
					</div>
				</div>
			</section>
		);
	}
	return (
		<section id={sectionId} className={styles.heroSection}>
			<div className="container">
				<div className={styles.left}>
					<div className={styles.heroSection__mainText}>
						<h1>{sectionData.title}</h1>
						<p>{sectionData.description}</p>
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
						src={process.env.NEXT_PUBLIC_SERVER_URL + sectionData.image.url}
						width={sectionData.image.width}
						height={sectionData.image.height}
						alt={sectionData.image.alternativeText}
					/>
				</div>
			</div>
		</section>
	);
};
