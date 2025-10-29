module.exports = [
"[project]/src/ui/uiSwiper/uiSwiper.module.scss [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "controls": "uiSwiper-module-scss-module__VuQ7-a__controls",
  "currentRange": "uiSwiper-module-scss-module__VuQ7-a__currentRange",
  "navButton": "uiSwiper-module-scss-module__VuQ7-a__navButton",
  "navigation": "uiSwiper-module-scss-module__VuQ7-a__navigation",
  "prevButton": "uiSwiper-module-scss-module__VuQ7-a__prevButton",
  "slide": "uiSwiper-module-scss-module__VuQ7-a__slide",
  "slidesCounter": "uiSwiper-module-scss-module__VuQ7-a__slidesCounter",
  "swiper": "uiSwiper-module-scss-module__VuQ7-a__swiper",
  "swiperContainer": "uiSwiper-module-scss-module__VuQ7-a__swiperContainer",
});
}),
"[project]/src/ui/uiSwiper/uiSwiper.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UiSwiper",
    ()=>UiSwiper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/ui/uiSwiper/uiSwiper.module.scss [app-ssr] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$swiper$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/swiper/swiper-react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/swiper/modules/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$navigation$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__ = __turbopack_context__.i("[project]/node_modules/swiper/modules/navigation.mjs [app-ssr] (ecmascript) <export default as Navigation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$autoplay$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Autoplay$3e$__ = __turbopack_context__.i("[project]/node_modules/swiper/modules/autoplay.mjs [app-ssr] (ecmascript) <export default as Autoplay>");
"use client";
;
;
;
;
;
;
;
;
const UiSwiper = ({ slides, slidesPerView = 3, spaceBetween = 20, autoplay, navigation = false, loop = false, className = "", showCount = true })=>{
    const swiperRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useRef(null);
    const [activeIndex, setActiveIndex] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(0);
    const [totalSlides, setTotalSlides] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useState(0);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        if (swiperRef.current) {
            setTotalSlides(swiperRef.current.swiper.slides.length);
        }
    }, []);
    const nextSlide = ()=>{
        if (swiperRef.current) {
            swiperRef.current.swiper.slideNext();
        }
    };
    const prevSlide = ()=>{
        if (swiperRef.current) {
            swiperRef.current.swiper.slidePrev();
        }
    };
    const onSlideChange = (swiper)=>{
        setActiveIndex(swiper.activeIndex);
    };
    const getCurrentRange = ()=>{
        const start = activeIndex + 1;
        const end = Math.min(activeIndex + slidesPerView, totalSlides);
        return {
            start,
            end
        };
    };
    const { start, end } = getCurrentRange();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].swiperContainer} ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$swiper$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Swiper"], {
                ref: swiperRef,
                modules: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$navigation$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__["Navigation"],
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$modules$2f$autoplay$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Autoplay$3e$__["Autoplay"]
                ],
                slidesPerView: slidesPerView,
                spaceBetween: spaceBetween,
                navigation: false,
                autoplay: autoplay,
                loop: loop,
                onSlideChange: onSlideChange,
                onInit: (swiper)=>{
                    setTotalSlides(swiper.slides.length);
                },
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].swiper,
                children: slides.map((slide, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$swiper$2f$swiper$2d$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SwiperSlide"], {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].slide,
                        children: slide
                    }, index, false, {
                        fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                        lineNumber: 89,
                        columnNumber: 6
                    }, ("TURBOPACK compile-time value", void 0)))
            }, void 0, false, {
                fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                lineNumber: 74,
                columnNumber: 4
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].controls,
                children: [
                    showCount && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].slidesCounter,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].currentRange,
                                children: [
                                    start,
                                    "-",
                                    end
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                lineNumber: 98,
                                columnNumber: 7
                            }, ("TURBOPACK compile-time value", void 0)),
                            "из",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].totalSlides,
                                children: totalSlides
                            }, void 0, false, {
                                fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                lineNumber: 102,
                                columnNumber: 7
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                        lineNumber: 97,
                        columnNumber: 6
                    }, ("TURBOPACK compile-time value", void 0)),
                    navigation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navigation,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: prevSlide,
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navButton} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].prevButton}`,
                                "aria-label": "Предыдущий слайд",
                                disabled: activeIndex === 0,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "21",
                                    height: "18",
                                    viewBox: "0 0 21 18",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        clipRule: "evenodd",
                                        d: "M-3.93403e-07 9C-4.20561e-07 8.37868 0.503679 7.875 1.125 7.875L17.0819 7.875L10.8453 1.93593C10.3974 1.50529 10.3834 0.793119 10.8141 0.345249C11.2447 -0.102618 11.9569 -0.116583 12.4047 0.31406L20.6547 8.18906C20.8753 8.40116 21 8.69398 21 9C21 9.30602 20.8753 9.59883 20.6547 9.81093L12.4047 17.6859C11.9569 18.1166 11.2447 18.1026 10.8141 17.6547C10.3834 17.2069 10.3974 16.4947 10.8453 16.0641L17.0819 10.125L1.125 10.125C0.503679 10.125 -3.66244e-07 9.62132 -3.93403e-07 9Z",
                                        fill: "white"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                        lineNumber: 120,
                                        columnNumber: 9
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                    lineNumber: 113,
                                    columnNumber: 8
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                lineNumber: 107,
                                columnNumber: 7
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: nextSlide,
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].navButton} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$uiSwiper$2f$uiSwiper$2e$module$2e$scss__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nextButton}`,
                                "aria-label": "Следующий слайд",
                                disabled: activeIndex === totalSlides - 3,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "21",
                                    height: "18",
                                    viewBox: "0 0 21 18",
                                    fill: "none",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        clipRule: "evenodd",
                                        d: "M-3.93403e-07 9C-4.20561e-07 8.37868 0.503679 7.875 1.125 7.875L17.0819 7.875L10.8453 1.93593C10.3974 1.50529 10.3834 0.793119 10.8141 0.345249C11.2447 -0.102618 11.9569 -0.116583 12.4047 0.31406L20.6547 8.18906C20.8753 8.40116 21 8.69398 21 9C21 9.30602 20.8753 9.59883 20.6547 9.81093L12.4047 17.6859C11.9569 18.1166 11.2447 18.1026 10.8141 17.6547C10.3834 17.2069 10.3974 16.4947 10.8453 16.0641L17.0819 10.125L1.125 10.125C0.503679 10.125 -3.66244e-07 9.62132 -3.93403e-07 9Z",
                                        fill: "white"
                                    }, void 0, false, {
                                        fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                        lineNumber: 142,
                                        columnNumber: 9
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                    lineNumber: 135,
                                    columnNumber: 8
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                                lineNumber: 129,
                                columnNumber: 7
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                        lineNumber: 106,
                        columnNumber: 6
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
                lineNumber: 95,
                columnNumber: 4
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/ui/uiSwiper/uiSwiper.tsx",
        lineNumber: 73,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
};
}),
];

//# sourceMappingURL=src_ui_uiSwiper_f8938131._.js.map