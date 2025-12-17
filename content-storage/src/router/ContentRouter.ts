import logger from "@/lib/logger";
import { Hono } from "hono";
import zValidator from "@/utils/zValidator";
import {
  ContentItemIdSchema,
  ContentItemSlugSchema,
} from "@/validation/content";
import {
  BaseHeadersSchema,
  BaseProtectedHeadersSchema,
} from "@/validation/headers";
import {
  submitContent,
  getContentItemBySlug,
  getContentMetadata,
} from "@/service/ContentItem";
import { SubmissionBodySchema } from "@/validation/content_url";
import { AppError } from "@/utils/error";

const ContentRouter = new Hono();

ContentRouter.post(
  "/",
  zValidator("header", BaseProtectedHeadersSchema),
  zValidator("json", SubmissionBodySchema),
  async (c) => {
    const headers = c.req.valid("header");
    const body = c.req.valid("json");

    const content_slug = await submitContent(headers, body);
    if (content_slug instanceof AppError) {
      logger.error(`Error getting content slug: ${content_slug}`);
      return c.json({ error: "Internal Server Error" }, 500);
    }
    return c.json({ content_slug }, 200);
  },
);

ContentRouter.get(
  "/:slug",
  zValidator("header", BaseHeadersSchema),
  zValidator("param", ContentItemSlugSchema),
  async (c) => {
    const headers = c.req.valid("header");
    const { slug } = c.req.valid("param");

    const content = await getContentItemBySlug(headers, slug);
    if (!content) return c.json({ error: "not found" }, 404);
    return c.json(content, 200);
  },
);

ContentRouter.get(
  "/metadata/:id/internal",
  zValidator("header", BaseHeadersSchema),
  zValidator("param", ContentItemIdSchema),
  async (c) => {
    const headers = c.req.valid("header");
    const { id } = c.req.valid("param");

    const content = await getContentMetadata(headers, id);
    if (!content) return c.json({ error: "not found" }, 404);
    return c.json(content, 200);
  },
);
export default ContentRouter;
