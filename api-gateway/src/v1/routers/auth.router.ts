import env from "@/env";
import logger from "@/lib/logger";
import { Hono } from "hono";

export const authRouter = new Hono();

authRouter.post("/register", async (c) => {});
