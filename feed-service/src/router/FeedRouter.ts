import logger from "@/lib/logger";
import redis from "@/lib/redis";
import { ContentCacheService } from "@/service/ContentCacheService";
import { FeedService } from "@/service/FeedService";
import type { ContentCache } from "@/types/ContentItemCache";
import { CursorPaginationQuery } from "@/validation/CursorPagination";
import {
  BaseProtectedHeadersSchema,
  FeedFieldsQuerySchema,
  FeedTypeSchema,
} from "@/validation/RESTSchemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const FeedRouter = new Hono();

FeedRouter.get(
  "/:type{hot|new|top}",
  zValidator("header", BaseProtectedHeadersSchema),
  zValidator("param", FeedTypeSchema),
  zValidator(
    "query",
    CursorPaginationQuery.extend(FeedFieldsQuerySchema.shape),
  ),
  async (c) => {
    const headers = c.req.valid("header");
    const userId = headers["CureIt-User-Id"];
    const coordinationId = headers["CureIt-Coordination-Id"];

    const { limit, cursor, fields } = c.req.valid("query");
    const { type: feedType } = c.req.valid("param");

    logger.debug("query: ", JSON.stringify(c.req.valid("query")));

    const service = FeedService(coordinationId, redis);
    const { items, nextCursor } = await service.fetchUserFeed(
      userId,
      feedType,
      limit,
      cursor,
    );

    let fieldsToFetch: (keyof ContentCache)[] | "all" = "all";
    if (fields) {
      fieldsToFetch = fields.split(",") as (keyof ContentCache)[];
      fieldsToFetch = fieldsToFetch.filter((f) => f !== "_id");

      if (fields.length === 0) return c.json({ error: "empty fields" }, 400);
    }

    const data = await ContentCacheService.fetchItems(
      coordinationId,
      items.map((u) => u.contentId),
      fieldsToFetch,
    );

    return c.json({ data, nextCursor });
  },
);

export default FeedRouter;
