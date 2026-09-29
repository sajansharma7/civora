// ============================================================
// NextAuth API Route Handler
// ============================================================
// This connects NextAuth to Next.js App Router.
// It handles all auth-related API requests:
// - POST /api/auth/signin (login)
// - POST /api/auth/signout (logout)
// - GET /api/auth/session (get current user)
// ============================================================

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
