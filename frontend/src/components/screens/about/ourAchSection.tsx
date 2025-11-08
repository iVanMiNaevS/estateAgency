import React from "react";
import styles from "@/app/(withHeaderFooter)/about/about.module.scss";

type props = {
	sectionId: string;
};

export const OurAchSection = ({sectionId}: props) => {
	const achs = [
		{
			title: "Более 3-х лет безупречной работы",
			text: "За более чем 3-летний опыт работы в отрасли мы накопили огромный багаж знаний и опыта, став незаменимым ресурсом по всем вопросам, связанным с недвижимостью.",
		},
		{
			title: "Довольные клиенты",
			text: "Нашим главным достижением является удовлетворенность наших клиентов. Их истории успеха подпитывают нашу страсть к тому, что мы делаем.",
		},
		{
			title: "Признание в отрасли",
			text: "Мы заслужили уважение наших коллег и лидеров отрасли благодаря почестям и наградам, которые отражают наше стремление к совершенству.",
		},
	];
	return (
		<section id={sectionId} className={styles.ourAchSection}>
			<div className={styles.ourAchSection__top}>
				<h2 className="h2">Нащи достижения</h2>
				<p>
					За годы работы мы не просто закрывали сделки — мы создавали истории. Но главное наше
					достижение — не цифры, а ваши эмоции в день, когда ключи наконец оказываются в ваших
					руках.
				</p>
			</div>
			<div className={styles.ourAchSection__body}>
				{achs.map((ach) => {
					return (
						<div className={styles.ourAchSection__bodyItem}>
							<h3>{ach.title}</h3>
							<p>{ach.text}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
};
