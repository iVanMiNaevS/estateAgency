import { HeroSection } from "@/components/screens/home/heroSection";
import { CardTextLogoSection } from "@/components/screens/home/cardTextLogoSection";
import { RecomendedAttractionSection } from "@/components/screens/home/recomendedAttractionSection";
import { ReviewsSection } from "@/components/screens/home/reviewsSection";
import { FaqSection } from "@/components/screens/home/faqSection";
import { getScreenInfo } from "@/services/getInfo";
import { IMainScreen } from "@/types/screens/mainScreen.interface";
import { Metadata } from "next";

/**
 * Поля главной страницы: состав вынесён в константу,
 * чтобы метаданные и рендер запрашивали одинаковые данные.
 */
const POPULATE = [
	"heroSection.image",
	"recomendedSection.attractions.poster",
	"reviewsSection.reviews.user.avatar",
	"faqSection.questions",
	"seo",
];

const FALLBACK_TITLE = "Парк Чудес — отдых и адреналин в Рязани";
const FALLBACK_DESCRIPTION =
	"Семейный парк развлечений: аттракционы для детей и взрослых, онлайн-запись без очередей.";

export async function generateMetadata(): Promise<Metadata> {
	try {
		const data = await getScreenInfo<IMainScreen>("main-screen", POPULATE);
		const seoData = data.data?.seo;

		return {
			title: seoData?.title || FALLBACK_TITLE,
			description: seoData?.description || FALLBACK_DESCRIPTION,
		};
	} catch {
		return { title: FALLBACK_TITLE, description: FALLBACK_DESCRIPTION };
	}
}

export default async function Home() {
	const data = await getScreenInfo<IMainScreen>("main-screen", POPULATE);
	const screen = data.data;

	return (
		<main>
			<HeroSection sectionId="main-heroSection" data={screen} />
			<CardTextLogoSection sectionId="main-cardTextLogoSection" />
			<RecomendedAttractionSection
				sectionId="main-recomendedAttractionSection"
				attractions={screen?.recomendedSection?.attractions}
				title={screen?.recomendedSection?.title}
				description={screen?.recomendedSection?.description}
			/>
			<ReviewsSection sectionId="main-reviewsSection" data={screen} />
			<FaqSection sectionId="main-faqSection" data={screen} />
		</main>
	);
}