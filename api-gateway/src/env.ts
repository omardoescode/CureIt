import z from "zod";
import { validPort } from "@/utils/validators";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["info", "debug", "warn", "error"]).default("info"),
  CONTENT_STORAGE_SERVICE_URL: z.url(),
  USER_SERVICE_URL: z.url(),
  FEED_SERVICE_URL: z.url(),
  INTERACTION_SERVICE_URL: z.url(),
  PORT: z.string().transform(validPort),
});

const env = Object.freeze(envSchema.parse(process.env));

export default env;
