/**
 * @file Controllers for authentication endpoints
 * Takes incoming requests, validates the body with Zod schemas,
 * runs the corresponding service logic and sends back the responses.
 */

import type { Response } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { Request } from "express";

/**
 * Handles new user registration.
 * Checks the request body with Zod, hashes the password and creates user.
 * @returns
 * - 201: Success - Returns the new user data and a new JWT session
 * - 400: Bad Request - The request body didn't match the Zod schema
 * - 409: Conflict - The email is already taken
 * - 500: Server Error - Unhandled backend error
 */
export async function registerController(req: Request, res: Response) {
  const parsedBody = registerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: {
        message: "Invalid request body",
      },
    });
  }

  try {
    const result = await registerUser(parsedBody.data);

    return res.status(201).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Email already registered"
    ) {
      return res.status(409).json({
        error: {
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}

/**
 * Handles logging user in
 * Verifies that the fields are present, checks the password and signs a JWT
 * @returns
 * - 200: Success - Credentials match; returns the user profile and JWT
 * - 400: Bad Request - Invalid form structure
 * - 401 Unauthorized - Incorrect email or password
 */
export async function loginController(req: Request, res: Response) {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: {
        message: "Invalid request body",
      },
    });
  }

  try {
    const result = await loginUser(parsedBody.data);

    return res.status(200).json(result);
  } catch {
    return res.status(401).json({
      error: {
        message: "Invalid email or password",
      },
    });
  }
}

/**
 * Gets the profile context for the currently logged in user.
 * Requires requireAuth middleware running first to attach the user ID to the request.
 * @returns
 * - 200: Success - Active profile data matching the session ID payload
 * - 401: Unauthorised - No user ID found on the request (middleware missed it or token skipped)
 * - 404: Not Found - The user ID was parsed but no longer exists in the database
 */
export async function meController(req: AuthenticatedRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
      },
    });
  }

  try {
    const user = await getCurrentUser(req.userId);

    return res.status(200).json({
      user,
    });
  } catch {
    return res.status(404).json({
      error: {
        message: "User not found",
      },
    });
  }
}
