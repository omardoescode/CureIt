import type { FeedCursor, FeedOwnerType, FeedType } from "@/types/Feed";
import type { FeedFilter, FeedSource } from "./FeedSource";
import { FeedItemModel } from "@/models/FeedItem";
import logger from "@/lib/logger";
import assert from "assert";
import z from "zod";

const FeedFilterSchema = z
  .object({
    itemType: z.object({ eq: z.string() }).optional(),
    createdAt: z
      .object({
        gte: z.date().optional(),
        lte: z.date().optional(),
      })
      .optional(),
  })
  .strict();

/**
 * @requires This source stores the item type, and creation date in addition to the normal feed data
 * @note you can filter by both item type (equality) and the creation date
 */
export class MongoFeedSource implements FeedSource {
  constructor(
    private ownerType: FeedOwnerType,
    private ownerId: string,
    private feedType: FeedType,
  ) {}

  async add(
    contentId: string,
    score: number,
    itemType: string,
    createdAt: Date,
  ) {
    await FeedItemModel.updateOne(
      {
        ownerType: this.ownerType,
        ownerId: this.ownerId,
        feedType: this.feedType,
        contentId,
      },
      {
        $setOnInsert: {
          ownerType: this.ownerType,
          ownerId: this.ownerId,
          feedType: this.feedType,
          contentId,
          score,
          createdAt: createdAt,
          itemType: itemType,
        },
      },
      { upsert: true },
    );
    logger.debug("this method has been called");
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
    filters?: FeedFilter,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    assert(limit > 0, "limit must be greater than 0");

    const query: any = {
      ownerType: this.ownerType,
      ownerId: this.ownerId,
      feedType: this.feedType,
    };

    if (filters) {
      const parsedFilters = FeedFilterSchema.safeParse(filters);
      assert(!parsedFilters.error);
      const { itemType, createdAt } = parsedFilters.data;

      if (itemType) {
        query.itemType = itemType.eq;
      }

      if (createdAt) {
        query.createdAt = {};
        if (createdAt.gte) query.createdAt.$gte = createdAt.gte;
        if (createdAt.lte) query.createdAt.$lte = createdAt.lte;
      }
    }

    if (cursor) {
      query.$or = [
        { score: { $lt: cursor.score } },
        { score: cursor.score, contentId: { $lt: cursor.contentId } },
      ];
    }

    // TODO: Fix the problem of having more fields that feed service in here
    const docs = await FeedItemModel.find(query)
      .sort({ score: -1, contentId: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const pageDocs = hasMore ? docs.slice(0, limit) : docs;

    const items: FeedCursor[] = pageDocs.map((doc) => ({
      contentId: doc.contentId,
      score: doc.score,
    }));

    const nextCursor = hasMore ? items[items.length - 1]! : null;

    return { items, nextCursor };
  }
}
