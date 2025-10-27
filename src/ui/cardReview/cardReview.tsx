import {IReview} from "@/types/reviews.interface";
import React, {FC} from "react";
import styles from "./cardReview.module.scss";
import Image from "next/image";
import star from "@/../public/icons/ratingStar.svg";

type props = {
	review: IReview;
};

export const CardReview: FC<props> = ({review}) => {
	return (
		<div className={styles.cardContainer}>
			<div className={styles.ratingWrapp}>
				{Array.from({length: review.rating}, (v, i) => i + 1).map((rating, index) => {
					return <Image key={index} src={star} alt={`оценка ${index + 1}`} />;
				})}
			</div>
			<div className={styles.infoText}>
				<h4 className="h4">{review.title}</h4>
				<p>{review.text}</p>
			</div>
			<div className={styles.authorWrapp}>
				<Image src={review.author.img} alt="Фото автора" />
				<div className={styles.authorInfo}>
					<p>{review.author.name}</p>
					<p className={styles.city}>{review.author.city}</p>
				</div>
			</div>
		</div>
	);
};
