import React from "react";
import styles from "../../../app/(withHeaderFooter)/catalog/catalog.module.scss";
import {IMainScreen} from "@/types/screens/mainScreen.interface";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import {CardEstate} from "@/ui/cardEstate/cardEstate";
import Link from "next/link";
import {IEstate} from "@/types/estate.interface";
import {IMeta} from "@/types/meta.interface";

type props = {
	sectionId: string;
	data: {data: IEstate[]; meta: IMeta};
};

export const CatalogSection = ({sectionId, data}: props) => {
	const estates = data.data;
	if (!estates) {
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
	const slides = estates.map((estate) => {
		return <CardEstate key={estate.id} estate={estate} />;
	});

	return (
		<section id={sectionId} className={styles.swiperSection}>
			<div className="container">
				<div className={styles.swiperSection__top}>
					<h2 className="h2">Откройте для себя мир возможностей</h2>
					<p>
						Наше портфолио недвижимости столь же разнообразно, как и ваши мечты. Изучите следующие
						категории, чтобы найти идеальную недвижимость, которая соответствует вашему видению дома
					</p>
				</div>
				<UiSwiper
					slides={slides}
					slidesPerView={3}
					spaceBetween={30}
					navigation={true}
					showCount={true}
					autoplay={{delay: 5000}}
				/>
			</div>
		</section>
	);
};
