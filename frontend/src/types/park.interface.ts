import { IMediaFormat } from "./mediaFormat.interface";

interface BaseEntity {
	id: number;
	documentId?: string;
}

/**
 * Аттракцион парка развлечений.
 * Соответствует модели api::attraction.attraction в Strapi.
 */
export interface IAttraction extends BaseEntity {
	title: string;
	slug: string;
	type: "extreme" | "family" | "child" | string;
	shortFact?: string | null;
	description: string;
	durationMinutes?: number | null;
	basePrice: number;
	ageMin?: number | null;
	ageMax?: number | null;
	heightMinCm?: number | null;
	heightMaxCm?: number | null;
	isActive?: boolean;
	sortOrder?: number;
	poster?: IMediaFormat | null;
	images?: IMediaFormat[] | null;
	/** Ограничения по здоровью и безопасности. */
	restrictions?: {
		id: number;
		title: string;
		text?: string | null;
		isCritical?: boolean;
	}[] | null;
	/** Характеристики вида «длительность / стоимость». */
	options?: { id: number; label: string; value?: string | null }[] | null;
}

/** Элемент галереи: фотография или видео. */
export interface IGalleryItem {
	id: number;
	title?: string | null;
	mediaType: "image" | "video";
	caption?: string | null;
	sortOrder?: number;
	file?: IMediaFormat | null;
	preview?: IMediaFormat | null;
}

/** Альбом галереи. */
export interface IGalleryAlbum {
	id: number;
	title: string;
	slug: string;
	description?: string | null;
	cover?: IMediaFormat | null;
	items?: IGalleryItem[] | null;
	sortOrder?: number;
}

/** Новость парка. */
export interface INewsItem {
	id: number;
	title: string;
	slug: string;
	excerpt?: string | null;
	content?: string | null;
	eventDate?: string | null;
	isPinned?: boolean;
	cover?: IMediaFormat | null;
}

/** Текстовая страница парка. */
export interface IPage {
	id: number;
	title: string;
	slug: string;
	subtitle?: string | null;
	content?: string | null;
	heroImage?: IMediaFormat | null;
	blocks?: {
		id: number;
		title?: string | null;
		text?: string | null;
		layout?: "text" | "text-left" | "text-right";
		items?: { id: number; title?: string | null; text?: string | null }[] | null;
	}[] | null;
}

/** Тариф парка. Соответствует модели api::ticket-price.ticket-price. */
export interface ITicketPrice extends BaseEntity {
	title: string;
	category: "ticket" | "service" | "benefit" | string;
	description?: string | null;
	price: number;
	oldPrice?: number | null;
	durationMinutes?: number | null;
	/**
	 * Доля цены места в процентах: 100 — полная цена аттракциона.
	 * Тарифы хранят проценты, а не рубли, потому что цена аттракциона
	 * своя у каждого, и скидка считается от неё.
	 */
	adultPercent?: number | null;
	childPercent?: number | null;
	/** Условия применимости: 0 — ограничения нет. */
	minGuests?: number | null;
	minAdults?: number | null;
	minChildren?: number | null;
	cancelPolicy?: string | null;
	isPopular?: boolean;
	sortOrder?: number;
	includes?: { id: number; text: string }[] | null;
}

/** Сеанс посещения с числом свободных мест. */
export interface ISession extends BaseEntity {
	date: string;
	startTime: string;
	durationMinutes?: number | null;
	capacity: number;
	seatsTaken: number;
	/** Приходит с сервера, клиент не рассчитывает сам. */
	freeSeats: number;
	price: number;
	status: "open" | "full" | "cancelled";
	comment?: string | null;
	attraction?: (IAttraction & { id: number }) | null;
}

export type { BaseEntity };