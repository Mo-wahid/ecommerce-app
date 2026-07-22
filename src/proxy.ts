import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is trying to access an admin route, check their role
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (req.nextauth.token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
    pages: {
      signIn: "/?login=true",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*", "/checkout/:path*"],
};
