/**
 * @file Calculations for life insurance quotes using standard DIME model
 */
import { Decimal } from "decimal.js";
import type { CreateQuoteInput } from "../schemas/quote.schema.js";

type CoverCalculationResult = {
  recommendedCoverAmount: string;
  estimatedMonthlyPremium: string;
  riskBand: "low" | "medium" | "high";
  recommendationSummary: string;
};

// Rounds a value upward to the nearest multiple of 10,000
function roundUpToNearestTenThousand(value: Decimal) {
  return value.dividedBy(10000).ceil().times(10000);
}

export function getAgeMultiplier(age: number) {
  if (age < 30) return new Decimal(0.8);
  if (age <= 45) return new Decimal(1);
  if (age <= 60) return new Decimal(1.5);
  return new Decimal(2.2);
}

// Calculates risk category from looking at factors
function getRiskBand(age: number, dependants: number, coverAmount: Decimal) {
  let score = 0;

  if (age >= 46) score += 25;
  else if (age >= 31) score += 10;

  if (dependants >= 3) score += 20;
  else if (dependants >= 1) score += 10;

  if (coverAmount.greaterThan(750000)) score += 25;
  else if (coverAmount.greaterThan(300000)) score += 10;

  if (score >= 50) return "high";
  if (score >= 20) return "medium";
  return "low";
}

/**
 * Calculate how much insurance cover someone needs.
 * Adds up what they owe and what they want to replace (income, kids, mortgage),
 * subtracts what they already have (savings etc) then calculate out the premium.
 */
export function calculateCover(
  input: CreateQuoteInput,
): CoverCalculationResult {
  const annualIncome = new Decimal(input.annualIncome);
  const monthlyExpenses = new Decimal(input.monthlyExpenses);
  const mortgageBalance = new Decimal(input.mortgageBalance);
  const otherDebts = new Decimal(input.otherDebts);
  const savings = new Decimal(input.savings);
  const existingLifeCover = new Decimal(input.existingLifeCover);

  // 1. Calculate financial needs and buffers
  const incomeReplacementNeed = annualIncome.times(
    input.incomeReplacementYears,
  );
  const expenseSupportNeed = monthlyExpenses.times(12).times(3); // 3-year survival buffer
  const dependantBuffer = new Decimal(input.dependants).times(20000); // 20k per child
  const liabilities = mortgageBalance.plus(otherDebts);
  const availableSupport = savings.plus(existingLifeCover);

  // 2. Subtract what they own from what they owe to find the insurance gap
  const rawCoverNeed = incomeReplacementNeed
    .plus(expenseSupportNeed)
    .plus(dependantBuffer)
    .plus(liabilities)
    .minus(availableSupport);

  // Ensure recommendations never fall below zero and round up
  const recommendedCoverAmount = Decimal.max(
    new Decimal(0),
    roundUpToNearestTenThousand(rawCoverNeed),
  );

  // 3. Calculate the monthly bill based on age risk and total coverage
  const ageMultiplier = getAgeMultiplier(input.age);
  const baseRatePerThousand = new Decimal(0.06); // Standard rate

  const estimatedMonthlyPremium = recommendedCoverAmount
    .dividedBy(1000)
    .times(baseRatePerThousand)
    .times(ageMultiplier)
    .toDecimalPlaces(2);

  const riskBand = getRiskBand(
    input.age,
    input.dependants,
    recommendedCoverAmount,
  );

  const recommendationSummary =
    "Your recommended cover is mainly driven by your income replacement goal, household expenses, outstanding debts and number of dependants. Savings and existing life cover reduce the estimated cover gap.";

  return {
    recommendedCoverAmount: recommendedCoverAmount.toFixed(2),
    estimatedMonthlyPremium: estimatedMonthlyPremium.toFixed(2),
    riskBand,
    recommendationSummary,
  };
}
