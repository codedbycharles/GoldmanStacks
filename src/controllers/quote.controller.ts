/**
 * @file Controller for managing quote endpoints
 */
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createQuoteSchema } from "../schemas/quote.schema.js";
import {
  createQuoteForUser,
  getQuoteForUser,
  getQuotesForUser,
} from "../services/quote.service.js";

/**
 * Validates request data, authenticates the active user and triggers a new life quote generation
 */
export async function createQuoteController(
  req: AuthenticatedRequest,
  res: Response,
) {
  // Error if the authentication middleware is missing user ID
  if (!req.userId) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
      },
    });
  }

  // Validate the incoming body against Zod schema
  const parsedBody = createQuoteSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: {
        message: "Invalid request body",
      },
    });
  }

  try {
    const quote = await createQuoteForUser(req.userId, parsedBody.data);

    return res.status(201).json({
      quote,
    });
  } catch {
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}

export async function getQuotesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.userId) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
      },
    });
  }

  try {
    const quotes = await getQuotesForUser(req.userId);

    return res.status(200).json({
      quotes,
    });
  } catch {
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}

export async function getQuoteByIdController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.userId) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
      },
    });
  }

  const quoteId = req.params.id;

  if (!quoteId || Array.isArray(quoteId)) {
    return res.status(400).json({
      error: {
        message: "Quote ID is required",
      },
    });
  }

  try {
    const quote = await getQuoteForUser({
      quoteId,
      userId: req.userId,
    });

    if (!quote) {
      return res.status(404).json({
        error: {
          message: "Quote not found",
        },
      });
    }

    return res.status(200).json({
      quote,
    });
  } catch {
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}
