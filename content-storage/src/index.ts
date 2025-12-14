import zValidator from "@/utils/zValidator";
import { Hono } from "hono";
import {
  ContentItemIdSchema,
  ContentItemSlugSchema,
} from "./validation/content";
import {
  BaseHeadersSchema,
  BaseProtectedHeadersSchema,
} from "./validation/headers";
import {
  submitContent,
  getContentItemBySlug,
  getContentItemById,
} from "./service/ContentItem";
import mongoose from "mongoose";
import env from "@/utils/env";
import logger from "@/lib/logger";
import { logger as logMiddleware } from "hono/logger";
import { SubmissionBodySchema } from "./validation/content_url";
import { AppError } from "./utils/error";
import { contentCreationProducer } from "./lib/kakfa";

const promises = [];
// Connect to database
promises.push(
  mongoose
    .connect(env.MONGO_URL)
    .then(() => logger.info("Connected to mongoose successfully"))
    .catch((err) => {
      console.error("Failed to connect to the database");
      throw err;
    }),
);

// Connect to kafka
promises.push(
  contentCreationProducer
    .connect()
    .then(() => logger.info("Connected to kafka producer successfully")),
);

await Promise.all(promises).catch((err) => {
  logger.error(err);
  process.exit(1);
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

    const content = await getContentItemBySlug(headers, slug);
    if (!content) return c.json({ error: "not found" }, 404);
    return c.json(content, 200);
  },
);

app.get(
  "internal/content/metadata/:id",
  zValidator("header", BaseHeadersSchema),
  zValidator("param", ContentItemIdSchema),
  async (c) => {
    const headers = c.req.valid("header");
    const { id } = c.req.valid("param");

    const content = await getContentItemById(headers, id);
    if (!content) return c.json({ error: "not found" }, 404);
    return c.json(content, 200);
  },
);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
