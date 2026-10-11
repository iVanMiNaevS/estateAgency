import { IMediaFormat } from "./mediaFormat.interface";

/**
 * Отзыв посетителя.
 *
 * Связь с пользователем необязательна: отзыв может быть создан
 * администратором в админке, и тогда автора у записи нет.
 */
export interface IReview {
	id: number;
	title: string;
	review: string;
	rating: number;
	user?: {
		name?: string | null;
		city?: string | null;
		avatar?: IMediaFormat | null;
	} | null;
}