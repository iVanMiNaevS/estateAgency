import React from "react";
import styles from "../../../app/(withHeaderFooter)/(home)//home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";
import {CardReview} from "@/ui/cardReview/cardReview";
import {IMainScreen} from "@/types/screens/mainScreen.interface";

type props = {
	sectionId: string;
	data?: IMainScreen;
};

/**
 * Блок отзывов на главной.
 *
 * Секция заполняется из админки и может быть пустой, поэтому
 * пустые данные не приводят к падению рендера.
 */
export const ReviewsSection = ({sectionId, data}: props) => {
	const sectionData = data?.reviewsSection;

	if (!sectionData || (sectionData.reviews ?? []).length === 0) {
		return null;
	}

	const slides = sectionData.reviews.map((review) => <CardReview key={review.id} review={review} />);

	return (
		<section id={sectionId} className={styles.swiperSection}>
			<div className="container">
				<div className={styles.swiperSection__top}>
					<h2 className="h2">{sectionData.title}</h2>
					<p>
						<span>{sectionData.description}</span>
						<Link className="buttonLink" href={AppRouter.attractions}>
							Смотреть аттракционы
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