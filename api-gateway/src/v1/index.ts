import env from "@/env";
import { Hono } from "hono";
import { type StatusCode } from "hono/utils/http-status";
import logger from "@/lib/logger";
import { decode } from "hono/jwt";

const v1app = new Hono();

async function getUserId(
  auth_header: string | undefined,
): Promise<string | null> {
  if (!auth_header) return null;
  if (!auth_header.startsWith("Bearer ")) return null;
  const token = auth_header.slice("Bearer ".length);
  try {
    const payload = decode(token);
    const user_id = payload.payload.userId as string | undefined;
    return user_id ?? null;
  } catch (err) {
    logger.warn("Invalid JWT token", { error: err });
    return null;
  }
}

v1app.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json().catch(() => {});

    const res = await fetch(`${env.USER_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    c.status(res.status as StatusCode);
    res.headers.forEach((value, key) => c.header(key, value));

    const responseBody = await res.arrayBuffer();
    return c.body(responseBody);
  } catch (err) {
    logger.error("Login request failed", { error: err });
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

v1app.post("/auth/register", async (c) => {
  try {
    const formData = await c.req.formData();

    const res = await fetch(`${env.USER_SERVICE_URL}/auth/register`, {
      method: "POST",
      body: formData,
    });

    c.status(res.status as StatusCode);
    res.headers.forEach((value, key) => c.header(key, value));
    const body = await res.arrayBuffer();
    return c.body(body);
  } catch (err) {
    logger.error("Failed to register user", { error: err });
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

v1app.post("/content/submit", async (c) => {
  try {
    const body = await c.req.json().catch(() => {});

    const userId = await getUserId(c.req.header("Authorization"));
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    const res = await fetch(
      `${env.CONTENT_STORAGE_SERVICE_URL}/api/submit_content`,
      {
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

v1app.get("/content/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const userId = await getUserId(c.req.header("Authorization"));
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

export default v1app;
