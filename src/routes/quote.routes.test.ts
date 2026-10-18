import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { prisma } from "../config/prisma.js";
import { Decimal } from "decimal.js";

const testEmails: string[] = [];

const validQuotePayload = {
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

async function registerTestUser(prefix: string) {
  const email = `${prefix}-${randomUUID()}@example.com`;
  const password = "Password123!";

  testEmails.push(email);

  const response = await request(app)
    .post("/auth/register")
    .send({ email, password });

  expect(response.status).toBe(201);
  expect(response.body.token).toEqual(expect.any(String));

  return {
    email,
    token: response.body.token as string,
  };
}

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: testEmails,
      },
    },
  });
});

describe("Quote routes", () => {
  it("rejects quote creation without authentication", async () => {
    const response = await request(app).post("/quotes").send(validQuotePayload);

    expect(response.status).toBe(401);
  });

  it("rejects an invalid quote payload", async () => {
    const user = await registerTestUser("invalid-quote");

    const response = await request(app)
      .post("/quotes")
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        ...validQuotePayload,
        age: 12,
      });

    expect(response.status).toBe(400);
  });

  it("creates a quote for an authenticated user", async () => {
    const user = await registerTestUser("create-quote");

    const response = await request(app)
      .post("/quotes")
      .set("Authorization", `Bearer ${user.token}`)
      .send(validQuotePayload);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty("quote");
    expect(response.body.quote).toHaveProperty("id");

    expect(
      new Decimal(response.body.quote.recommendedCoverAmount).equals(
        "830000.00",
      ),
    ).toBe(true);

    expect(
      new Decimal(response.body.quote.estimatedMonthlyPremium).equals("49.80"),
    ).toBe(true);

    expect(response.body.quote.riskBand).toBe("medium");
  });

  it("rejects quote creation with a malformed token", async () => {
    const response = await request(app)
      .post("/quotes")
      .set("Authorization", "Bearer invalid-token")
      .send(validQuotePayload);

    expect(response.status).toBe(401);
  });

  it("rejects quote history requests without authentication", async () => {
    const response = await request(app).get("/quotes");

    expect(response.status).toBe(401);
  });

  it("returns an empty history for a new user", async () => {
    const user = await registerTestUser("empty-history");

    const response = await request(app)
      .get("/quotes")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.quotes).toEqual([]);
  });

  it("returns quotes belonging to the authenticated user", async () => {
    const user = await registerTestUser("history");

    const createResponse = await request(app)
      .post("/quotes")
      .set("Authorization", `Bearer ${user.token}`)
      .send(validQuotePayload);

    expect(createResponse.status).toBe(201);

    const quoteId = createResponse.body.quote.id;

    const response = await request(app)
      .get("/quotes")
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.quotes)).toBe(true);

    expect(
      response.body.quotes.some(
        (quote: { id: string }) => quote.id === quoteId,
      ),
    ).toBe(true);
  });

  it("returns a specific quote to its owner", async () => {
    const user = await registerTestUser("owner-detail");

    const createResponse = await request(app)
      .post("/quotes")
      .set("Authorization", `Bearer ${user.token}`)
      .send(validQuotePayload);

    expect(createResponse.status).toBe(201);

    const quoteId = createResponse.body.quote.id;

    const response = await request(app)
      .get(`/quotes/${quoteId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(200);
    expect(response.body.quote.id).toBe(quoteId);
  });

  it("returns 404 when a quote does not exist", async () => {
    const user = await registerTestUser("missing-quote");

    const missingQuoteId = randomUUID();

    const response = await request(app)
      .get(`/quotes/${missingQuoteId}`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(response.status).toBe(404);
  });

  it("prevents another user from accessing a quote", async () => {
    const userA = await registerTestUser("user-a");
    const userB = await registerTestUser("user-b");

    const createResponse = await request(app)
      .post("/quotes")
      .set("Authorization", `Bearer ${userA.token}`)
      .send(validQuotePayload);

    expect(createResponse.status).toBe(201);

    const quoteId = createResponse.body.quote.id;

    const response = await request(app)
      .get(`/quotes/${quoteId}`)
      .set("Authorization", `Bearer ${userB.token}`);

    expect(response.status).toBe(404);
  });

  it("does not include another user's quotes in history", async () => {
    const userA = await registerTestUser("list-a");
    const userB = await registerTestUser("list-b");

    const createResponse = await request(app)
      .post("/quotes")
      .set("Authorization", `Bearer ${userA.token}`)
      .send(validQuotePayload);

    expect(createResponse.status).toBe(201);

    const quoteId = createResponse.body.quote.id;

    const response = await request(app)
      .get("/quotes")
      .set("Authorization", `Bearer ${userB.token}`);

    expect(response.status).toBe(200);

    expect(
      response.body.quotes.some(
        (quote: { id: string }) => quote.id === quoteId,
      ),
    ).toBe(false);
  });
});
