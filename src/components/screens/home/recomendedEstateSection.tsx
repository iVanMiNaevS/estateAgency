import React from "react";
import styles from "../../../app/(home)/home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import estate1 from "@/../public/imgs/estate1.jpg";
import estate2 from "@/../public/imgs/estate2.jpg";
import estate3 from "@/../public/imgs/estate3.jpg";
import {CardEstate} from "@/ui/cardEstate/cardEstate";
import {IEstate} from "@/types/estate.interface";

import bed from "@/../public/icons/bed.svg";
import homeOne from "@/../public/icons/homeOne.svg";
import shower from "@/../public/icons/shower.svg";

export const RecomendedEstateSection = () => {
	const estates: IEstate[] = [
		{
			id: 1,
			img: estate1,
			title: "Вилла безмятежности на берегу моря",
			description:
				"Потрясающая вилла с 4 спальнями и 3 ванными комнатами в тихом пригородном районе бла бла бла",
			options: [
				{type: "bedrooms", value: 4, text: "Спальни", icon: bed},
				{type: "showers", value: 3, text: "Душевых", icon: shower},
				{type: "type", value: "Villa", text: "Вилла", icon: homeOne},
			],
			price: "44, 302, 500",
		},
		{
			id: 2,
			img: estate2,
			title: "Вилла безмятежности на берегу моря",
			description:
				"Потрясающая вилла с 4 спальнями и 3 ванными комнатами в тихом пригородном районе бла бла бла",
			options: [
				{type: "bedrooms", value: 4, text: "Спальни", icon: bed},
				{type: "showers", value: 3, text: "Душевых", icon: shower},
				{type: "type", value: "Villa", text: "Вилла", icon: homeOne},
			],
			price: "44, 302, 500",
		},
		{
			id: 3,
			img: estate3,
			title: "Вилла безмятежности на берегу моря",
			description:
				"Потрясающая вилла с 4 спальнями и 3 ванными комнатами в тихом пригородном районе бла бла бла",
			options: [
				{type: "bedrooms", value: 4, text: "Спальни", icon: bed},
				{type: "showers", value: 3, text: "Душевых", icon: shower},
				{type: "type", value: "Villa", text: "Вилла", icon: homeOne},
			],
			price: "44, 302, 500",
		},
		{
			id: 4,
			img: estate1,
			title: "Вилла безмятежности на берегу моря",
			description:
				"Потрясающая вилла с 4 спальнями и 3 ванными комнатами в тихом пригородном районе бла бла бла",
			options: [
				{type: "bedrooms", value: 4, text: "Спальни", icon: bed},
				{type: "showers", value: 3, text: "Душевых", icon: shower},
				{type: "type", value: "Villa", text: "Вилла", icon: homeOne},
			],
			price: "44, 302, 500",
		},
	];

	const slides = estates.map((estate) => {
		return <CardEstate key={estate.id} estate={estate} />;
	});
	return (
		<section className={styles.recSection + " container"}>
			<div className={styles.recSection__top}>
				<h2 className="h2">Рекомендуемая недвижемость</h2>
				<p>
					<span>
						Ознакомьтесь с нашей тщательно отобранной подборкой объектов недвижимости. Каждое
						объявление дает представление об исключительных домах и инвестициях, доступных через
						ЭлитДом. Нажмите "Просмотреть подробности" для получения дополнительной информации.
					</span>
					<Link className="buttonLink" href={AppRouter.catalog}>
						Посмотреть все объекты
					</Link>
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
		</section>
	);
};
