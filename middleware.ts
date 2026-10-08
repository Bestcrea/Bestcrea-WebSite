import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isStaffRole } from "./lib/rbac";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_RE = new RegExp(`^/(${routing.locales.join("|")})`);

function getLocale(pathname: string) {
  const match = pathname.match(LOCALE_RE);
  return match?.[1] ?? routing.defaultLocale;
}

function stripLocale(pathname: string) {
  return pathname.replace(LOCALE_RE, "") || "/";
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const pathWithoutLocale = stripLocale(pathname);
  const locale = getLocale(pathname);

  const isClientArea =
    pathWithoutLocale === "/espace-client" ||
    pathWithoutLocale.startsWith("/espace-client/");
  const isClientAuthPage =
    pathWithoutLocale === "/espace-client/login" ||
    pathWithoutLocale === "/espace-client/register";

  const isAdminArea =
    pathWithoutLocale === "/admin" || pathWithoutLocale.startsWith("/admin/");
  const isAdminLogin = pathWithoutLocale === "/admin/login";

  if (isClientArea || isAdminArea) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (isClientArea) {
      const isLoggedInClient =
        !!token?.id && (token.role === "client" || token.role === "admin");

      if (!isClientAuthPage && !isLoggedInClient) {
        const loginUrl = new URL(`/${locale}/espace-client/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isClientAuthPage && isLoggedInClient) {
        return NextResponse.redirect(new URL(`/${locale}/espace-client`, req.url));
      }
    }

    if (isAdminArea) {
      const isStaff = !!token?.id && isStaffRole(token.role as string | undefined);

      if (!isAdminLogin && !isStaff) {
        const loginUrl = new URL(`/${locale}/admin/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        if (token?.role === "client") {
          loginUrl.searchParams.set("error", "forbidden");
        }
        return NextResponse.redirect(loginUrl);
      }

      if (isAdminLogin && isStaff) {
        return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
