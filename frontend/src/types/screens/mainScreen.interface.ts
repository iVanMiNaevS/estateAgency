import {IAttraction} from "../park.interface";
import {IFaq} from "../faq.interface";
import {IMediaFormat} from "../mediaFormat.interface";
import {IReview} from "../reviews.interface";
import {SEO} from "../seo.interface";

interface BaseEntity {
	id: number;
}

/**
 * Данные главной страницы (singleType main-screen).
 *
 * Блок популярных аттракционов приходит в recomendedSection.attractions.
 * Поле advantagesSection добавлено вместе с моделью парка.
 */
export interface IMainScreen extends BaseEntity {
	heroSection: {
		title: string;
		description: string;
		image: IMediaFormat;
	};
	advantagesSection?: {
		title?: string | null;
		advantages?: { id: number; title: string; text?: string | null }[] | null;
	};
	recomendedSection: {
		title: string;
		description: string;
		attractions?: IAttraction[] | null;
	};
	newsSection?: {
		title?: string | null;
		description?: string | null;
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