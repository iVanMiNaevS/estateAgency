import type { Metadata } from "next";
import { getObjects } from "@/services/getInfo";
import type { ITicketPrice } from "@/types/park.interface";
import { BookingForm } from "@/components/forms/booking-form";
import type { ISession } from "@/types/park.interface";
import { TARIFF_CATEGORY_TITLES } from "@/constants/park";
import styles from "./prices.module.scss";

export const metadata: Metadata = {
	title: "Цены на билеты — Парк Чудес",
	description:
		"Стоимость взрослых, детских, семейных и групповых билетов, дополнительные услуги и льготы парка развлечений.",
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
										<article
											key={tariff.id}
											className={
												tariff.isPopular ? styles.cardPopular : styles.card
											}
										>
											{tariff.isPopular && <span className={styles.badge}>Выгодно</span>}

											<h3 className={styles.cardTitle}>{tariff.title}</h3>

											<p className={styles.price}>
												{tariff.oldPrice ? (
													<>
														<span className={styles.oldPrice}>
															{tariff.oldPrice.toLocaleString("ru-RU")} ₽
														</span>
														{tariff.price.toLocaleString("ru-RU")} ₽
													</>
												) : (
													<>
														{tariff.price.toLocaleString("ru-RU")} ₽
														{(tariff.adultPrice ?? 0) > 0 && (tariff.childPrice ?? 0) > 0 && (
															<span className={styles.split}>
																 взрослый {tariff.adultPrice?.toLocaleString("ru-RU")} ₽,
																ребёнок {tariff.childPrice?.toLocaleString("ru-RU")} ₽
															</span>
														)}
													</>
												)}
											</p>

											{tariff.description && (
												<p className={styles.description}>{tariff.description}</p>
											)}

											{(tariff.includes?.length ?? 0) > 0 && (
												<ul className={styles.includes}>
													{tariff.includes?.map((item) => (
														<li key={item.id}>{item.text}</li>
													))}
												</ul>
											)}

											{tariff.cancelPolicy && (
												<p className={styles.cancel}>
													Отмена: {tariff.cancelPolicy}
												</p>
											)}
										</article>
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
					<BookingForm sessions={sessions.data ?? []} attractions={[]} />
				</div>
			</section>
		</main>
	);
};

export default Page;