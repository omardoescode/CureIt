import type { FeedCursor } from "@/types/Feed";
import type { FeedFilter, FeedSource } from "./FeedSource";
import { FeedId } from "./FeedId";
import type { FeedRanker } from "./FeedRanker";
import assert from "assert";

export class Feed {
  constructor(
    public readonly key: FeedId,
    private feedSource: FeedSource,
    private ranker: FeedRanker,
  ) {}

  async addItem(
    contentId: string,
    data: { upvotes: number; downvotes: number; createdAt: Date },
    meta?: Record<string, string | number | boolean | Date>,
  ) {
    const score = this.ranker.score(data);
    await this.feedSource.add(contentId, score, meta);
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
