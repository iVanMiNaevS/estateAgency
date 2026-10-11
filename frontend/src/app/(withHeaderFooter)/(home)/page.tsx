import { HeroSection } from "@/components/screens/home/heroSection";
import { AdvantagesSection } from "@/components/screens/home/advantages-section";
import { RecomendedAttractionSection } from "@/components/screens/home/recomendedAttractionSection";
import { NewsSection } from "@/components/screens/home/news-section";
import { ReviewsSection } from "@/components/screens/home/reviewsSection";
import { FaqSection } from "@/components/screens/home/faqSection";
import { SiteSearch } from "@/components/forms/site-search";
import { getScreenInfo } from "@/services/getInfo";
import { IMainScreen } from "@/types/screens/mainScreen.interface";
import { Metadata } from "next";

/**
 * Поля главной страницы: состав вынесен в константу,
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

/**
 * Главная страница (ТЗ F-1.1).
 *
 * Все блоки заполняются из админки Strapi и подставляются только
 * при наличии данных: пустая секция не рисуется, поэтому главная
 * не ломается, пока контент ещё не заведён.
 */
export default async function Home() {
	const data = await getScreenInfo<IMainScreen>("main-screen", POPULATE);
	const screen = data.data;

	return (
		<main>
			<HeroSection sectionId="main-heroSection" data={screen} />

			<AdvantagesSection
				sectionId="main-advantagesSection"
				title={screen?.advantagesSection?.title}
				advantages={screen?.advantagesSection?.advantages}
			/>

			<RecomendedAttractionSection
				sectionId="main-recomendedAttractionSection"
				attractions={screen?.recomendedSection?.attractions}
				title={screen?.recomendedSection?.title}
				description={screen?.recomendedSection?.description}
			/>

			<NewsSection
				sectionId="main-newsSection"
				title={screen?.newsSection?.title}
			/>

			<ReviewsSection sectionId="main-reviewsSection" data={screen} />
			<FaqSection sectionId="main-faqSection" data={screen} />

			<section id="main-searchSection">
				<div className="container">
					<h2 className="h2">Поиск по парку</h2>
					<SiteSearch />
				</div>
			</section>
		</main>
	);
}