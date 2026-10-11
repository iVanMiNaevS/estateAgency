import {IReview} from "@/types/reviews.interface";
import React, {FC} from "react";
import styles from "./cardReview.module.scss";
import Image from "next/image";
import star from "@/../public/icons/ratingStar.svg";
import profile from "@/../public/imgs/profile.jpg";
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
				<p>{review.review}</p>
			</div>
			<div className={styles.authorWrapp}>
				{review.user?.avatar ? (
					<Image
						src={
							!review.user?.avatar.formats
								? review.user?.avatar.url
								: review.user?.avatar.formats.thumbnail.url
						}
						width={
							review.user?.avatar.formats
								? review.user?.avatar.formats.thumbnail.width
								: review.user?.avatar.width
						}
						height={
							review.user?.avatar.formats
								? review.user?.avatar.formats.thumbnail.height
								: review.user?.avatar.height
						}
						alt="Фото автора"
					/>
				) : (
					<Image src={profile} alt="Фото автора" />
				)}
				<div className={styles.authorInfo}>
					<p>{review.user?.name ?? "Гость парка"}</p>
					{review.user?.city && <p className={styles.city}>{review.user.city}</p>}
				</div>
			</div>
		</div>
	);
};
