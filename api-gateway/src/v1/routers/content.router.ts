import env from "@/env";
import logger from "@/lib/logger";
import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export const contentRouter = new Hono();

contentRouter.post("/content/submit", async (c) => {
  const body = await c.req.json();

  const headers = new Headers(c.req.raw.headers);
  headers.set("CureIt-User-Id", "some_random_uuid");
  headers.set("CureIt-Coordination-Id", crypto.randomUUID());

  logger.info("Forwarding /content/submit request", {
    coordinationId: headers.get("CureIt-Coordination-Id"),
  });

  try {
    const response = await fetch(
      `${env.CONTENT_STORAGE_SERVICE_URL}/api/submit_content`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...body,
          submitted_at: new Date().toISOString(),
        }),
      },
    );

    const res_json = await response.json();

    c.status(response.status as StatusCode);
    for (const [key, value] of response.headers.entries()) c.header(key, value);

    logger.info(
      `Received from ${env.CONTENT_STORAGE_SERVICE_URL}/api/submit_content`,
      {
        correlationId: headers.get("CureIt-Coordination-Id"),
        body,
        headers,
      },
    );

    return c.json(res_json);
  } catch (err) {
    logger.error("Failed to reach content service:", { error: err });
    return c.json({ error: "Content processing service unavailable" }, 503);
  }
});
