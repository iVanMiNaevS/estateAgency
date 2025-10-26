import Image from "next/image";
import styles from "./home.module.css";
import {HeroSection} from "@/components/screens/home/heroSection";
import {CardTextLogoSection} from "@/components/screens/home/cardTextLogoSection";
import {RecomendedEstateSection} from "@/components/screens/home/recomendedEstateSection";
import {ReviewsSection} from "@/components/screens/home/reviewsSection";
import {FaqSection} from "@/components/screens/home/faqSection";

export default function Home() {
	return (
		<div className="">
			<HeroSection />
			<CardTextLogoSection />
			<RecomendedEstateSection />
			<ReviewsSection />
			<FaqSection />
		</div>
	);
}
