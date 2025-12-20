import type { FeedCursor } from "@/types/Feed";
import type { FeedFilter, FeedSource } from "./FeedSource";
import { FeedId } from "./FeedId";
import type { FeedRanker } from "./FeedRanker";
import assert from "assert";

// TODO: Add a method for bulk insert, and use it on following
export class Feed {
  constructor(
    public readonly key: FeedId,
    private feedSource: FeedSource,
    private ranker: FeedRanker,
  ) {}

  async addItem(
    contentId: string,
    {
      upvotes,
      downvotes,
      itemType,
      createdAt,
    }: {
      upvotes: number;
      downvotes: number;
      itemType: string;
      createdAt: Date;
    },
  ) {
    const score = this.ranker.score({ upvotes, downvotes, createdAt });
    await this.feedSource.add(contentId, score, itemType, createdAt);
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
    filters?: FeedFilter,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    assert(limit > 0);
    return this.feedSource.fetchPage(limit, cursor, filters);
  }
}
