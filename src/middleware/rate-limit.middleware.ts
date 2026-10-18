import { rateLimit } from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Allow more requests while running tests
  limit: process.env.NODE_ENV === "test" ? 100 : 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    error: {
      message: "Too many authentication attempts. Please try again later.",
    },
  },
});
