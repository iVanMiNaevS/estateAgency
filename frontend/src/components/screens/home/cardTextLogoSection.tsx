import React from "react";
import styles from "../../../app/(withHeaderFooter)/(home)/home.module.scss";
import homeLogo from "@/../public/icons/home.svg";
import buildingLogo from "@/../public/icons/building.svg";
import sunLogo from "@/../public/icons/sun.svg";
import webcamLogo from "@/../public/icons/webCam.svg";
import {CardTextLogo, typeCardTextLogo} from "@/ui/cardTextLogo/cardTextLogo";

export const CardTextLogoSection = ({sectionId}: {sectionId: string}) => {
	const cards: typeCardTextLogo[] = [
		{logo: homeLogo, text: "Найдем клиентов для вашего бизнеса"},
		{logo: webcamLogo, text: "Откроем новые каналы продаж"},
		{logo: buildingLogo, text: "Построим эффективную стратегию"},
		{logo: sunLogo, text: "Умные вложения в реклам"},
	];
	return (
		<section id={sectionId} className={styles.cardsTextLogoSection}>
			{cards.map((card) => {
				return <CardTextLogo key={card.text} logo={card.logo} text={card.text} />;
			})}
		</section>
	);
};
