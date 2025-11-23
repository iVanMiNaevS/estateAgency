import {IEstate} from "@/types/estate.interface";
import React, {FC} from "react";
import styles from "./cardEstate.module.scss";
import Image from "next/image";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
type props = {
	estate: IEstate;
};

export const CardEstate: FC<props> = ({estate}) => {
	return (
		<div className={styles.cardContainer}>
			<Image
				className={styles.mainImg}
				src={process.env.NEXT_PUBLIC_SERVER_URL + estate.poster.url}
				alt={estate.poster.alternativeText}
				width={estate.poster.width}
				height={estate.poster.height}
			/>
			<div className={styles.textInfo}>
				<h4 className="h4">{estate.title}</h4>
				<p>{estate.description}</p>
			</div>
			<div className={styles.options}>
				{estate.options.map((option) => {
					return (
						<div key={option.id} className={styles.option}>
							<Image
								src={process.env.NEXT_PUBLIC_SERVER_URL + option.icon.url}
								width={option.icon.width}
								height={option.icon.height}
								alt={option.icon.alternativeText || option.text}
							/>
							<span>
								{option.type !== "type" ? option.value + "-" : ""}
								{option.text}
							</span>
						</div>
					);
				})}
			</div>
			<div className={styles.bottom}>
				<div className={styles.priceWrapp}>
					<span>Цена</span>
					<span>₽{estate.price}</span>
				</div>
				<Link href={AppRouter.catalog + "/" + estate.slug} className="btn-purple">
					Детали объекта
				</Link>
			</div>
		</div>
	);
};
