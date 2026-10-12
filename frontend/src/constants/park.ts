/**
 * Справочники парка: подписи, которые используются в нескольких
 * компонентах. Вынесены отдельно, чтобы не расходились между
 * главной, каталогом и личным кабинетом.
 */

export const ATTRACTION_TYPE_LABELS: Record<string, string> = {
	extreme: "Экстремальный",
	family: "Семейный",
	child: "Детский",
};

export const ATTRACTION_TYPES = [
	{ value: "", label: "Все аттракционы" },
	{ value: "extreme", label: "Экстремальные" },
	{ value: "family", label: "Семейные" },
	{ value: "child", label: "Детские" },
] as const;

/** Статусы броней — подписи из ТЗ п.4.2.3. */
export const BOOKING_STATUS_LABELS: Record<string, string> = {
	pending: "Новая",
	confirmed: "Подтверждена",
	paid: "Оплачена",
	completed: "Завершена",
	cancelled: "Отменена",
	rejected: "Отказ",
};

/** Статусы, при которых клиент ещё может отменить запись. */
export const CANCELLABLE_STATUSES = ["pending", "confirmed", "paid"];

/** Статусы сеанса. */
export const SESSION_STATUS_LABELS: Record<string, string> = {
	open: "Есть места",
	full: "Мест нет",
	cancelled: "Отменён",
};

/** Категории тарифов. */
export const TARIFF_CATEGORY_LABELS: Record<string, string> = {
	ticket: "Билеты",
	service: "Дополнительные услуги",
	benefit: "Льготы",
};

export const TARIFF_CATEGORY_TITLES: Record<string, string> = {
	ticket: "Билеты на посещение",
	service: "Дополнительные услуги",
	benefit: "Льготы",
};

/* ------------------------------------------------------------------ */
/*  Тарификация                                                        */
/* ------------------------------------------------------------------ */

/**
 * Правила тарифов — те же самые, что проверяет сервер при сохранении
 * брони. Держать их здесь нужно, чтобы форма не предлагала тариф,
 * который сервер всё равно отклонит.
 */
export interface TariffLike {
	adultPercent?: number | null;
	childPercent?: number | null;
	minGuests?: number | null;
	minAdults?: number | null;
	minChildren?: number | null;
}

/** Цена одного места по тарифу: процент от цены сеанса, округление до рубля. */
export const seatPrice = (sessionPrice: number, percent?: number | null): number => {
	const share = typeof percent === "number" && percent >= 0 ? percent : 100;
	return Math.round((sessionPrice * share) / 100);
};

/**
 * Подходит ли тариф под состав гостей.
 *
 * Возвращает причину отказа, а не просто false: гостю нужно объяснить,
 * почему тариф недоступен, иначе он решит, что сайт сломан.
 */
export const tariffAvailability = (
	tariff: TariffLike,
	adults: number,
	children: number
): { ok: true } | { ok: false; reason: string } => {
	const reasons: string[] = [];

	if ((tariff.minGuests ?? 0) > 0 && adults + children < tariff.minGuests!) {
		reasons.push(`от ${tariff.minGuests} человек`);
	}
	if ((tariff.minAdults ?? 0) > 0 && adults < tariff.minAdults!) {
		reasons.push(`от ${tariff.minAdults} взрослого`);
	}
	if ((tariff.minChildren ?? 0) > 0 && children < tariff.minChildren!) {
		reasons.push(`от ${tariff.minChildren} детей`);
	}

	return reasons.length ? { ok: false, reason: reasons.join(", ") } : { ok: true };
};

/** Итог по тарифу для состава гостей. */
export const tariffTotal = (
	tariff: TariffLike,
	sessionPrice: number,
	adults: number,
	children: number
): number =>
	adults * seatPrice(sessionPrice, tariff.adultPercent) +
	children * seatPrice(sessionPrice, tariff.childPercent);

/** Тип элемента галереи. */
export const GALLERY_MEDIA_LABELS: Record<string, string> = {
	image: "Фото",
	video: "Видео",
};

/** Формат даты для расписания. */
export const formatSessionDate = (value: string): string => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		weekday: "short",
	}).format(date);
};

/** «14:00:00» -> «14:00» */
export const formatTime = (value: string): string => value?.slice(0, 5) ?? "";

/** Формат полной даты для карточек. */
export const formatFullDate = (value: string): string => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return new Intl.DateTimeFormat("ru-RU", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
};