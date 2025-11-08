import {OurAchSection} from "@/components/screens/about/ourAchSection";
import {OurValuesSection} from "@/components/screens/about/ourValuesSection";
import {OurWaySection} from "@/components/screens/about/ourWaySection";
import React from "react";

const Page = () => {
	return (
		<main className="container">
			<OurWaySection sectionId="about-ourWaySection" />
			<OurValuesSection sectionId="about-ourValuesSection" />
			<OurAchSection sectionId="about-ourAch" />
		</main>
	);
};
export default Page;
