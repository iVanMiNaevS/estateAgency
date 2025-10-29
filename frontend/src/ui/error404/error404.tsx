import React from "react";
import styles from "./error404.module.scss";
export const Error404 = () => {
	return (
		<div className={styles.container}>
			<div className={styles.containerText}>
				404 <p>страница не найдена</p>
			</div>
		</div>
	);
};
