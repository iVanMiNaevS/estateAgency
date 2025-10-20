import React from "react";
import styles from "@/app/(home)/home.module.scss";
import Image from "next/image";
import homeHeroSectionImg from "@/../public/imgs/homeHeroSectionImg.png";

export const HeroSection = () => {
	return (
		<section className={styles.heroSection + " container"}>
			<div className={styles.left}>
				<div className={styles.heroSection__mainText}>
					<h1>Откройте для себя недвижимость своей мечты с ЭлитДом</h1>
					<p>
						Здесь начинается ваш путь к поиску идеальной недвижимости. Изучите наши объявления,
						чтобы найти дом, соответствующий вашим мечтам.
					</p>
				</div>
				<div className={styles.heroSection__btns}>
					<button className="btn">Узнать больше</button>
					<button className="btn-purple">Посмтотреть недвижимость</button>
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
				<Image src={homeHeroSectionImg} alt="Небоскрёб" />
			</div>
		</section>
	);
};
