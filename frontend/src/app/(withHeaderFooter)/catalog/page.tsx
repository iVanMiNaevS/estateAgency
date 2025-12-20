import {CatalogSection} from "@/components/screens/catalog/catalogSection";
import {ConnSection} from "@/components/screens/catalog/connSection";
import {SearchSection} from "@/components/screens/catalog/searchSection";
import {getObjects} from "@/services/getInfo";
import {IEstate} from "@/types/estate.interface";
import React from "react";
import styles from './catalog.module.scss'
export const Metadata = {
	title: "ЭлитДом - Каталог",
};

const Page = async () => {
	const data = await getObjects<IEstate>("estates", ["poster", "options.icon"]);
	return (
		<main>
			<SearchSection sectionId="catalog-catalogSearch" />
			<CatalogSection data={data} sectionId="catalog-catalogSection" />
			<ConnSection sectionId="catalog-connSection" />
		</main>
	);
};

export default Page;
