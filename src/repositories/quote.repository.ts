/**
 * @file Repository layer for quote data - handles saving calculated insurance quotes directly to Prisma
 */
import { prisma } from "../config/prisma.js";
import type { CreateQuoteInput } from "../schemas/quote.schema.js";

// Combines the initial user inputs with the calculations to create a complete DB record type
type CreateQuoteRecordInput = CreateQuoteInput & {
  userId: string;
  recommendedCoverAmount: string;
  estimatedMonthlyPremium: string;
  riskBand: string;
  recommendationSummary: string;
};

//Saves insurance quote calculation to the DB for specific user ID
export async function createQuote(input: CreateQuoteRecordInput) {
  return prisma.quote.create({
    data: {
      userId: input.userId,
      age: input.age,
      annualIncome: input.annualIncome,
      partnerAnnualIncome: input.partnerAnnualIncome,
      monthlyExpenses: input.monthlyExpenses,
      dependants: input.dependants,
      mortgageBalance: input.mortgageBalance,
      otherDebts: input.otherDebts,
      savings: input.savings,
      existingLifeCover: input.existingLifeCover,
      incomeReplacementYears: input.incomeReplacementYears,
      recommendedCoverAmount: input.recommendedCoverAmount,
      estimatedMonthlyPremium: input.estimatedMonthlyPremium,
      riskBand: input.riskBand,
      recommendationSummary: input.recommendationSummary,
    },
  });
}

// Fetches all quotes by a user, orders by latest one first
export async function findQuotesByUserId(userId: string) {
  return prisma.quote.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Fetches quote with specific ID, checking that quote belongs to the user
export async function findQuoteByIdAndUserId(input: {
  quoteId: string;
  userId: string;
}) {
  return prisma.quote.findFirst({
    where: {
      id: input.quoteId,
      userId: input.userId,
    },
  });
}
