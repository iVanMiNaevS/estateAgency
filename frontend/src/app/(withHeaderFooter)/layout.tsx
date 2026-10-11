import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/header/header";
import { Footer } from "@/components/footer/footer";
import { getSessionUser } from "@/lib/auth";

const urbanist = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Парк Чудес",
	description:
		"Парк развлечений в Рязани: аттракционы для детей и взрослых, онлайн-запись без очередей.",
};

/**
 * Оболочка публичной части.
 *
 * Серверный компонент: проверяет сессию один раз на все страницы и
 * передаёт шапке признак входа. Так ссылка «Войти» или «Личный
 * кабинет» всегда соответствует реальному состоянию, а не тому,
 * что лежит в браузере.
 */
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getSessionUser();

	return (
		<>
			<Header user={user ? { name: user.name, email: user.email } : null} />
			{children}
			<Footer isAuthenticated={Boolean(user)} />
		</>
	);
}