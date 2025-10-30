import Image from "next/image";
import styles from "./home.module.css";
import {HeroSection} from "@/components/screens/home/heroSection";
import {CardTextLogoSection} from "@/components/screens/home/cardTextLogoSection";
import {RecomendedEstateSection} from "@/components/screens/home/recomendedEstateSection";
import {ReviewsSection} from "@/components/screens/home/reviewsSection";
import {FaqSection} from "@/components/screens/home/faqSection";
import {getScreenInfo} from "@/services/getScreenInfo";
import {IMainScreen} from "@/types/screens/mainScreen.interface";

export default async function Home() {
	const data = await getScreenInfo<IMainScreen>("main-screen", [
		"heroSection.image",
		"recomendedSection.estates.poster",
		"reviewsSection.reviews.user",
		"faqSection.questions",

		"seo",
	]);
	console.log(data);
	return (
		<div className="">
			<HeroSection sectionId="main-heroSection" data={data.data} />
			<CardTextLogoSection sectionId="main-cardTextLogoSection" />
			<RecomendedEstateSection sectionId="main-recomendedEstateSection" />
			<ReviewsSection sectionId="main-reviewsSection" />
			<FaqSection sectionId="main-faqSection" />
		</div>
	);
}
