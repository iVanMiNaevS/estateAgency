import {IMediaFormat} from "./mediaFormat.interface";

export interface IReview {
	id: number;
	title: string;
	text: string;
	rating: number;
	user: {
		name: string;
		city: string;
		img: IMediaFormat | string;
	};
}
