/**
 * @file intialises and exports shared Prisma ORM instance
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

/**
 * PostgreSQL driver adapter
 * Required in Prisma 7 to handle network transport using standard JavaScript drivers
 */
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Shared Prisma client instance used across the app to execute database queries.
export const prisma = new PrismaClient({
  adapter,
});
