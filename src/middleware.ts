import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up"];

// Helper function to check if a route is public
function isPublicRoute(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return publicRoutes.some(route => pathname.startsWith(route));
}

// Combine Clerk auth with custom API routing
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // Handle API routes first
  const apiPathRegex = /^\/([^\/]+)\/api\/([^\/]+)\/([^\/]+)(\/.*)?$/;
  const match = pathname.match(apiPathRegex);

  if (match) {
    const [, projectId, version, resourceName, rest = ''] = match;
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/api/${projectId}/api/${version}/${resourceName}${rest}`;
    return NextResponse.rewrite(newUrl);
  }

  // Then handle authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
