import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Header} from "@/components/header/header";
import {Footer} from "@/components/footer/footer";

const urbanist = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Estate app",
	description: "Estate app descriptio",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ru">
			<body className={`${urbanist.className}`}>{children}</body>
		</html>
	);
}
