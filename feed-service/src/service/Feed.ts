import type { FeedCursor } from "@/types/Feed";
import type { FeedSource } from "./FeedSource";
import { FeedId } from "./FeedId";
import type { FeedRanker } from "./FeedRanker";

export class Feed {
  constructor(
    public readonly key: FeedId,
    private feedSource: FeedSource,
    private ranker: FeedRanker,
  ) {}

  async addItem(
    contentId: string,
    data: { upvotes: number; downvotes: number; createdAt: Date },
  ) {
    const score = this.ranker.score(data);
    await this.feedSource.add(contentId, score);
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    return this.feedSource.fetchPage(limit, cursor);
  }
}
