import React from "react";
import styles from "@/app/(withHeaderFooter)/about/about.module.scss";

type props = {
	sectionId: string;
};

export const OurAchSection = ({sectionId}: props) => {
	const achs = [
		{
			title: "250+ успешно реализованных проектов",
			text: "За годы работы мы помогли десяткам компаний из разных сфер — от малого бизнеса до крупных брендов. Каждый проект — это уникальная задача, которую мы решили с максимальной эффективностью.",
		},
		{
			title: "98% клиентов возвращаются к нам снова",
			text: "Мы гордимся тем, что большинство наших клиентов становятся постоянными партнёрами. Доверие и прозрачность — главные принципы, за которые нас ценят и рекомендуют коллегам.",
		},
		{
			title: "Признание в профессиональном сообществе",
			text: "Нас знают как экспертов в digital-маркетинге. Мы регулярно выступаем на отраслевых конференциях, делимся опытом в профильных изданиях и входим в рейтинги лучших агентств.",
		},
	];
	return (
		<section id={sectionId} className={styles.ourAchSection}>
			<div className={styles.ourAchSection__top}>
				<h2 className="h2">Наши достижения</h2>
				<p>
					Мы измеряем успех не количеством запущенных кампаний, а реальными результатами наших клиентов. 
					Каждый проект — это шаг к новой победе, которую мы разделяем вместе с вами.
				</p>
			</div>
			<div className={styles.ourAchSection__body}>
				{achs.map((ach) => {
					return (
						<div key={ach.title} className={styles.ourAchSection__bodyItem}>
							<h3>{ach.title}</h3>
							<p>{ach.text}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
};
