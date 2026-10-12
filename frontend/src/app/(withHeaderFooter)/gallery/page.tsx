import type { Metadata } from "next";
import { getObjects } from "@/services/getInfo";
import type { IGalleryAlbum } from "@/types/park.interface";
import GalleryGrid from "@/components/screens/gallery/gallery-grid";
import styles from "./gallery.module.scss";

export const metadata: Metadata = {
	title: "Галерея — Парк Чудес",
	description: "Фотографии и видео парка развлечений: аттракционы, семейная и детская зоны.",
};

/**
 * Галерея (ТЗ F-1.6).
 *
 * Альбомы и элементы приходят из Strapi. Сами файлы загружаются через
 * админку, поэтому элемент без файла не показываем — пустые карточки
 * гостю ничего не дают.
 */
const Page = async () => {
	// REST-путь берётся из pluralName модели api::gallery-album.album,
	// то есть «albums», а не по имени самой папки API.
	const result = await getObjects<IGalleryAlbum>(
		"albums",
		["cover", "items.file", "items.preview"],
		undefined,
		[{ params: "pageSize", value: 50 }]
	);

	const all = result.data ?? [];

	// Элемент без файла не показываем, и альбом без единого файла тоже:
	// гостю пустая сетка ничего не даёт.
	const albums = all
		.map((album) => ({
			...album,
			items: (album.items ?? []).filter((item) => item.file?.url),
		}))
		.filter((album) => album.cover?.url || album.items.length > 0);

	const emptyText =
		all.length === 0
			? "Альбомы пока не созданы. Добавьте их в панели администратора."
			: "Фотографии пока не загружены. Файлы добавляются через панель администратора.";

	return (
		<main>
			<section className={styles.hero}>
				<div className="container">
					<h1 className="h2">Галерея</h1>
					<p className={styles.lead}>
						Как выглядит парк: аттракционы, лодочная дорожка, детская зона и вечерний
						парк.
					</p>
				</div>
			</section>

			<section>
				<div className="container">
					{albums.length === 0 ? (
						<p className={styles.empty}>{emptyText}</p>
					) : (
						<GalleryGrid albums={albums} />
					)}
				</div>
			</section>
		</main>
	);
};

export default Page;