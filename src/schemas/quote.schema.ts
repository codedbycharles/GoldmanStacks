/**
 * @file Request validation schema and types for quote calculations
 * Uses string matching for money to avoid floating point math issues
 */
import { z } from "zod";

// check for real money amount
const moneyString = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid money amount");

export const createQuoteSchema = z.object({
  age: z.number().int().min(18).max(80),
  annualIncome: moneyString,
  partnerAnnualIncome: moneyString.default("0"),
  monthlyExpenses: moneyString,
  dependants: z.number().int().min(0).max(10),
  mortgageBalance: moneyString.default("0"),
  otherDebts: moneyString.default("0"),
  savings: moneyString.default("0"),
  existingLifeCover: moneyString.default("0"),
  incomeReplacementYears: z.number().int().min(1).max(30),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
