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