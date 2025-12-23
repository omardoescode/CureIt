import { Hono } from "hono";
import env from "./env";
import logger from "./lib/logger";
import { logger as loggerMiddleware } from "hono/logger";
import mongoose from "mongoose";
import { ConsumerMessageSchema } from "./validation/ConsumerSchemas.ts";
import { Controller } from "./service/Controller.ts";
import type { EachMessagePayload } from "kafkajs";
import { consumer } from "./lib/kafka";
import FeedRouter from "./router/FeedRouter";

await mongoose
  .connect(env.MONGO_URL)
  .then(() => logger.info("Connected to mongoose successfully"))
  .catch((err) => {
    logger.error("Failed to connect to the database");
    throw err;
  });

const app = new Hono().basePath("/api");
app.use(loggerMiddleware());

app.route("/feed", FeedRouter);

const topics = [
  env.KAFKA_CONTENT_CREATION_TOPIC_NAME,
  env.KAFKA_CONTENT_UPDATE_TOPIC_NAME,
  env.KAFKA_INTERACTION_EVENTS_TOPIC_NAME,
];
await consumer
  .subscribe({
    topics,
    fromBeginning: true,
  })
  .then(() =>
    logger.info(`Successfully subscribed to Kafka topics: ${topics}`),
  );

consumer
  .run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      const body = message.value?.toString();
      if (!body) {
        logger.warn("Received message with no value");
        return;
      }

      logger.info(`Received message: ${body}`);
      let parsed;
      try {
        const msg = JSON.parse(body);
        parsed = ConsumerMessageSchema.parse(msg);
        logger.info(`parsed ${body}`);
      } catch (_) {
        // Must have been a message we don't care aobut
        // TODO: Later, distinguish between each type of message, this is an architecture task
        logger.warn(`failed to parse ${body}`);
        return;
      }

      await Controller.handleMessage(parsed).catch((err) =>
        logger.error("Error occurred while handling messages", err),
      );
    },
  })
  .then(() => logger.info("Consumer run method has been registered"));

export default {
  fetch: app.fetch,
  port: env.PORT,
};
