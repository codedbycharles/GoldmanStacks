/**
 * @file Repository layer for user data operations.
 * Handles direct database reads and writes using Prisma.
 */
import { prisma } from "../config/prisma.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
    },
  });
}
