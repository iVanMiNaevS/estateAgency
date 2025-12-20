import React from "react";
import styles from "./slug.module.scss";
import {getObjects} from "@/services/getInfo";
import {IEstate} from "@/types/estate.interface";
import Image from "next/image";
import geo from "@/../public/icons/geo.svg";
import noImage from "@/../public/imgs/noimage.png";
import {UiSwiper} from "@/ui/uiSwiper/uiSwiper";

interface PageProps {
	params: {
		slug: string;
	};
}
const page = async ({params}: PageProps) => {
	const {slug} = params;

	const estates = await getObjects<IEstate>(
		"estates",
		["poster", "options.icon", "images"],
		[
			{
				filter: "$eq",
				field: "slug",
				value: slug,
			},
		]
	);
	const estate = estates.data[0];
	const villaImagesPlaceholder = Array.from({length: 3}, () => noImage);
	const slides =
		estate.images !== null
			? estate.images.map((image) => {
					return (
						<Image
							key={image.id}
							src={process.env.NEXT_PUBLIC_SERVER_URL + image.url}
							alt={image.alternativeText ? image.alternativeText : "icon"}
							width={image.width}
							height={image.height}
						/>
					);
			  })
			: villaImagesPlaceholder.map((image) => {
					return <Image src={image} className={styles.noImage} alt="изображение недвижемости" />;
			  });
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
			<section className={styles.imgSliderSection}>
				<UiSwiper slides={slides} />
			</section>
			<section className={styles.descSection}>
				<div className={styles.descSection__options}>
					{estate.options.map((option) => {
						return (
							<div className={styles.descSection__option}>
								<div className="">
									<Image
										src={process.env.NEXT_PUBLIC_SERVER_URL + option.icon.url}
										alt={option.icon.alternativeText ? option.icon.alternativeText : "icon"}
										width={option.icon.width}
										height={option.icon.height}
									/>
									{option.type !== "type" ? option.text : "Тип"}
								</div>
								<span>{option.type !== "type" ? option.value : option.text}</span>
							</div>
						);
					})}
				</div>
				<h4 className="h4">Описание</h4>
				<p>{estate.description}</p>
			</section>
		</div>
	);
};
export default page;
