import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Match URLs like /{projectId}/api/{version}/{resourceName}
  const apiPathRegex = /^\/([^\/]+)\/api\/([^\/]+)\/([^\/]+)(\/.*)?$/;
  const match = pathname.match(apiPathRegex);

  if (match) {
    const [, projectId, version, resourceName, rest = ''] = match;
    // Rewrite to our actual API route
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/api/${projectId}/api/${version}/${resourceName}${rest}`;
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except /api, _next, static files, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 