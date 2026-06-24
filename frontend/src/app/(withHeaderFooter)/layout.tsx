import type {Metadata} from "next";
import "../globals.css";
import {Header} from "@/components/header/header";
import {Footer} from "@/components/footer/footer";


export const metadata: Metadata = {
	title: "UpTrend",
	description: "Лучшие предложения на рынке маркетинга",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}
