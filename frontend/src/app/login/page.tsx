import type { Metadata } from "next";
import { AppRouter } from "@/AppRouter";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Вход — Парк Чудес",
  description: "Вход в личный кабинет клиента парка развлечений",
};

/**
 * Страница входа — серверная оболочка.
 * Параметр next читается здесь, чтобы клиентскому компоненту
 * не требовался useSearchParams и обёртка Suspense.
 */
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) => {
  const params = await searchParams;
  const next = params.next ?? AppRouter.account;

  return <LoginForm next={next} />;
};

export default Page;