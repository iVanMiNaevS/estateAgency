import {StaticImageData} from "next/image";

export interface IEstate {
	id: number;
	img: StaticImageData | string;
	title: string;
	description: string;
	options: {
		type: "bedrooms" | "showers" | "type";
		value: number | string;
		text: string;
		icon: StaticImageData;
	}[];
	price: string;
}
