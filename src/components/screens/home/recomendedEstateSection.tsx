import React from "react";
import styles from "../../../app/(home)/home.module.scss";
import Link from "next/link";
import {AppRouter} from "@/AppRouter";
export const RecomendedEstateSection = () => {
	return (
		<section className={styles.recSection + " container"}>
			<div className={styles.recSection__top}>
				<h2 className="h2">Рекомендуемая недвижемость</h2>
				<p>
					<span>
						Ознакомьтесь с нашей тщательно отобранной подборкой объектов недвижимости. Каждое
						объявление дает представление об исключительных домах и инвестициях, доступных через
						ЭлитДом. Нажмите "Просмотреть подробности" для получения дополнительной информации.
					</span>
					<Link className="buttonLink" href={AppRouter.catalog}>
						Посмотреть все объекты
					</Link>
				</p>
			</div>
		</section>
	);
};
