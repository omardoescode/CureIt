import env from "@/env";
import { Hono, type Context } from "hono";
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

const handleEndpoint = async (
  c: Context,
  from: string,
  to: string,
  method: "POST" | "PUT" | "PATCH",
  options: {
    require_auth?: boolean | "optional";
    additional_body_data?: Record<string, unknown>;
  } = { require_auth: false, additional_body_data: {} },
) => {
  const headers = new Headers(c.req.raw.headers);
  headers.set("CureIt-Coordination-Id", crypto.randomUUID());

  // Handle authentication
  if (options.require_auth) {
    const userId = await getUserId(c.req.header("Authorization"));
    if (userId) headers.set("CureIt-User-Id", userId);
    else if (options.require_auth === "optional")
      headers.set("CureIt-User-Id", "");
    else {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  const request: RequestInit = { method, headers };

  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = c.req.header("Content-Type") || "";

    if (contentType.startsWith("application/json")) {
      const body = await c.req.json();
      request.body = JSON.stringify({
        ...body,
        ...options.additional_body_data,
      });
    } else if (contentType.startsWith("multipart/form-data")) {
      const formData = await c.req.formData();

      if (options.additional_body_data) {
        for (const [key, value] of Object.entries(
          options.additional_body_data,
        )) {
          formData.append(key, String(value));
        }
      }

      request.body = formData;
      headers.delete("Content-Type");
    } else {
      request.body = await c.req.text();
    }
  }

  logger.info(`Forwarding ${from} request`, {
    coordinationId: headers.get("CureIt-Coordination-Id"),
    headers,
  });

  try {
    const res = await fetch(to, request);

    c.status(res.status as StatusCode);
    res.headers.forEach((value, key) => c.header(key, value));

    const body = await res.arrayBuffer();
    return c.body(body);
  } catch (err) {
    logger.error(`Request to ${to} failed`, { error: err });
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

v1app.post("/content/submit", (c) =>
  handleEndpoint(
    c,
    "/content/submit",
    `${env.CONTENT_STORAGE_SERVICE_URL}/api/submit_content`,
    "POST",
    {
      require_auth: true,
      additional_body_data: {
        submitted_at: new Date().toISOString(),
      },
    },
  ),
);

v1app.post("/auth/register", (c) =>
  handleEndpoint(
    c,
    "/auth/register",
    `${env.USER_SERVICE_URL}/auth/register`,
    "POST",
    {
      require_auth: false,
    },
  ),
);

v1app.post("/auth/login", (c) =>
  handleEndpoint(
    c,
    "/auth/login",
    `${env.USER_SERVICE_URL}/auth/login`,
    "POST",
    {
      require_auth: false,
    },
  ),
);

export default v1app;
