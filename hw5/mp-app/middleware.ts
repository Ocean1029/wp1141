import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // If user is authenticated and trying to access login page, redirect to home/register
  if (pathname === "/login" && req.auth) {
    const userID = req.auth.user?.userID;
    const redirectTo = userID ? "/home" : "/register";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth"];
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Protected routes
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // Check if user has completed userID registration
  const userID = req.auth.user?.userID;
  const isRegisterPage = pathname === "/register";
  
  // If user hasn't registered userID and not on register page, redirect to register
  if (!userID && !isRegisterPage) {
    return NextResponse.redirect(new URL("/register", req.url));
  }
  
  // If user has registered userID and on register page, redirect to home
  if (userID && isRegisterPage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

