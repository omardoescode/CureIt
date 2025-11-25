import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["info", "debug", "warn", "error"]).default("info"),
  CONTENT_STORAGE_SERVICE_URL: z.url(),
  KAFKA_BROKERS: z
    .string()
    .nonempty()
    .transform((x) => x.split(","))
    .pipe(z.array(z.string().nonempty()).nonempty()),
  KAFKA_CLIENT_ID: z.string().nonempty(),
  KAFKA_GROUP_ID: z.string().nonempty(),
  KAFKA_INTERACTION_EVENTS_TOPIC_NAME: z.string().nonempty(),
  REDIS_URL: z.string().nonempty(),
});

const env = Object.freeze(envSchema.parse(process.env));

export default env;
