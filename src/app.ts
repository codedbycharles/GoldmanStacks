import express from "express";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";

export const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
