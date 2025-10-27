import React from "react";
import styles from "../../../app/(home)/home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import {CardEstate} from "@/ui/cardEstate/cardEstate";
import profile from "@/../public/imgs/Profile.png";

import bed from "@/../public/icons/bed.svg";
import {IReview} from "@/types/reviews.interface";
import {CardReview} from "@/ui/cardReview/cardReview";

export const ReviewsSection = () => {
	const reviews: IReview[] = [
		{
			id: 1,
			title: "Исключительный сервис!",
			text: "Наш опыт работы с недвижимостью был выдающимся. Преданность делу и профессионализм их команды позволили легко найти дом нашей мечты. Настоятельно рекомендуем!",
			author: {name: "Андрей Петров", city: "Санкт-Петербург", img: profile},
			rating: 5,
		},
		{
			id: 2,
			title: "Исключительный сервис!",
			text: "Наш опыт работы с недвижимостью был выдающимся. Преданность делу и профессионализм их команды позволили легко найти дом нашей мечты. Настоятельно рекомендуем!",
			author: {name: "Андрей Петров", city: "Санкт-Петербург", img: profile},
			rating: 5,
		},
		{
			id: 3,
			title: "Исключительный сервис!",
			text: "Наш опыт работы с недвижимостью был выдающимся. Преданность делу и профессионализм их команды позволили легко найти дом нашей мечты. Настоятельно рекомендуем!",
			author: {name: "Андрей Петров", city: "Санкт-Петербург", img: profile},
			rating: 5,
		},
		{
			id: 4,
			title: "Исключительный сервис!",
			text: "Наш опыт работы с недвижимостью был выдающимся. Преданность делу и профессионализм их команды позволили легко найти дом нашей мечты. Настоятельно рекомендуем!",
			author: {name: "Андрей Петров", city: "Санкт-Петербург", img: profile},
			rating: 5,
		},
	];

	const slides = reviews.map((review) => {
		return <CardReview key={review.id} review={review} />;
	});
	return (
		<section className={styles.recSection + " container"}>
			<div className={styles.recSection__top}>
				<h2 className="h2">Что говорят наши клиенты</h2>
				<p>
					<span>
						Ознакомьтесь с историями успеха и искренними отзывами наших уважаемых клиентов. Узнайте,
						почему они выбрали ЭлитДом для своих нужд в сфере недвижимости.
					</span>
					<Link className="buttonLink" href={AppRouter.catalog}>
						Просмотреть все объекты
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
