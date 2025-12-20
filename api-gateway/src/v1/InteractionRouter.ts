import { Hono } from "hono";
import { getUserId } from "./helpers";
import env from "@/env";
import type { StatusCode } from "hono/utils/http-status";
import logger from "@/lib/logger";

const InteractionRouter = new Hono();

InteractionRouter.post("/topic", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ error: "Invalid json" }, 401);
    }

    const res = await fetch(`${env.INTERACTION_SERVICE_URL}/api/topic`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

InteractionRouter.post("/type", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ error: "Invalid json" }, 401);
    }

    const res = await fetch(`${env.INTERACTION_SERVICE_URL}/api/type`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

InteractionRouter.post("/upvote", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ error: "Invalid json" }, 401);
    }

    const res = await fetch(`${env.INTERACTION_SERVICE_URL}/api/upvote`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

InteractionRouter.post("/downvote", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ error: "Invalid json" }, 401);
    }

    const res = await fetch(`${env.INTERACTION_SERVICE_URL}/api/downvote`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

InteractionRouter.post("/follow", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ error: "Invalid json" }, 401);
    }

    const res = await fetch(`${env.INTERACTION_SERVICE_URL}/api/follow`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

InteractionRouter.post("/unfollow", async (c) => {
  try {
    const userId = await getUserId(c);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json().catch(() => null);
    if (!body) {
      return c.json({ error: "Invalid json" }, 401);
    }

    const res = await fetch(`${env.INTERACTION_SERVICE_URL}/api/unfollow`, {
      method: "POST",
      headers: {
        "CureIt-Coordination-Id": crypto.randomUUID(),
        "CureIt-User-Id": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
export default InteractionRouter;
