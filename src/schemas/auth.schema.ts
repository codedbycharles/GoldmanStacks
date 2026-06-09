/**
 * @file Handles runtime validation and static type safety
 */
import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

// TS types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
