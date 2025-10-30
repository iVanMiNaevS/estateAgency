import {IEstate} from "../estate.interface";
import {IFaq} from "../faq.interface";
import {IMediaFormat} from "../mediaFormat.interface";
import {IReview} from "../reviews.interface";
import {SEO} from "../seo.interface";

interface BaseEntity {
	id: number;
}

export interface IMainScreen extends BaseEntity {
	heroSection: {
		title: string;
		description: string;
		image: IMediaFormat;
	};
	recomendedSection: {
		title: string;
		description: string;
		estates: IEstate[];
	};
	reviewsSection: {
		title: string;
		description: string;
		reviews: IReview[];
	};
	faqSection: {
		title: string;
		description: string;
		questions: IFaq[];
	};
	seo: SEO;
}
