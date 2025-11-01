import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["info", "debug", "warn", "error"]).default("info"),
  CONTENT_PROCESSING_SERVICE_URL: z.url(),
});

const env = Object.freeze(envSchema.parse(process.env));

export default env;
