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
}

/** Тариф парка. Соответствует модели api::ticket-price.ticket-price. */
export interface ITicketPrice extends BaseEntity {
	title: string;
	category: "ticket" | "service" | "benefit" | string;
	description?: string | null;
	price: number;
	oldPrice?: number | null;
	durationMinutes?: number | null;
	adultPrice?: number | null;
	childPrice?: number | null;
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