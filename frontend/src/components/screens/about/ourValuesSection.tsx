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
			title: "Прозрачность",
			text: "Мы не скрываем отчёты и не манипулируем цифрами. Каждый клиент видит, куда уходит бюджет и какие результаты мы получаем. Честность — основа наших отношений.",
		},
		{
			icon: head,
			title: "Экспертность",
			text: "Мы постоянно учимся, тестируем новые гипотезы и следим за трендами. Наши знания — это ваш рост. Мы не даём обещаний, которые не можем выполнить.",
		},
		{
			icon: team,
			title: "Клиентоцентричность",
			text: "Ваш бизнес — наша главная забота. Мы не навязываем ненужные услуги, а предлагаем только то, что действительно принесёт результат. Ваш успех — наш успех.",
		},
		{
			icon: star,
			title: "Ответственность",
			text: "Мы отвечаем за каждую настройку, каждое объявление и каждый потраченный рубль. Если мы берёмся за проект — мы доводим его до результата, несмотря на сложности.",
		},
	];
	return (
		<section id={sectionId} className={styles.ourValuesSection}>
			<div className={styles.ourValuesSection__text}>
				<h2 className="h2">Наши ценности</h2>
				<p className={styles.ourValuesSection__desc}>
					Маркетинг — это не просто инструмент для продаж. Это способ рассказать миру о вашем бизнесе, 
					найти свою аудиторию и построить доверие. Мы подходим к работе с душой, потому что за каждым 
					проектом стоят реальные люди, их мечты и амбиции.
				</p>
			</div>
			<div className={styles.ourValuesSection__values}>
				{values.map((value, index) => {
					const rowNumber = Math.floor(index / 2);
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
