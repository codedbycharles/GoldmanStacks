import express from "express";
import { rateLimit } from "express-rate-limit";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("Rate limiting", () => {
  it("returns 429 when the request limit is exceeded", async () => {
    const app = express();

    const limiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 2,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    });

    app.get("/test", limiter, (_req, res) => {
      res.status(200).json({ message: "OK" });
    });

    const first = await request(app).get("/test");
    const second = await request(app).get("/test");
    const third = await request(app).get("/test");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(third.status).toBe(429);
  });
});
