// ============================================================
// Prisma Client Singleton
// ============================================================
// Prisma is the tool that lets our app talk to the MySQL database.
// This file creates ONE single connection that the entire app shares.
//
// WHY a singleton?
// In development, Next.js hot-reloads your code frequently.
// Without this pattern, each reload would create a NEW database
// connection, and you'd quickly run out of connections.
// This pattern reuses the same connection across reloads.
// ============================================================

import { PrismaClient } from '@prisma/client';

// This tells TypeScript: "there might be a prisma property on globalThis"
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// If a Prisma client already exists (from a previous hot reload), use it.
// Otherwise, create a new one.
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log database queries in development (helps with debugging)
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// In development, save the client to globalThis so it persists
// across hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export so other files can use it:
// import { prisma } from '@/lib/prisma';
// const users = await prisma.user.findMany();
export { prisma };
export default prisma;
