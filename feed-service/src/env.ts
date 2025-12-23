import z from "zod";
import { validPort } from "@/utils/validators";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["info", "debug", "warn", "error"]).default("info"),
  PORT: z.string().transform(validPort),
  REDIS_URL: z.url(),
  KAFKA_BROKERS: z
    .string()
    .nonempty()
    .transform((x) => x.split(","))
    .pipe(z.array(z.string().nonempty()).nonempty()),
  KAFKA_CLIENT_ID: z.string().nonempty(),
  KAFKA_GROUP_ID: z.string().nonempty(),
  KAFKA_INTERACTION_EVENTS_TOPIC_NAME: z.string().nonempty(),
  KAFKA_CONTENT_UPDATE_TOPIC_NAME: z.string().nonempty(),
  KAFKA_CONTENT_CREATION_TOPIC_NAME: z.string().nonempty(),
  MONGO_URL: z.url(),
  CONTENT_STORAGE_SERVICE_URL: z.url(),
});

const env = Object.freeze(envSchema.parse(process.env));

export default env;
