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
  getContentMetadata,
} from "./service/ContentItem";
import mongoose from "mongoose";
import env from "@/utils/env";
import logger from "@/lib/logger";
import { logger as logMiddleware } from "hono/logger";
import { SubmissionBodySchema } from "./validation/content_url";
import { AppError } from "./utils/error";
import { consumer, producer } from "./lib/kakfa";
import ContentRouter from "./router/ContentRouter";

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
  producer
    .connect()
    .then(() => logger.info("Connected to kafka producer successfully")),
  consumer
    .connect()
    .then(() =>
      consumer.subscribe({
        topics: [env.KAFKA_CURATION_UPDATE_TOPIC_NAME],
      }),
    )
    .then(() =>
      logger.info("Connected to kafka consumer, and subscribed successfully"),
    ),
);

await Promise.all(promises).catch((err) => {
  logger.error(err);
  process.exit(1);
});

const app = new Hono().basePath("/api");

app.use(logMiddleware());

app.route("/content", ContentRouter);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
