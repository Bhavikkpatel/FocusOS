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

    const isSelfHosted = process.env.IS_SELF_HOSTED === "true" || process.env.NODE_ENV === "development";
    const isAdminSetup = request.nextUrl.pathname.startsWith("/admin/setup");

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL("/timer", request.url));
    }

    if (!isAuthPage && !isPublicPage && !token) {
        // Allow unauthenticated access to admin setup only in self-hosted mode
        if (isAdminSetup && isSelfHosted) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|github-icon|github-icon-light).*)"],
};
