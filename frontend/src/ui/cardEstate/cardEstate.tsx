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
			<div className={styles.textInfo}>
				<h4 className="h4">{estate.title}</h4>
				<p>{estate.description}</p>
			</div>
			<div className={styles.bottom}>
				<div className={styles.priceWrapp}>
					<span>Цена</span>
					<span>₽{estate.price}</span>
				</div>
				<Link href={AppRouter.catalog + "/" + estate.slug} className="btn-purple">
					Детали услуги
				</Link>
			</div>
		</div>
	);
};
