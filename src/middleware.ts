import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
    const isPublicPage = request.nextUrl.pathname === "/" || 
                         request.nextUrl.pathname === "/features" || 
                         request.nextUrl.pathname === "/about" ||
                         request.nextUrl.pathname === "/docs";

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL("/timer", request.url));
    }

    if (!isAuthPage && !isPublicPage && !token) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|github-icon|github-icon-light).*)"],
};
