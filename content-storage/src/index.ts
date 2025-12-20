import { Hono } from "hono";
import mongoose from "mongoose";
import env from "@/utils/env";
import logger from "@/lib/logger";
import { logger as logMiddleware } from "hono/logger";
import { consumer, producer } from "./lib/kakfa";
import ContentRouter from "./router/ContentRouter";
import type { EachMessagePayload } from "kafkajs";
import { CurationUpdateEventSchmea } from "./validation/curation";
import { CurationUpdateHandler } from "./service/CurationMessageHandler";

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

consumer
  .run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      const stringified = message.value?.toString();
      if (!stringified) {
        logger.warn(`Didn't receive a value`);
        return;
      }
      let json: any;
      try {
        json = JSON.parse(stringified);
      } catch {
        logger.warn(`Failed to parse message to JSON: ${stringified}`);
        return;
      }

      const parsed = CurationUpdateEventSchmea.safeParse(json);

      if (parsed.error) {
        logger.warn(
          `Failed to parse message. value=${message.value?.toString()}`,
          parsed.error.issues,
        );
        return;
      }

      logger.info(`Received mesage: ${stringified}`);
      await CurationUpdateHandler.handle(parsed.data);
    },
  })
  .then(() => logger.info("Consumer run method has been thened lol"));


const app = new Hono().basePath("/api");
app.use(logMiddleware());
app.route("/content", ContentRouter);

export default {
  fetch: app.fetch,
  port: env.PORT,
};
