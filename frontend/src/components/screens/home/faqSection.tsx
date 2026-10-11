import React from "react";
import styles from "../../../app/(withHeaderFooter)/(home)//home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import {CardFaq} from "@/ui/cardFaq/cardFaq";
import {IMainScreen} from "@/types/screens/mainScreen.interface";

type props = {
	sectionId: string;
	data?: IMainScreen;
};

/**
 * Блок частых вопросов на главной.
 * Как и отзывы, секция заполняется из админки и может быть пустой.
 */
export const FaqSection = ({sectionId, data}: props) => {
	const sectionData = data?.faqSection;

	if (!sectionData || (sectionData.questions ?? []).length === 0) {
		return null;
	}

	const slides = sectionData.questions.map((faq) => <CardFaq key={faq.id} faq={faq} />);

	return (
		<section id={sectionId} className={styles.swiperSection}>
			<div className="container">
				<div className={styles.swiperSection__top}>
					<h2 className="h2">{sectionData.title}</h2>
					<p>
						<span>{sectionData.description}</span>
						<Link className="buttonLink" href={`${AppRouter.home}#${sectionId}`}>
							Задать вопрос
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
			</div>
		</section>
	);
};