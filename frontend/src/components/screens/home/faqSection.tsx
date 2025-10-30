import React from "react";
import styles from "../../../app/(home)/home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import {CardEstate} from "@/ui/cardEstate/cardEstate";

import {IFaq} from "@/types/faq.interface";
import {CardFaq} from "@/ui/cardFaq/cardFaq";
import {IMainScreen} from "@/types/screens/mainScreen.interface";

type props = {
	sectionId: string;
	data: IMainScreen;
};

export const FaqSection = ({sectionId, data}: props) => {
	const sectionData = data.faqSection;

	const slides = sectionData.questions.map((faq) => {
		return <CardFaq key={faq.id} faq={faq} />;
	});
	return (
		<section id={sectionId} className={styles.swiperSection + " container"}>
			<div className={styles.swiperSection__top}>
				<h2 className="h2">{sectionData.title}</h2>
				<p>
					<span>{sectionData.description}</span>
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
