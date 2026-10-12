import type { Metadata } from "next";
import { getObjects } from "@/services/getInfo";
import type { ITicketPrice } from "@/types/park.interface";
import { BookingForm } from "@/components/forms/booking-form";
import type { ISession } from "@/types/park.interface";
import { AGE_RULE_TEXT, TARIFF_CATEGORY_TITLES } from "@/constants/park";
import styles from "./prices.module.scss";

export const metadata: Metadata = {
	title: "Цены на билеты — Парк Чудес",
	description:
		"Стоимость взрослых, детских, семейных и групповых билетов, дополнительные услуги и льготы парка развлечений.",
};

/**
 * Карточка одного тарифа.
 *
 * Вынесена отдельной функцией намеренно: внутри разметки страницы
 * вложенные тернарники и вычисления превращались в нечитаемую
 * простыню и ломали разбор JSX. Здесь всё считается до разметки.
 */
const TariffCard = ({ tariff }: { tariff: ITicketPrice }) => {
	const rules: string[] = [];

	if ((tariff.minGuests ?? 0) > 0) rules.push(`от ${tariff.minGuests} человек`);
	if ((tariff.minAdults ?? 0) > 0) rules.push(`от ${tariff.minAdults} взрослого`);
	if ((tariff.minChildren ?? 0) > 0) rules.push(`от ${tariff.minChildren} детей`);

	return (
		<article className={tariff.isPopular ? styles.cardPopular : styles.card}>
			{tariff.isPopular && <span className={styles.badge}>Выгодно</span>}

			<h3 className={styles.cardTitle}>{tariff.title}</h3>

			{/* Билет — это процент от цены аттракциона, а не своя
			    сумма: у каждого аттракциона цена своя. */}
			{tariff.category === "ticket" ? (
				<p className={styles.price}>
					Взрослый — {tariff.adultPercent ?? 100}% цены
					<span className={styles.split}>
						Ребёнок — {tariff.childPercent ?? 100}% цены
					</span>
				</p>
			) : (
				<p className={styles.price}>{tariff.price.toLocaleString("ru-RU")} ₽</p>
			)}

			{rules.length > 0 && (
				<p className={styles.rules}>Действует при {rules.join(", ")}</p>
			)}

			{tariff.description && <p className={styles.description}>{tariff.description}</p>}

			{(tariff.includes?.length ?? 0) > 0 && (
				<ul className={styles.includes}>
					{tariff.includes?.map((item) => (
						<li key={item.id}>{item.text}</li>
					))}
				</ul>
			)}

			{tariff.cancelPolicy && (
				<p className={styles.cancel}>Отмена: {tariff.cancelPolicy}</p>
			)}
		</article>
	);
};

/**
 * Тарифы (ТЗ F-1.4).
 *
 * Категории повторяют значения из content-type ticket-price, поэтому
 * новый тариф из админки попадёт в нужную группу автоматически.
 */
const Page = async () => {
	const result = await getObjects<ITicketPrice>("ticket-prices", ["includes"]);
	const tariffs = result.data ?? [];

	const sessions = await getObjects<ISession>(
		"sessions",
		["attraction"],
		undefined,
		[{ params: "pageSize", value: 20 }]
	);

	const groups = ["ticket", "service", "benefit"] as const;

	// Цена берётся из сеансов: она своя у каждого аттракциона,
	// а в тарифе хранится процент от неё.
	const attractionPrices = Array.from(
		new Map(
			(sessions.data ?? [])
				.map((session) => ({
					title: session.attraction?.title ?? "Аттракцион",
					price: session.price ?? 0,
				}))
				.filter((item) => item.title !== "Аттракцион")
				.map((item) => [item.title, item] as const)
		).values()
	).sort((a, b) => a.title.localeCompare(b.title));

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">Цены на билеты</h1>
					<p className={styles.lead}>
						Стоимость зависит от тарифа и сеанса. Итоговую сумму по записи считает
						сервер, оплата — в кассе парка при посещении.
					</p>
				</div>
			</section>

			{/* Цены по аттракционам: проценты тарифов считаются именно
			    от этих сумм, поэтому показать их нужно до списка тарифов. */}
			<section>
				<div className="container">
					<h2 className="h2">Сколько стоит посещение</h2>
					<p className={styles.lead}>
						Цена зависит от аттракциона. Тарифы ниже — это скидка от этих сумм.
					</p>
					<p className={styles.ageRule}>{AGE_RULE_TEXT}</p>

					<div className={styles.attractionsGrid}>
						{attractionPrices.map((item) => (
							<article key={item.title} className={styles.attractionCard}>
								<h3>{item.title}</h3>
								<p className={styles.attractionPrice}>
									{item.price > 0
										? `${item.price.toLocaleString("ru-RU")} ₽ за гостя`
										: "Бесплатно"}
								</p>
								{item.price > 0 && (
									<p className={styles.attractionNote}>
										Семейный: ребёнок {Math.round(item.price / 2).toLocaleString("ru-RU")} ₽
									</p>
								)}
							</article>
						))}
					</div>
				</div>
			</section>

			<section>
				<div className="container">
					{groups.map((group) => {
						const items = tariffs.filter((tariff) => tariff.category === group);
						if (items.length === 0) return null;

						return (
							<div key={group} className={styles.group}>
								<h2 className="h2">{TARIFF_CATEGORY_TITLES[group]}</h2>

								<div className={styles.grid}>
									{items.map((tariff) => (
										<TariffCard key={tariff.id} tariff={tariff} />
									))}
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<section className={styles.bookingSection}>
				<div className={styles.bookingGrid}>
					<div>
						<h2 className="h2">Уже выбрали тариф?</h2>
						<p className={styles.lead}>Запишитесь на сеанс — бронь бесплатная.</p>
					</div>
					<BookingForm sessions={sessions.data ?? []} tariffs={tariffs.filter((t) => t.category === "ticket")} />
				</div>
			</section>
		</main>
	);
};

export default Page;