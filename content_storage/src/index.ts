import zValidator from "@/utils/zValidator";
import { Hono } from "hono";
import { ContentSubmissionBodySchema } from "./validation/content";
import { BaseHeadersSchema } from "./validation/headers";
import { submitContent } from "./service/ContentItem";

const app = new Hono().basePath("/api");

app.post(
  "create_submission",
  zValidator("header", BaseHeadersSchema),
  zValidator("json", ContentSubmissionBodySchema),
  async (c) => {
    const headers = c.req.valid("header");
    const body = c.req.valid("json");

    const item_id = await submitContent(headers, body);
    return c.json(null, 204);
  },
);

export default app;
