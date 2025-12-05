import z from "zod";

const validPort = (val: string) => {
  if (!/^\d+$/.test(val))
    throw new Error(
      "CONTENT_PROCESSING_SERVICE_PORT must be an integer string",
    );

  const parsed = Number(val);
  if (parsed < 1 || parsed > 65535)
    throw new Error(
      "CONTENT_PROCESSING_SERVICE_PORT must be between 1 and 65535",
    );

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
});

const env = Object.freeze(envSchema.parse(process.env));

export default env;
