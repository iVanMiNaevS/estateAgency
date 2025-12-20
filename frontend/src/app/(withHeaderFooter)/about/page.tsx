import {OurAchSection} from "@/components/screens/about/ourAchSection";
import {OurValuesSection} from "@/components/screens/about/ourValuesSection";
import {OurWaySection} from "@/components/screens/about/ourWaySection";
import React from "react";

const Page = () => {
	return (
		<main>
			<OurWaySection sectionId="about-ourWaySection" />
			<div className="container">
				<OurAchSection sectionId="about-ourAch" />
				<OurValuesSection sectionId="about-ourValuesSection" />
			</div>
		</main>
	);
};
export default Page;
