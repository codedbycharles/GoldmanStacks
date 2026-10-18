import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { quoteRouter } from "./routes/quote.routes.js";

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/quotes", quoteRouter);
