import logger from "@/lib/logger";
import type { Context } from "hono";
import { decode } from "hono/jwt";

export async function getUserId(c: Context): Promise<string | null> {
  const auth_header = c.req.header("Authorization");
  if (!auth_header) return null;
  if (!auth_header.startsWith("Bearer ")) return null;

  const token = auth_header.slice("Bearer ".length);
  try {
    const payload = decode(token);
    const user_id = payload.payload.userId as string | undefined;
    logger.info(`UserID: ${user_id}`); // NOTE: for debugging only
    return user_id ?? null;
  } catch (err) {
    logger.warn("Invalid JWT token", { error: err });
    return null;
  }
}
