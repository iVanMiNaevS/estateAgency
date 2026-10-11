import type { Metadata } from "next";
import styles from "./page.module.scss";

/**
 * Источники фотографий.
 *
 * Страница не декоративная: лицензии CC BY и CC BY-SA требуют
 * указать автора и условия использования. Список собирает
 * скрипт estateStrapi/scripts/download-sources.js из
 * image-sources.js — вручную он не поддерживается.
 */

interface ICredit {
	title: string;
	author: string;
	license: string;
	url: string;
}

const credits: ICredit[] = require("@/constants/image-credits.json");

export const metadata: Metadata = {
	title: "Источники изображений — Парк Чудес",
	description:
		"Фотографии аттракционов взяты с Wikimedia Commons с указанием авторов и лицензий.",
};

const LICENSE_HINTS: Record<string, string> = {
	"CC0": "общественное достояние, attribution не требуется",
	"Public domain": "общественное достояние, attribution не требуется",
	"CC BY": "требуется указание автора",
	"CC BY-SA": "требуется указание автора и та же лицензия для изменённых работ",
};

export default function CreditsPage() {
	return (
		<div className="container">
			<h1 className="h1">Источники изображений</h1>

			<p className={styles.lead}>
				Фотографии взяты с Wikimedia Commons. Условия Creative Commons требуют
				указать автора и лицензию, поэтому список приведён полностью.
			</p>

			<ul className={styles.list}>
				{credits.map((credit) => (
					<li key={credit.title} className={styles.item}>
						<a href={credit.url} target="_blank" rel="noreferrer noopener">
							{credit.title}
						</a>
						<div className={styles.meta}>
							<span className={styles.author}>{credit.author}</span>
							<span className={styles.license}>{credit.license}</span>
						</div>
						{LICENSE_HINTS[credit.license] && (
							<p className={styles.hint}>{LICENSE_HINTS[credit.license]}</p>
						)}
					</li>
				))}
			</ul>

			<p className={styles.footnote}>
				Полный список с исходными файлами:{" "}
				<code>estateStrapi/scripts/IMAGE-CREDITS.md</code>. Если фотографию
				заменяете своей — удалите её из этого списка.
			</p>
		</div>
	);
}