import React, {FC} from "react";
import styles from "./cardFaq.module.scss";
import {IFaq} from "@/types/faq.interface";
import Link from "next/link";

type props = {
	faq: IFaq;
};

export const CardFaq: FC<props> = ({faq}) => {
	return (
		<div className={styles.cardContainer}>
			<h4 className="h4">{faq.title}</h4>
			<p>{faq.description}</p>
			<Link href={faq.slug}>Подробнее</Link>
		</div>
	);
};
