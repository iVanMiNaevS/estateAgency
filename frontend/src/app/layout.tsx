import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";

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
