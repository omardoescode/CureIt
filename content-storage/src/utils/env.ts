import z from "zod";

const validPort = (val: string) => {
  if (!/^\d+$/.test(val)) throw new Error("PORT must be an integer string");

  const parsed = Number(val);
  if (parsed < 1 || parsed > 65535)
    throw new Error("PORT must be between 1 and 65535");

  return parsed;
};

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "testing", "produdction"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "error", "warn", "info"]).default("debug"),
  PORT: z.string().transform(validPort),
  MONGO_URL: z.string(),
  CONTENT_PROCESSING_SERVICE_URL: z.url(),
  KAFKA_CLIENT_ID: z.string().nonempty(),
  KAFKA_GROUP_ID: z.string().nonempty(),
  KAFKA_BROKERS: z
    .string()
    .nonempty()
    .transform((x) => x.split(","))
    .pipe(z.array(z.string().nonempty()).nonempty()),
  KAFKA_CONTENT_CREATION_TOPIC_NAME: z.string().nonempty(),
  KAFKA_CONTENT_UPDATE_TOPIC_NAME: z.string().nonempty(),
  KAFKA_CURATION_UPDATE_TOPIC_NAME: z.string().nonempty(),
});

const env = Object.freeze(envSchema.parse(process.env));

export default env;
