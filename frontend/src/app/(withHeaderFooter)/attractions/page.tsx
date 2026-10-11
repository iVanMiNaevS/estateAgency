import type { Metadata } from "next";
import Link from "next/link";
import { getObjects } from "@/services/getInfo";
import type { IAttraction } from "@/types/park.interface";
import { CardAttraction } from "@/ui/card-attraction/card-attraction";
import { ATTRACTION_TYPES } from "@/constants/park";
import styles from "./attractions.module.scss";

export const metadata: Metadata = {
	title: "Аттракционы — Парк Чудес",
	description:
		"Каталог аттракционов парка: экстремальные, семейные и детские. Ограничения по росту и возрасту, длительность и стоимость.",
};

/**
 * Каталог аттракционов (ТЗ F-1.3).
 *
 * Фильтр по типу передаётся в адресной строке, поэтому подборку
 * можно отправить ссылкой, а серверный компонент сразу рендерит
 * нужный список — без запроса из браузера.
 */
const Page = async ({
	searchParams,
}: {
	searchParams: Promise<{ type?: string }>;
}) => {
	const params = await searchParams;
	const activeType = ATTRACTION_TYPES.some((t) => t.value === (params.type ?? ""))
		? (params.type ?? "")
		: "";

	const result = await getObjects<IAttraction>("attractions", ["poster"], [
		{ filter: "$eq", field: "isActive", value: "true" },
	]);

	const all = result.data ?? [];
	const list = activeType
		? all.filter((item) => item.type === activeType)
		: all;

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">Аттракционы</h1>
					<p className={styles.lead}>
						{all.length} аттракционов для любого возраста. Ограничения по росту и
						возрасту указаны в карточке — проверьте их перед покупкой билета.
					</p>
				</div>
			</section>

			<section className={styles.catalog}>
				<div className="container">
					<nav className={styles.filters} aria-label="Фильтр по типу">
						{ATTRACTION_TYPES.map((type) => {
							const isActive = type.value === activeType;

							return (
								<Link
									key={type.value}
									href={type.value ? `/attractions?type=${type.value}` : "/attractions"}
									className={isActive ? styles.filterActive : styles.filter}
									aria-current={isActive ? "page" : undefined}
								>
									{type.label}
								</Link>
							);
						})}
					</nav>

					{list.length === 0 ? (
						<p className={styles.empty}>Аттракционов этого типа пока нет.</p>
					) : (
						<div className={styles.grid}>
							{list.map((attraction) => (
								<CardAttraction
									key={attraction.id}
									attraction={attraction}
									href={`/attractions/${attraction.slug}`}
								/>
							))}
						</div>
					)}
				</div>
			</section>
		</main>
	);
};

export default Page;