import React from "react";
import styles from "./slug.module.scss";
import {getObjects} from "@/services/getInfo";
import {IEstate} from "@/types/estate.interface";
import Image from "next/image";
import geo from "@/../public/icons/geo.svg";

interface PageProps {
	params: {
		slug: string;
	};
}
const page = async ({params}: PageProps) => {
	const {slug} = params;

	const estates = await getObjects<IEstate>(
		"estates",
		[],
		[
			{
				filter: "$eq",
				field: "slug",
				value: slug,
			},
		]
	);
	const estate = estates.data[0];
	console.log(estate);
	return (
		<div className="container">
			<div className={styles.top}>
				<h1 className="h3">{estate.title}</h1>
				<div className={styles.address}>
					<Image src={geo} alt="geo" />
					{estate.address}
				</div>
				<div className={styles.price}>
					<p>Цена</p>
					<span>₽{estate.price}</span>
				</div>
			</div>
			<section className={styles.descSection}>
				<h4 className="h4">Описание</h4>
				<p>{estate.description}</p>
			</section>
		</div>
	);
};
export default page;
