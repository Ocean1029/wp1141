import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware function that runs on every request
 * Currently provides a basic structure for request handling
 * Can be extended with authentication, logging, or other cross-cutting concerns
 */
export function middleware(req: NextRequest) {
  // Basic middleware structure
  // Add custom logic here as needed
  
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Defines which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

