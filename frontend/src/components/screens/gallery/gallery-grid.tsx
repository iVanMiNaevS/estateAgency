"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IGalleryAlbum } from "@/types/park.interface";
import styles from "./gallery-grid.module.scss";

/**
 * Сетка галереи с просмотром фотографии во весь экран.
 *
 * Страница остаётся серверной: она собирает альбомы и отдаёт их
 * сюда, а интерактив держит этот компонент на клиенте.
 *
 * Список кадров плоский — по нему удобно листать стрелками, и он
 * не пересобирается при переключении альбомов.
 */
type Photo = {
	id: string;
	src: string;
	alt: string;
	caption?: string;
	album: string;
};

type Props = {
	albums: IGalleryAlbum[];
};

const toPhoto = (
	src: string,
	alt: string,
	caption: string | null | undefined,
	album: string,
	id: string | number
): Photo => ({ id: String(id), src, alt, caption: caption ?? undefined, album });

const GalleryGrid = ({ albums }: Props) => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const photos: Photo[] = [];
	for (const album of albums) {
		if (album.cover?.url) {
			photos.push(toPhoto(album.cover.url, album.title, undefined, album.title, `cover-${album.id}`));
		}
		for (const item of album.items ?? []) {
			// Видео в просмотре не открываем: там нет кадра, который можно показать.
			if (!item.file?.url || item.mediaType === "video") continue;
			photos.push(
				toPhoto(item.preview?.url ?? item.file.url, item.title ?? album.title, item.caption, album.title, item.id)
			);
		}
	}

	const close = useCallback(() => setOpenIndex(null), []);

	const step = useCallback(
		(delta: number) => {
			setOpenIndex((current) => {
				if (current === null || photos.length === 0) return current;
				return (current + delta + photos.length) % photos.length;
			});
		},
		[photos.length]
	);

	// Пока открыт просмотр, страница не должна прокручиваться под оверлеем.
	useEffect(() => {
		if (openIndex === null) return;

		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
			if (event.key === "ArrowRight") step(1);
			if (event.key === "ArrowLeft") step(-1);
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previous;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [openIndex, close, step]);

	const active = openIndex === null ? null : photos[openIndex] ?? null;

	// Возвращаем фокус на кнопку, из которой открыли просмотр.
	const openerRef = useRef<HTMLButtonElement | null>(null);
	useEffect(() => {
		if (openIndex === null) openerRef.current?.focus();
	}, [openIndex]);

	return (
		<>
			{albums.map((album) => {
				const cover = album.cover?.url ? (
					<figure key={`cover-${album.id}`} className={styles.item}>
						<button
							type="button"
							className={styles.open}
							onClick={() => {
								openerRef.current = document.activeElement as HTMLButtonElement;
								setOpenIndex(photos.findIndex((p) => p.id === `cover-${album.id}`));
							}}
							aria-label={`Открыть «${album.title}» во весь экран`}
						>
							<img src={album.cover!.url} alt={album.title} />
						</button>
					</figure>
				) : null;

				const items = (album.items ?? []).map((item) => {
					if (item.mediaType === "video" && item.file?.url) {
						return (
							<figure key={item.id} className={styles.item}>
								<video
									src={item.file.url}
									poster={item.preview?.url ?? item.file.url}
									controls
									preload="metadata"
								/>
								{item.caption && <figcaption>{item.caption}</figcaption>}
							</figure>
						);
					}

					if (!item.file?.url) return null;

					const index = photos.findIndex((p) => p.id === String(item.id));

					return (
						<figure key={item.id} className={styles.item}>
							<button
								type="button"
								className={styles.open}
								onClick={() => {
									openerRef.current = document.activeElement as HTMLButtonElement;
									setOpenIndex(index);
								}}
								aria-label={`Открыть «${item.title ?? album.title}» во весь экран`}
							>
								<img src={item.preview?.url ?? item.file.url} alt={item.title ?? album.title} />
							</button>
							{item.caption && <figcaption>{item.caption}</figcaption>}
						</figure>
					);
				});

				return (
					<section key={album.id} className={styles.album}>
						<h2 className="h2">{album.title}</h2>
						{album.description && <p className={styles.albumLead}>{album.description}</p>}

						<div className={styles.grid}>
							{cover}
							{items}
						</div>
					</section>
				);
			})}

			{active && (
				<div
					className={styles.overlay}
					role="dialog"
					aria-modal="true"
					aria-label={active.alt}
					onClick={close}
				>
					<button type="button" className={styles.close} onClick={close} aria-label="Закрыть просмотр">
						×
					</button>

					{photos.length > 1 && (
						<>
							<button
								type="button"
								className={`${styles.nav} ${styles.navPrev}`}
								onClick={(event) => {
									event.stopPropagation();
									step(-1);
								}}
								aria-label="Предыдущая фотография"
							>
								‹
							</button>
							<button
								type="button"
								className={`${styles.nav} ${styles.navNext}`}
								onClick={(event) => {
									event.stopPropagation();
									step(1);
								}}
								aria-label="Следующая фотография"
							>
								›
							</button>
						</>
					)}

					<figure className={styles.stage} onClick={(event) => event.stopPropagation()}>
						<img src={active.src} alt={active.alt} />

						<figcaption className={styles.caption}>
							{/* У обложки подпись совпадает с названием альбома — не дублируем. */}
							{active.caption ||
								(active.alt !== active.album ? <span>{active.alt}</span> : null)}
							<span className={styles.meta}>
								{active.album} · {(openIndex ?? 0) + 1} из {photos.length}
							</span>
						</figcaption>
					</figure>
				</div>
			)}
		</>
	);
};

export default GalleryGrid;
