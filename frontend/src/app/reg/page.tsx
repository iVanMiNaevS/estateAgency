import type { Metadata } from "next";
import { AppRouter } from "@/AppRouter";
import { RegisterForm } from "./reg-form";

export const metadata: Metadata = {
  title: "Регистрация — Парк Чудес",
  description: "Регистрация клиента парка развлечений",
};

/** Страница регистрации — серверная оболочка. */
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) => {
  const params = await searchParams;
  const next = params.next ?? AppRouter.account;

  return <RegisterForm next={next} />;
};

export default Page;