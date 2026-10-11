import type { Metadata } from "next";
import { getObjects } from "@/services/getInfo";
import type { IGalleryAlbum } from "@/types/park.interface";
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
						albums.map((album) => (
							<section key={album.id} className={styles.album}>
								<h2 className="h2">{album.title}</h2>
								{album.description && (
									<p className={styles.albumLead}>{album.description}</p>
								)}

								<div className={styles.grid}>
									{album.cover?.url && (
										<figure className={styles.item}>
											<img src={album.cover.url} alt={album.title} />
										</figure>
									)}

									{album.items?.map((item) => (
										<figure key={item.id} className={styles.item}>
											{item.mediaType === "video" && item.file?.url ? (
												<video
													src={item.file.url}
													poster={item.preview?.url ?? item.file.url}
													controls
													preload="metadata"
												/>
											) : (
												<img
													src={item.preview?.url ?? item.file!.url}
													alt={item.title ?? album.title}
												/>
											)}

											{item.caption && (
												<figcaption>{item.caption}</figcaption>
											)}
										</figure>
									))}
								</div>
							</section>
						))
					)}
				</div>
			</section>
		</main>
	);
};

export default Page;