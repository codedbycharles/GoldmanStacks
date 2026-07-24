/**
 * @file Routing config for quote endpoints
 */
import { Router } from "express";
import {
  createQuoteController,
  getQuotesController,
  getQuoteByIdController,
} from "../controllers/quote.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const quoteRouter = Router();

// Creates and saves a new insurance quote calculation requires valid JWT
quoteRouter.post("/", requireAuth, createQuoteController);
quoteRouter.get("/", requireAuth, getQuotesController);
quoteRouter.get("/:id", requireAuth, getQuoteByIdController);
