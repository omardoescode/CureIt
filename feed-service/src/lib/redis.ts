import env from "@/env";
import Redis from "ioredis";
import logger from "./logger";

const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 20000,
});

redis.on("error", function (error) {
  logger.error(error);
});

export default redis;
