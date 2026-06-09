/**
 * @file Express middleware to intercept incoming requests, verifies the bearer token, and hydrate the request
 */
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth.service.js";

export type AuthenticatedRequest = Request & {
  userId?: string;
};

/**
 * Middleware that enforces a valid Authorization Bearer header.
 * If valid, attaches the decoded user ID to the request object and forwards execution.
 * @param req - The custom authenticated incoming request context
 * @param res - Express response object used to reject unauthenticated calls
 * @param next - Express callback function to advance to the next handler
 * @returns 401 Unauthorized json payload if the token is missing, invalid or expired
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  // check for Bearer token
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
      },
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({
      error: {
        message: "Invalid or expired token",
      },
    });
  }
}
