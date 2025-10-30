import {IMediaFormat} from "./mediaFormat.interface";

export interface IReview {
	id: number;
	title: string;
	review: string;
	rating: number;
	user: {
		name: string;
		city: string;
		avatar: IMediaFormat;
	};
}
