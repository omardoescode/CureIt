import { Hono } from "hono";
import env from "./env";
import Redis from "ioredis";
import logger from "./lib/logger";
import { logger as loggerMiddleware } from "hono/logger";
import { Kafka } from "kafkajs";

const app = new Hono().basePath("/api");
app.use(loggerMiddleware());

const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 20000,
});

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS,
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 5000,
    retries: 20,
  },
});

redis.on("error", function (error) {
  logger.error(error);
});

export default {
  fetch: app.fetch,
  port: env.PORT,
};
