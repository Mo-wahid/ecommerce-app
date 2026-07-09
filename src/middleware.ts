import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function runs on every request that matches the config below
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Double-check that we are only intercepting /admin routes
  if (pathname.startsWith("/admin")) {
    
    // Attempt to read the secure cookie we set during login
    const userRole = request.cookies.get("userRole")?.value;

    // If there is no cookie, or the user is not an Admin, boot them to the login page
    if (!userRole || userRole !== "Admin") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If they pass the check (or aren't on an admin route), let the request proceed
  return NextResponse.next();
}

// The matcher defines exactly which routes trigger this middleware
export const config = {
  matcher: [
    "/admin/:path*", // Protects /admin and any sub-routes like /admin/add-product
  ],
};