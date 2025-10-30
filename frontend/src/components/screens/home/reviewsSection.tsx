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
import {IMainScreen} from "@/types/screens/mainScreen.interface";
type props = {
	sectionId: string;
	data: IMainScreen;
};
export const ReviewsSection = ({sectionId, data}: props) => {
	const sectionData = data.reviewsSection;

	const slides = sectionData.reviews.map((review) => {
		return <CardReview key={review.id} review={review} />;
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
