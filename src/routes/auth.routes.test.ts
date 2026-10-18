import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { prisma } from "../config/prisma.js";

const testEmails: string[] = [];

function uniqueEmail(prefix: string) {
  const email = `${prefix}-${randomUUID()}@example.com`;
  testEmails.push(email);
  return email;
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

describe("Auth routes", () => {
  it("registers a new user", async () => {
    const email = uniqueEmail("register");

    const response = await request(app).post("/auth/register").send({
      email,
      password: "Password123!",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(email);
    expect(response.body.user).not.toHaveProperty("passwordHash");
  });

  it("logs in an existing user", async () => {
    const email = uniqueEmail("login");
    const password = "Password123!";

    const registerResponse = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(registerResponse.status).toBe(201);

    const response = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(email);
  });

  it("rejects /auth/me without a token", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
  });

  it("returns the current user with a valid token", async () => {
    const email = uniqueEmail("me");
    const password = "Password123!";

    const registerResponse = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(registerResponse.status).toBe(201);

    const token = registerResponse.body.token;

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe(email);
  });

  it("rejects incorrect login credentials", async () => {
    const email = uniqueEmail("wrong-password");

    const registerResponse = await request(app).post("/auth/register").send({
      email,
      password: "Password123!",
    });

    expect(registerResponse.status).toBe(201);

    const response = await request(app).post("/auth/login").send({
      email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
  });

  it("rejects login for an unknown email", async () => {
    const email = uniqueEmail("unknown");

    const response = await request(app).post("/auth/login").send({
      email,
      password: "Password123!",
    });

    expect(response.status).toBe(401);
  });
});
