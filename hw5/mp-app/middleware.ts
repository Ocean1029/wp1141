import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const userID = req.auth?.user?.userID;
  
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth"];
  
  // Handle root path - always redirect unauthenticated users to /login
  if (pathname === "/") {
    if (!isAuthenticated) {
      // Let app/page.tsx handle redirect to /login
      return NextResponse.next();
    }
    // If authenticated, check userID status
    const redirectTo = userID ? "/home" : "/register";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }
  
  // Handle /login route
  if (pathname === "/login") {
    // If authenticated, redirect based on userID status
    if (isAuthenticated) {
      const redirectTo = userID ? "/home" : "/register";
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    // If not authenticated, allow access to login page
    return NextResponse.next();
  }
  
  // Handle /register route - requires authentication
  if (pathname === "/register") {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // If authenticated and has userID, redirect to home
    if (userID) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    // If authenticated but no userID, allow access to register page
    return NextResponse.next();
  }
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // All other routes are protected - require authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // If authenticated but hasn't registered userID, redirect to register
  if (!userID) {
    return NextResponse.redirect(new URL("/register", req.url));
  }
  
  // Authenticated user with userID - allow access
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

