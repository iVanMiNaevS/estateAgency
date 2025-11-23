import {HeroSection} from "@/components/screens/home/heroSection";
import {CardTextLogoSection} from "@/components/screens/home/cardTextLogoSection";
import {RecomendedEstateSection} from "@/components/screens/home/recomendedEstateSection";
import {ReviewsSection} from "@/components/screens/home/reviewsSection";
import {FaqSection} from "@/components/screens/home/faqSection";
import {getScreenInfo} from "@/services/getInfo";
import {IMainScreen} from "@/types/screens/mainScreen.interface";
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata> {
	try {
		const data = await getScreenInfo<IMainScreen>("main-screen", [
			"heroSection.image",
			"recomendedSection.estates.poster",
			"recomendedSection.estates.options.icon",
			"reviewsSection.reviews.user.avatar",
			"faqSection.questions",
			"seo",
		]);
		const seoData = data.data.seo;

		return {
			title: seoData?.title || "ЭлитДом - Недвижимость вашей мечты",
			description: seoData?.description || "Лучшие предложения на рынке недвижимости",
		};
	} catch (error) {
		return {
			title: "ЭлитДом - Недвижимость вашей мечты",
			description: "Лучшие предложения на рынке недвижимости",
		};
	}
}

export default async function Home() {
	const data = await getScreenInfo<IMainScreen>("main-screen", [
		"heroSection.image",
		"recomendedSection.estates.poster",
		"recomendedSection.estates.options.icon",
		"reviewsSection.reviews.user.avatar",
		"faqSection.questions",
		"seo",
	]);
	return (
		<main className="">
			<HeroSection sectionId="main-heroSection" data={data.data} />
			<CardTextLogoSection sectionId="main-cardTextLogoSection" />
			<RecomendedEstateSection sectionId="main-recomendedEstateSection" data={data.data} />
			<ReviewsSection sectionId="main-reviewsSection" data={data.data} />
			<FaqSection sectionId="main-faqSection" data={data.data} />
		</main>
	);
}
