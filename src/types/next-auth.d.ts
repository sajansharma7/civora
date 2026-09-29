// ============================================================
// NextAuth Type Augmentation
// ============================================================
// By default, NextAuth's session only has basic user info.
// We need to ADD our custom fields (role, orgId, etc.)
// so we can use them throughout the app.
//
// This file tells TypeScript: "Hey, the session.user object
// also has these extra properties that we added."
// ============================================================

import 'next-auth';
import { Role } from '@prisma/client';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      image?: string | null;
      orgId?: string | null;    // Which organization they belong to
      orgSlug?: string | null;  // URL-friendly org name
    };
  }

  interface User {
    id: string;
    role: Role;
    orgId?: string | null;
    orgSlug?: string | null;
  }
}

// Extend the JWT (JSON Web Token) that's stored in cookies
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    orgId?: string | null;
    orgSlug?: string | null;
  }
}
