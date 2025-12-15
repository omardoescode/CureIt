import { FeedService } from "@/service/FeedService";
import { CursorPaginationQuery } from "@/validation/CursorPagination";
import { BaseProtectedHeadersSchema } from "@/validation/RESTSchemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const FeedRouter = new Hono();

FeedRouter.get(
  "/feed/:type(hot|new|top)",
  zValidator("header", BaseProtectedHeadersSchema),
  zValidator("query", CursorPaginationQuery),
  async (c) => {
    const feedType = c.req.param("type") as "hot" | "new" | "top";

    const headers = c.req.valid("header");
    const userId = headers["CureIt-User-Id"];
    const coordinationId = headers["CureIt-Coordination-Id"];

    const { limit, cursor } = c.req.valid("query");

    const { items, cursor: newCursor } = await FeedService.fetchFeed(
      coordinationId,
      userId,
      feedType,
      limit,
      cursor,
    );

    return c.json({ data: items, newCursor });
  },
);

export default FeedRouter;
