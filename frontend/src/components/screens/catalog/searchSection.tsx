import React from "react";
import styles from "../../../app/catalog/catalog.module.scss";

export const SearchSection = () => {
	return (
		<section className={styles.searchSection}>
			<div className={styles.bg}></div>
			<div className="container">
				<div className={styles.textContainer}>
					<h1 className="h2">Найдите недвижемость своей мечты</h1>
					<p>
						Добро пожаловать в ЭлитДом, где в каждом уголке нашего прекрасного мира вас ждет
						недвижимость вашей мечты. Ознакомьтесь с нашей тщательно отобранной подборкой объектов
						недвижимости, каждый из которых имеет уникальную историю и возможность переосмыслить
						вашу жизнь. Категории, подходящие для каждого мечтателя, помогут вам в путешествии
					</p>
				</div>
				<form action="">
					<input type="text" placeholder="Поиск недвижемости" />
					<button className="btn btn-purple">Найти недвижимость</button>
				</form>
			</div>
		</section>
	);
};
