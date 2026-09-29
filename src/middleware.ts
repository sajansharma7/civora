// ============================================================
// Next.js Middleware - Route Protection
// ============================================================
// This file runs BEFORE every page request. It checks:
// 1. Is the user logged in?
// 2. Do they have permission to access this page?
//
// If not, it redirects them to the login page.
// ============================================================

export { auth as middleware } from '@/lib/auth';

export const config = {
  // Define which routes this middleware should run on
  // It runs on everything EXCEPT static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads|markers).*)',
  ],
};
