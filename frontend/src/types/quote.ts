export type CreateQuoteRequest = {
  age: number;
  annualIncome: string;
  partnerAnnualIncome: string;
  monthlyExpenses: string;
  dependants: number;
  mortgageBalance: string;
  otherDebts: string;
  savings: string;
  existingLifeCover: string;
  incomeReplacementYears: number;
};

export type Quote = CreateQuoteRequest & {
  id: string;
  userId: string;
  recommendedCoverAmount: string;
  estimatedMonthlyPremium: string;
  riskBand: string;
  recommendationSummary: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateQuoteResponse = {
  quote: Quote;
};

export type GetQuoteResponse = {
  quote: Quote;
};

export type GetQuotesResponse = {
  quotes: Quote[];
};
