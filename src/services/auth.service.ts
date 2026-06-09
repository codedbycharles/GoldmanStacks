/**
 * @file Services for auth logic.
 * Handles password hashing, JWT creation/verification and sorting through user profiles.
 */
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repositories/user.repository.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

type JwtPayload = {
  userId: string;
};

// Internal helper to create JWT session tokens
function createToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

// Internal helper to return only safe (no passwords) obj to client
function toSafeUser(user: { id: string; email: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

/**
 * Registers a new user
 * Checks for duplicates, hashes the password, creates the database record and issues a session token.
 * * @throws {Error} "Email already registered" if a record with the email already exists.
 */
export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash with a salt round of 12
  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await createUser({
    email: input.email,
    passwordHash,
  });

  const token = createToken(user.id);

  return {
    user: toSafeUser(user),
    token,
  };
}

/**
 * Validate login credentials
 * Finds the users email then compares the submitted password with the stored hash and set a session token.
 * * @throws {Error} "Invalid email or password" if the email isn't found or the hash comparison fails
 */
export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = createToken(user.id);

  return {
    user: toSafeUser(user),
    token,
  };
}

/**
 * Fetches a user profile by ID and return 'safe' info
 * * @throws {Error} "User not found" if the database lookup comes up empty.
 */
export async function getCurrentUser(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return toSafeUser(user);
}

/**
 * Verifies an incoming JWT token and extracts its payload.
 * Used by the `requireAuth` middleware
 * * @throws {Error} Errors if the token is forged/expired
 */
export function verifyToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload === "string" || !("userId" in payload)) {
    throw new Error("Invalid token");
  }

  return payload as JwtPayload;
}
