import env from "@/env";
import logger from "@/lib/logger";
import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { getUserId } from "./helpers";

const ContentRouter = new Hono();

ContentRouter.post("/submit", async (c) => {
  try {
    const body = await c.req.json().catch(() => {});

    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const res = await fetch(`${env.CONTENT_STORAGE_SERVICE_URL}/api/content`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        submitted_at: new Date().toISOString(),
      }),
    });

    c.status(res.status as StatusCode);
    res.headers.forEach((value, key) => c.header(key, value));
    const responseBody = await res.arrayBuffer();
    return c.body(responseBody);
  } catch (err) {
    logger.error("Failed to submit content", { error: err });
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

ContentRouter.get(":slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const res = await fetch(
      `${env.CONTENT_STORAGE_SERVICE_URL}/api/content/${slug}`,
      {
        method: "GET",
        headers: {
          "CureIt-Coordination-Id": crypto.randomUUID(),
          "CureIt-User-Id": userId,
        },
      },
    );

    c.status(res.status as StatusCode);
    res.headers.forEach((value, key) => c.header(key, value));
    const responseBody = await res.arrayBuffer();
    return c.body(responseBody);
  } catch (err) {
    logger.error("Failed to submit content", { error: err });
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default ContentRouter;
