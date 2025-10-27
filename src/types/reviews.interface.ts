import {StaticImageData} from "next/image";

export interface IReview {
	id: number;
	title: string;
	text: string;
	rating: number;
	author: {
		name: string;
		city: string;
		img: StaticImageData | string;
	};
}
