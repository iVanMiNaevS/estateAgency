import {StaticImageData} from "next/image";
import {IMediaFormat} from "./mediaFormat.interface";

export interface IEstate {
	id: number;
	poster: IMediaFormat;
	title: string;
	description: string;
	options: {
		id: number;
		type: "bedrooms" | "showers" | "type";
		value: number | string;
		text: string;
		icon: IMediaFormat;
	}[];
	price: string;
}
