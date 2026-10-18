import { describe, expect, it } from "vitest";
import {
  calculateCover,
  getAgeMultiplier,
} from "./cover-calculation.service.js";
import type { CreateQuoteInput } from "../schemas/quote.schema.js";

describe("getAgeMultiplier", () => {
  const testCases = [
    { age: 18, expected: 0.8 },
    { age: 29, expected: 0.8 },
    { age: 30, expected: 1 },
    { age: 45, expected: 1 },
    { age: 46, expected: 1.5 },
    { age: 60, expected: 1.5 },
    { age: 61, expected: 2.2 },
    { age: 80, expected: 2.2 },
  ];

  testCases.forEach(({ age, expected }) => {
    it(`returns ${expected} for age ${age}`, () => {
      expect(getAgeMultiplier(age).toNumber()).toBe(expected);
    });
  });
});

describe("calculateCover", () => {
  const baseInput: CreateQuoteInput = {
    age: 34,
    annualIncome: "55000",
    partnerAnnualIncome: "25000",
    monthlyExpenses: "3000",
    dependants: 2,
    mortgageBalance: "180000",
    otherDebts: "8000",
    savings: "12000",
    existingLifeCover: "50000",
    incomeReplacementYears: 10,
  };

  it("calculates the recommended cover amount and premium", () => {
    const result = calculateCover(baseInput);

    expect(result.recommendedCoverAmount).toBe("830000.00");
    expect(result.estimatedMonthlyPremium).toBe("49.80");
    expect(result.riskBand).toBe("medium");
    expect(result.recommendationSummary).toContain("income replacement goal");
  });

  it("rounds the recommended cover amount up to the nearest 10,000", () => {
    const result = calculateCover({
      ...baseInput,
      annualIncome: "1",
      monthlyExpenses: "1",
      dependants: 0,
      mortgageBalance: "0",
      otherDebts: "0",
      savings: "0",
      existingLifeCover: "0",
      incomeReplacementYears: 1,
    });

    expect(result.recommendedCoverAmount).toBe("10000.00");
  });

  it("does not recommend negative cover when existing support exceeds needs", () => {
    const result = calculateCover({
      ...baseInput,
      annualIncome: "10000",
      monthlyExpenses: "500",
      dependants: 0,
      mortgageBalance: "0",
      otherDebts: "0",
      savings: "1000000",
      existingLifeCover: "1000000",
      incomeReplacementYears: 1,
    });

    expect(result.recommendedCoverAmount).toBe("0.00");
    expect(result.estimatedMonthlyPremium).toBe("0.00");
  });

  it("returns low risk for a younger user with no dependants and lower cover", () => {
    const result = calculateCover({
      ...baseInput,
      age: 25,
      annualIncome: "20000",
      monthlyExpenses: "500",
      dependants: 0,
      mortgageBalance: "0",
      otherDebts: "0",
      savings: "0",
      existingLifeCover: "0",
      incomeReplacementYears: 1,
    });

    expect(result.riskBand).toBe("low");
  });

  it("returns high risk for an older user with multiple dependants and high cover", () => {
    const result = calculateCover({
      ...baseInput,
      age: 61,
      annualIncome: "100000",
      monthlyExpenses: "5000",
      dependants: 3,
      mortgageBalance: "500000",
      otherDebts: "50000",
      savings: "0",
      existingLifeCover: "0",
      incomeReplacementYears: 10,
    });

    expect(result.riskBand).toBe("high");
  });
});
