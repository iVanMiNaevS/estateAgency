import { NextResponse, type NextRequest } from "next/server";

/**
 * Защита закрытых маршрутов на уровне сервера.
 *
 * Даже без обращения к Strapi пользователь без токена не получает
 * страницу кабинета — редирект происходит до рендера. Это дополняет
 * проверку роли в server-компонентах: middleware отсекает новичков,
 * компоненты страницы не доверяют cookie вслепую.
 */

const AUTH_COOKIE = "park_jwt";

/** Префиксы закрытых разделов. */
const PROTECTED_PREFIXES = ["/account"];

const isProtected = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Куда отправлять гостя, который пришёл на закрытый адрес. */
const LOGIN_PATH = "/login";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    // Запоминаем, куда клиент хотел попасть, чтобы вернуть его после входа.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/account"],
};