import type { FeedCursor, FeedOwnerType, FeedType } from "@/types/Feed";
import type { FeedSource } from "./FeedSource";
import { FeedItemModel } from "@/models/FeedItem";
import logger from "@/lib/logger";

export class MongoFeedSource implements FeedSource {
  constructor(
    private ownerType: FeedOwnerType,
    private ownerId: string,
    private feedType: FeedType,
  ) {}

  async add(contentId: string, score: number) {
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
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    logger.debug("this method has been called");
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    const query: any = {
      ownerType: this.ownerType,
      ownerId: this.ownerId,
      feedType: this.feedType,
    };

    if (cursor) {
      query.$or = [
        { score: { $lt: cursor.score } },
        { score: cursor.score, contentId: { $lt: cursor.contentId } },
      ];
    }

    const docs = await FeedItemModel.find(query)
      .sort({ score: -1, contentId: -1 })
      .limit(limit)
      .lean();

    const items: FeedCursor[] = docs.map((doc) => ({
      contentId: doc.contentId,
      score: doc.score,
    }));

    const nextCursor = items.length ? items[items.length - 1]! : null;

    return { items, nextCursor };
  }
}
