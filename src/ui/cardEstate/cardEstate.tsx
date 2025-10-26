import {IEstate} from "@/types/estate.interface";
import React, {FC} from "react";
import styles from "./cardEstate.module.scss";
import Image from "next/image";
type props = {
	estate: IEstate;
};

export const CardEstate: FC<props> = ({estate}) => {
	return (
		<div className={styles.cardContainer}>
			<Image className={styles.mainImg} src={estate.img} alt="изображение недвижимости" />
			<div className={styles.textInfo}>
				<h4 className="h4">{estate.title}</h4>
				<p>{estate.description}</p>
			</div>
			<div className={styles.options}>
				{estate.options.map((option) => {
					return (
						<div key={option.type} className={styles.option}>
							<Image src={option.icon} alt={option.text} />
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
				<button className="btn-purple">Детали объекта</button>
			</div>
		</div>
	);
};
