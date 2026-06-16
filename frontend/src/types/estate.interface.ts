import {StaticImageData} from "next/image";
import {IMediaFormat} from "./mediaFormat.interface";

export interface IEstate {
	id: number;
	title: string;
	description: string;
	address: string;
	slug: string;
	price: string;
}
