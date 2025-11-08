import React from "react";

import styles from "@/app/(withHeaderFooter)/about/about.module.scss";

import star from "@/../public/icons/starPurple.svg";
import head from "@/../public/icons/head.svg";
import team from "@/../public/icons/team.svg";
import Image from "next/image";

type props = {
	sectionId: string;
};

export const OurValuesSection = ({sectionId}: props) => {
	const values = [
		{
			icon: star,
			title: "Доверять",
			text: "Доверие является краеугольным камнем любой успешной сделки с недвижимостью.",
		},
		{
			icon: head,
			title: "Улучшение",
			text: "Мы устанавливаем для себя высокую планку. Начиная с объектов недвижимости, которые мы перечисляем, и заканчивая услугами, которые мы предоставляем.",
		},
		{
			icon: team,
			title: "Клиентоориентированность",
			text: "Ваши мечты и потребности находятся в центре нашей вселенной. Мы слушаем и понимаем.",
		},
		{
			icon: star,
			title: "Наше обязательство",
			text: "Мы стремимся предоставить вам высочайший уровень обслуживания, профессионализма и поддержки.",
		},
	];
	return (
		<section id={sectionId} className={styles.ourValuesSection}>
			<div className={styles.ourValuesSection__text}>
				<h2 className="h2">Наши достижения</h2>
				<p className={styles.ourValuesSection__desc}>
					Мы верим, что недвижимость — это не просто стены и документы. Это место, где рождаются
					воспоминания, строятся планы и меняются судьбы. Поэтому в основе нашей работы — не
					холодный расчет, а человеческое отношение. Мы ищем не идеальный дом, а идеальный дом для
					вас
				</p>
			</div>
			<div className={styles.ourValuesSection__values}>
				{values.map((value, index) => {
					const rowNumber = Math.floor(index / 2); // Номер ряда (0, 1, 2...)
					const isEvenRow = rowNumber % 2 === 0;
					return (
						<div
							key={index}
							className={
								styles.value +
								` ${(index + 1) % 2 !== 0 && styles.borderRight}` +
								` ${!isEvenRow && styles.borderTop}`
							}
						>
							<div className={styles.value__top}>
								<Image src={value.icon} alt="icon" />
								<h4>{value.title}</h4>
							</div>
							<p>{value.text}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
};
