/**
 * @file Express router defining the endpoints for auth
 */

import { Router } from "express";
import {
  loginController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

// Protected route requiring valid JWT session token
authRouter.get("/me", requireAuth, meController);
