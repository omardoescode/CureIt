import type { FeedCursor } from "@/types/Feed";
import type { FeedFilter, FeedSource } from "./FeedSource";

export class CompositeFeedSource implements FeedSource {
  constructor(
    private cache: FeedSource,
    private archive: FeedSource,
  ) {}
  async add(
    contentId: string,
    score: number,
    itemType: string,
    createdAt: Date,
  ) {
    await this.archive.add(contentId, score, itemType, createdAt);
    await this.cache.add(contentId, score, itemType, createdAt);
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
    filters: FeedFilter,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    const cacheResult = await this.cache.fetchPage(limit, cursor, filters);
    console.debug("Caching Result: ", JSON.stringify(cacheResult));

    if (cacheResult.items.length === limit) {
      return cacheResult;
    }

    const remaining = limit - cacheResult.items.length;
    const continuationCursor = cacheResult.nextCursor ?? cursor;

    const archiveResult = await this.archive.fetchPage(
      remaining,
      continuationCursor,
      filters,
    );
    console.debug("Archive Result: ", JSON.stringify(cacheResult));

    const items = [...cacheResult.items, ...archiveResult.items];
    const nextCursor =
      archiveResult.nextCursor ?? cacheResult.nextCursor ?? null;

    return { items, nextCursor };
  }
}
