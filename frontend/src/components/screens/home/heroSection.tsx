import React from "react";
import styles from "@/app/(withHeaderFooter)/(home)//home.module.scss";
import Image from "next/image";
import {IMainScreen} from "@/types/screens/mainScreen.interface";
import Link from "next/link";
import { AppRouter } from "@/AppRouter";

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
						<Link href={AppRouter.attractions} className="btn">
							Смотреть аттракционы
						</Link>
						<Link href={AppRouter.schedule} className="btn-purple">
							Забронировать
						</Link>
					</div>
					<div className={styles.heroSection__stat}>
						<div className={styles.heroSection__statBlock}>
							<p className={styles.heroSection__statValue}>200+</p>
							<p>Довольные клиенты</p>
						</div>
						<div className={styles.heroSection__statBlock}>
							<p className={styles.heroSection__statValue}>14+</p>
							<p>Аттракционов</p>
						</div>
						<div className={styles.heroSection__statBlock}>
							<p className={styles.heroSection__statValue}>4</p>
							<p>Зоны парка</p>
						</div>
					</div>
				</div>
					{/* Изображение необязательно: контент заполняется из админки,
					    поэтому при пустом поле блок просто не рисуется. */}
					{sectionData?.image?.url && (
						<Image
							src={sectionData.image.url}
							width={sectionData.image.width}
							height={sectionData.image.height}
							alt={sectionData.image.alternativeText ?? "Парк развлечений"}
						/>
					)}
			</div>
		</section>
	);
};
