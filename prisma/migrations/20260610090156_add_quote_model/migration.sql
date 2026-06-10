-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "annualIncome" DECIMAL(12,2) NOT NULL,
    "partnerAnnualIncome" DECIMAL(12,2) NOT NULL,
    "monthlyExpenses" DECIMAL(12,2) NOT NULL,
    "dependants" INTEGER NOT NULL,
    "mortgageBalance" DECIMAL(12,2) NOT NULL,
    "otherDebts" DECIMAL(12,2) NOT NULL,
    "savings" DECIMAL(12,2) NOT NULL,
    "existingLifeCover" DECIMAL(12,2) NOT NULL,
    "incomeReplacementYears" INTEGER NOT NULL,
    "recommendedCoverAmount" DECIMAL(12,2) NOT NULL,
    "estimatedMonthlyPremium" DECIMAL(12,2) NOT NULL,
    "riskBand" TEXT NOT NULL,
    "recommendationSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
