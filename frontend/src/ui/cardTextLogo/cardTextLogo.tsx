import React from "react";
import styles from "./cardTextLogo.module.scss";
import Image from "next/image";

import {StaticImport} from "next/dist/shared/lib/get-img-props";

export type typeCardTextLogo = {
	logo: StaticImport | string;
	text: string;
};

export const CardTextLogo = ({logo, text}: typeCardTextLogo) => {
	return (
		<div className={styles.container}>
			<Image src={logo} alt="logo" />
			<p>{text}</p>
		</div>
	);
};
