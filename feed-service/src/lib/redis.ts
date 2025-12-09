import env from "@/env";
import Redis from "ioredis";
import logger from "./logger";
import { retry } from "@/utils/retry";

const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 20000,
});

await retry(() => redis.connect(), 1000, {
  connectionMsg: "Connected to Redis client successfully",
  retryMsg: "Failed to connect to redis. Retrying after a second",
});

redis.on("error", function (error) {
  logger.error(error);
});

export default redis;
