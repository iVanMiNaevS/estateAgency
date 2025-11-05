import {CatalogSection} from "@/components/screens/catalog/catalogSection";
import {ConnSection} from "@/components/screens/catalog/connSection";
import {SearchSection} from "@/components/screens/catalog/searchSection";
import {getObjects, getScreenInfo} from "@/services/getScreenInfo";
import {IEstate} from "@/types/estate.interface";
import {title} from "process";
import React from "react";

export const Metadata = {
	title: "ЭлитДом - Каталог",
};

const Page = async () => {
	const data = await getObjects<IEstate>("estates", ["poster", "options.icon"]);
	return (
		<>
			<SearchSection />;
			<CatalogSection data={data} sectionId="#catalog-catalogSection" />
			<ConnSection />
		</>
	);
};

export default Page;
