import env from "@/env";
import logger from "@/lib/logger";
import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { getUserId } from "./helpers";

const FeedRouter = new Hono();

FeedRouter.get("/:type{^(hot|new|top)$}", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const query = c.req.query();
    const type = c.req.param("type");
    const qs = new URLSearchParams(query).toString();
    const res = await fetch(`${env.FEED_SERVICE_URL}/api/feed/${type}?${qs}`, {
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
      },
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

FeedRouter.get("/topic/:topic/:type{^(hot|new|top)$}", async (c) => {
  try {
    const query = c.req.query();
    const type = c.req.param("type");
    const topic = c.req.param("topic");
    const qs = new URLSearchParams(query).toString();
    const res = await fetch(
      `${env.FEED_SERVICE_URL}/api/feed/topic/${topic}/${type}?${qs}`,
      {
        headers: {
          "CureIt-Coordination-Id": crypto.randomUUID(),
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

export default FeedRouter;
