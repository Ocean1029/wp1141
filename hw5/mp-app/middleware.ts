import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth"];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Protected routes
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // Redirect authenticated users away from login page
  if (pathname === "/login" && req.auth) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

