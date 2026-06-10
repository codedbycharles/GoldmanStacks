/**
 * @file Layer for managing user quotes.
 */
import { calculateCover } from "./cover-calculation.service.js";
import { createQuote } from "../repositories/quote.repository.js";
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
