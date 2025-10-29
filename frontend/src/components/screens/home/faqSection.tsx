import React from "react";
import styles from "../../../app/(home)/home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import {CardEstate} from "@/ui/cardEstate/cardEstate";

import {IFaq} from "@/types/faq.interface";
import {CardFaq} from "@/ui/cardFaq/cardFaq";

export const FaqSection = ({sectionId}: {sectionId: string}) => {
	const faq: IFaq[] = [
		{
			id: 1,
			title: "Как мне искать недвижимость в ЭлитДом?",
			text: "Узнайте, как использовать наши удобные инструменты поиска, чтобы найти недвижимость, соответствующую вашим критериям.",
			link: "#",
		},
		{
			id: 2,
			title: "ККакие документы мне нужны для продажи моей недвижимости через ЭлитДом?",
			text: "Узнайте у нас о необходимой документации для внесения вашей недвижимости в реестр.",
			link: "#",
		},
		{
			id: 3,
			title: "Как я могу связаться с агентом по недвижимости?",
			text: "Узнайте о различных способах, которыми вы можете связаться с нашими опытными агентами.",
			link: "#",
		},
		{
			id: 4,
			title: "Как мне искать недвижимость в ЭлитДом?",
			text: "Узнайте, как использовать наши удобные инструменты поиска, чтобы найти недвижимость, соответствующую вашим критериям.",
			link: "#",
		},
	];

	const slides = faq.map((faq) => {
		return <CardFaq key={faq.id} faq={faq} />;
	});
	return (
		<section id={sectionId} className={styles.swiperSection + " container"}>
			<div className={styles.swiperSection__top}>
				<h2 className="h2">Часто задаваемые вопросы</h2>
				<p>
					<span>
						Найдите ответы на распространенные вопросы об услугах ЭлитДом, списках объектов
						недвижимости и процессе продажи недвижимости. Мы здесь для того, чтобы внести ясность и
						помочь вам на каждом этапе.
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
