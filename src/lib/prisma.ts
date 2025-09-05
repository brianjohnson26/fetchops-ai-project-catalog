import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL_SUPABASE,
      },
    },
    // Add connection pooling configuration
    connectionTimeout: 10000,
    queryTimeout: 20000,
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
