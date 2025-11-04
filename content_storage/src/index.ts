import zValidator from "@/utils/zValidator";
import { Hono } from "hono";
import { ContentSubmissionBodySchema } from "./validation/content";
import { BaseHeadersSchema } from "./validation/headers";
import { submitContent } from "./service/ContentItem";
import mongoose from "mongoose";
import env from "@/utils/env";
import logger from "@/lib/logger";
import { logger as logMiddleware } from "hono/logger";

// Connect to database
await mongoose
  .connect(env.MONGO_URL)
  .then(() => logger.info("Connected to mongoose successfully"))
  .catch((err) => {
    console.error("Failed to connect to the database");
    throw err;
  });

const app = new Hono().basePath("/api");

app.use(logMiddleware());

app.post(
  "create_submission",
  zValidator("header", BaseHeadersSchema),
  zValidator("json", ContentSubmissionBodySchema),
  async (c) => {
    const headers = c.req.valid("header");
    const body = c.req.valid("json");

    await submitContent(headers, body);
    c.status(204);
    return c.json(null);
  },
);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
