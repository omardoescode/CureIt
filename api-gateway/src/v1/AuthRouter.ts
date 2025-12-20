import env from "@/env";
import logger from "@/lib/logger";
import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";

const AuthRouter = new Hono();

AuthRouter.post("/login", async (c) => {
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

AuthRouter.post("/register", async (c) => {
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

export default AuthRouter;
