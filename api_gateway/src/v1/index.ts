import env from "@/env";
import { Hono } from "hono";
import { type StatusCode } from "hono/utils/http-status";

const v1app = new Hono();

v1app.post("/content/submit", async (c) => {
  const body = await c.req.text();

  const headers = new Headers(c.req.raw.headers);
  headers.set("CureIt-User-Id", "some_random_uuid");
  headers.set("CureIt-Correlation-Id", crypto.randomUUID());

  try {
    const response = await fetch(
      `${env.CONTENT_PROCESSING_SERVICE_URL}/api/submit_content`,
      {
        method: "POST",
        headers,
        body,
      },
    );

    const res_json = await response.json();

    c.status(response.status as StatusCode);
    for (const [key, value] of response.headers.entries()) c.header(key, value);

    return c.json(res_json);
  } catch (err) {
    console.error("Failed to reach content service:", err);
    return c.json({ error: "Content processing service unavailable" }, 503);
  }
});

export default v1app;
