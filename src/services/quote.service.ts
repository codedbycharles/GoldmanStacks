/**
 * @file Layer for managing user quotes.
 */
import { calculateCover } from "./cover-calculation.service.js";
import {
  createQuote,
  findQuotesByUserId,
  findQuoteByIdAndUserId,
} from "../repositories/quote.repository.js";
import type { CreateQuoteInput } from "../schemas/quote.schema.js";

// Runs a new insurance quote calculation for a user and saves the final result to their profile
export async function createQuoteForUser(
  userId: string,
  input: CreateQuoteInput,
) {
  const calculation = calculateCover(input);

  const quote = await createQuote({
    userId,
    ...input,
    ...calculation,
  });

  return quote;
}

// Fetches all quotes for specific user
export async function getQuotesForUser(userId: string) {
  return findQuotesByUserId(userId);
}

// Fetches specific quote for user, validates the quote belongs to the user
export async function getQuoteForUser(input: {
  quoteId: string;
  userId: string;
}) {
  return findQuoteByIdAndUserId(input);
}
