import React from "react";
import styles from "../../../app/(home)/home.module.scss";
import homeLogo from "@/../public/icons/home.svg";
import buildingLogo from "@/../public/icons/building.svg";
import sunLogo from "@/../public/icons/sun.svg";
import webcamLogo from "@/../public/icons/webCam.svg";
import {CardTextLogo, typeCardTextLogo} from "@/ui/cardTextLogo/cardTextLogo";

export const CardTextLogoSection = ({sectionId}: {sectionId: string}) => {
	const cards: typeCardTextLogo[] = [
		{logo: homeLogo, text: "Найдите дом своей мечты"},
		{logo: webcamLogo, text: "Разблокируйте  недвижемость"},
		{logo: buildingLogo, text: "Простое управление недвижимостью"},
		{logo: sunLogo, text: "Разумные инвестиции"},
	];
	return (
		<section id={sectionId} className={styles.cardsTextLogoSection}>
			{cards.map((card) => {
				return <CardTextLogo key={card.text} logo={card.logo} text={card.text} />;
			})}
		</section>
	);
};
