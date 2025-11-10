import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth"];
  
  // Handle /register route specifically
  if (pathname === "/register") {
    // If not authenticated, redirect to login
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // If authenticated and has userID, redirect to home
    const userID = req.auth.user?.userID;
    if (userID) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    // If authenticated but no userID, allow access to register page
    return NextResponse.next();
  }
  
  // If user is authenticated and trying to access login page, redirect to home/register
  if (pathname === "/login" && req.auth) {
    const userID = req.auth.user?.userID;
    const redirectTo = userID ? "/home" : "/register";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Protected routes - require authentication
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // Check if user has completed userID registration
  const userID = req.auth.user?.userID;
  
  // If user hasn't registered userID, redirect to register
  if (!userID) {
    return NextResponse.redirect(new URL("/register", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

