"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./uiSwiper.module.scss";
import {Swiper, SwiperSlide} from "swiper/react";
import {Navigation, Autoplay} from "swiper/modules";

// Импортируем стили Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface UiSwiperProps {
	slides: React.ReactNode[];
	slidesPerView?: number;
	spaceBetween?: number;
	autoplay?: {
		delay: number;
		disableOnInteraction?: boolean;
	};
	navigation?: boolean;
	loop?: boolean;
	className?: string;
	showCount?: boolean;
}

export const UiSwiper: React.FC<UiSwiperProps> = ({
	slides,
	slidesPerView = 3,
	spaceBetween = 20,
	autoplay,
	navigation = false,
	loop = false,
	className = "",
	showCount = true,
}) => {
	const swiperRef = useRef<any>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [totalSlides, setTotalSlides] = useState(0);
	const [windowWidth, setWindowWidth] = useState<number | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	// Определяем ширину экрана сразу при монтировании
	useEffect(() => {
		setIsMounted(true);
		// Устанавливаем ширину сразу
		setWindowWidth(window.innerWidth);
		
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};
		
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	// Обновляем свайпер при изменении ширины
	useEffect(() => {
		if (swiperRef.current && windowWidth !== null) {
			// Немного задержки для стабильности
			setTimeout(() => {
				swiperRef.current.swiper.update();
			}, 10);
		}
	}, [windowWidth]);

	const getAdjustedSlidesPerView = useCallback(() => {
		if (windowWidth === null) {
			// При первой загрузке показываем дефолтное значение
			return slidesPerView;
		}
		
		if (windowWidth >= 1440) {
			return slidesPerView; // На 1440px и больше - 2 слайда
		} else if (windowWidth >= 1024) {
			return 2; // На 1024px - 1440px - дефолтное количество
		} else if (windowWidth >= 768) {
			return 2; // На 768px - 1024px - 2 слайда
		} else if (windowWidth >= 480) {
			return 1; // На маленьких планшетах - 1 слайд
		} else {
			return 1; // На мобильных - 1 слайд
		}
	}, [windowWidth, slidesPerView]);

	const adjustedSlidesPerView = getAdjustedSlidesPerView();

	const nextSlide = () => {
		if (swiperRef.current) {
			swiperRef.current.swiper.slideNext();
		}
	};

	const prevSlide = () => {
		if (swiperRef.current) {
			swiperRef.current.swiper.slidePrev();
		}
	};

	const onSlideChange = (swiper: any) => {
		setActiveIndex(swiper.activeIndex);
	};

	const onInit = (swiper: any) => {
		setTotalSlides(swiper.slides.length);
	};

	const getCurrentRange = () => {
		const start = activeIndex + 1;
		const end = Math.min(activeIndex + adjustedSlidesPerView, totalSlides);
		return {start, end};
	};

	const {start, end} = getCurrentRange();

	// Оптимизация: скрываем свайпер до определения ширины
	if (!isMounted) {
		return (
			<div className={`${styles.swiperContainer} ${className}`}>
				<div className={styles.swiperSkeleton}>
					{/* Скелетон для предотвращения мерцания */}
					{slides.slice(0, 3).map((_, index) => (
						<div key={index} className={styles.skeletonSlide} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className={`${styles.swiperContainer} ${className}`}>
			<Swiper
				ref={swiperRef}
				modules={[Navigation, Autoplay]}
				slidesPerView={adjustedSlidesPerView}
				spaceBetween={(windowWidth || 1025) > 1024 ? spaceBetween : 10}
				navigation={false}
				autoplay={autoplay}
				loop={loop}
				onSlideChange={onSlideChange}
				onInit={onInit}
				className={styles.swiper}
				// Ключ для принудительного ререндера при изменении настроек
				key={`swiper-${adjustedSlidesPerView}-${windowWidth}`}
			>
				{slides.map((slide, index) => (
					<SwiperSlide key={index} className={styles.slide}>
						{slide}
					</SwiperSlide>
				))}
			</Swiper>

			<div className={styles.controls}>
				{showCount && (
					<div className={styles.slidesCounter}>
						<span className={styles.currentRange}>
							{start}-{end}
						</span>
						из
						<span className={styles.totalSlides}>{totalSlides}</span>
					</div>
				)}
				{navigation && (
					<div className={styles.navigation}>
						<button
							onClick={prevSlide}
							className={`${styles.navButton} ${styles.prevButton}`}
							aria-label="Предыдущий слайд"
							disabled={activeIndex === 0}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="21"
								height="18"
								viewBox="0 0 21 18"
								fill="none"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M-3.93403e-07 9C-4.20561e-07 8.37868 0.503679 7.875 1.125 7.875L17.0819 7.875L10.8453 1.93593C10.3974 1.50529 10.3834 0.793119 10.8141 0.345249C11.2447 -0.102618 11.9569 -0.116583 12.4047 0.31406L20.6547 8.18906C20.8753 8.40116 21 8.69398 21 9C21 9.30602 20.8753 9.59883 20.6547 9.81093L12.4047 17.6859C11.9569 18.1166 11.2447 18.1026 10.8141 17.6547C10.3834 17.2069 10.3974 16.4947 10.8453 16.0641L17.0819 10.125L1.125 10.125C0.503679 10.125 -3.66244e-07 9.62132 -3.93403e-07 9Z"
									fill="white"
								/>
							</svg>
						</button>

						<button
							onClick={nextSlide}
							className={`${styles.navButton} ${styles.nextButton}`}
							aria-label="Следующий слайд"
							disabled={activeIndex + adjustedSlidesPerView >= totalSlides}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="21"
								height="18"
								viewBox="0 0 21 18"
								fill="none"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M-3.93403e-07 9C-4.20561e-07 8.37868 0.503679 7.875 1.125 7.875L17.0819 7.875L10.8453 1.93593C10.3974 1.50529 10.3834 0.793119 10.8141 0.345249C11.2447 -0.102618 11.9569 -0.116583 12.4047 0.31406L20.6547 8.18906C20.8753 8.40116 21 8.69398 21 9C21 9.30602 20.8753 9.59883 20.6547 9.81093L12.4047 17.6859C11.9569 18.1166 11.2447 18.1026 10.8141 17.6547C10.3834 17.2069 10.3974 16.4947 10.8453 16.0641L17.0819 10.125L1.125 10.125C0.503679 10.125 -3.66244e-07 9.62132 -3.93403e-07 9Z"
									fill="white"
								/>
							</svg>
						</button>
					</div>
				)}
			</div>
		</div>
	);
};