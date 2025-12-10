import { Hono } from "hono";
import env from "./env";
import logger from "./lib/logger";
import { logger as loggerMiddleware } from "hono/logger";
import mongoose from "mongoose";
import { interactionConsumer } from "./lib/kafka";
import { InteractionEventSchema, type InteractionEvent } from "./validation";
import { MessageHandler } from "./service/MessageHandler";

await mongoose
  .connect(env.MONGO_URL)
  .then(() => logger.info("Connected to mongoose successfully"))
  .catch((err) => {
    console.error("Failed to connect to the database");
    throw err;
  });

const app = new Hono().basePath("/api");
app.use(loggerMiddleware());

interactionConsumer.run({
  eachMessage: async ({ message }) => {
    const body = message.value?.toString();
    if (!body) {
      logger.warn("Received message with no value");
      return;
    }

    logger.info(`Received message: ${body}`);
    let parsed: InteractionEvent | null;
    try {
      const msg = JSON.parse(body);
      parsed = InteractionEventSchema.parse(msg);
    } catch (_) {
      // Must have been a message we don't care aobut
      // TODO: Later, distinguish between each type of message, this is an architecture task
      return;
    }

    await MessageHandler.handleMessage(parsed);
  },
});

export default {
  fetch: app.fetch,
  port: env.PORT,
};
