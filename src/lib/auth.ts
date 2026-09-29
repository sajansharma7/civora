// ============================================================
// Auth.js (NextAuth v5) Configuration
// ============================================================
// This file sets up authentication (login/register) for Civora.
//
// HOW AUTHENTICATION WORKS:
// 1. User enters email + password on login page
// 2. We check if the email exists in our database
// 3. We verify the password using bcrypt (secure comparison)
// 4. If valid, we create a JWT (JSON Web Token) stored in a cookie
// 5. On every request, Next.js reads this cookie to know who's logged in
//
// The JWT contains: user ID, role, and org info
// This avoids hitting the database on every single page load.
// ============================================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const {
  handlers,  // Route handlers for /api/auth/*
  signIn,    // Server-side sign in function
  signOut,   // Server-side sign out function
  auth,      // Get current session (use in Server Components)
} = NextAuth({
  // Use JWT strategy (token stored in cookie, no database sessions)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // Session lasts 30 days
  },

  // Pages configuration - tell NextAuth where our custom pages are
  pages: {
    signIn: '/login',     // Custom login page (not the default NextAuth one)
    error: '/login',      // Redirect errors to login page
  },

  // Providers define HOW users can log in
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      // This function runs when someone tries to log in
      async authorize(credentials) {
        // Step 1: Check if email and password were provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Step 2: Find the user in our database
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            // Also fetch their organization membership
            orgMemberships: {
              include: {
                organization: {
                  select: { id: true, slug: true },
                },
              },
              take: 1, // A user typically belongs to one org
            },
          },
        });

        // Step 3: If user doesn't exist, reject login
        if (!user) {
          throw new Error('No account found with this email');
        }

        // Step 4: Compare the entered password with stored hash
        // bcrypt.compare securely checks without revealing the real password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error('Incorrect password');
        }

        // Step 5: Login successful! Return user data
        // This data gets stored in the JWT token
        const orgMembership = user.orgMemberships[0];
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar,
          orgId: orgMembership?.organization?.id || null,
          orgSlug: orgMembership?.organization?.slug || null,
        };
      },
    }),
  ],

  // Callbacks let us customize the JWT and session objects
  callbacks: {
    // Called whenever a JWT is created or updated
    async jwt({ token, user }) {
      // When user first logs in, add our custom fields to the token
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.orgId = user.orgId;
        token.orgSlug = user.orgSlug;
      }
      return token;
    },

    // Called whenever session is checked (used by components)
    async session({ session, token }) {
      // Copy our custom fields from JWT into the session object
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.orgId = token.orgId as string | null | undefined;
        session.user.orgSlug = token.orgSlug as string | null | undefined;
      }
      return session;
    },

    // Called on every request to check authorization
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Dashboard routes require login
      if (pathname.startsWith('/org/') || pathname.startsWith('/citizen/')) {
        return isLoggedIn;
      }

      // Public routes are accessible to everyone
      return true;
    },
  },
});
