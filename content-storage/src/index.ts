import zValidator from "@/utils/zValidator";
import { Hono } from "hono";
import { ContentItemSlugSchema } from "./validation/content";
import {
  BaseHeadersSchema,
  BaseProtectedHeadersSchema,
} from "./validation/headers";
import { submitContent, getContentItem } from "./service/ContentItem";
import mongoose from "mongoose";
import env from "@/utils/env";
import logger from "@/lib/logger";
import { logger as logMiddleware } from "hono/logger";
import { SubmissionBodySchema } from "./validation/content_url";
import { AppError } from "./utils/error";

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
  "/submit_content",
  zValidator("header", BaseProtectedHeadersSchema),
  zValidator("json", SubmissionBodySchema),
  async (c) => {
    const headers = c.req.valid("header");
    const body = c.req.valid("json");

    const content_slug = await submitContent(headers, body);
    if (content_slug instanceof AppError) {
      logger.error(`Error getting content slug: ${content_slug}`);
      return c.json({ error: "Internal Server Error" }, 500);
    }
    return c.json({ content_slug }, 200);
  },
);

app.get(
  "content/:slug",
  zValidator("header", BaseHeadersSchema),
  zValidator("param", ContentItemSlugSchema),
  async (c) => {
    const headers = c.req.valid("header");
    const { slug } = c.req.valid("param");

    const content = await getContentItem(headers, slug);
    return c.json(content, 200);
  },
);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
