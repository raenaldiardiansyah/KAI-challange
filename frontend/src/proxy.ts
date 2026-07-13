import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, isRamsAuthEnabled } from "@/lib/auth/config";

export function proxy(request: NextRequest) {
  if (!isRamsAuthEnabled()) return NextResponse.next();

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (isLoginPage && accessToken) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  if (!isLoginPage && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
