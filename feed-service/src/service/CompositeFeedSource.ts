import type { FeedCursor } from "@/types/Feed";
import type { FeedSource } from "./FeedSource";
import logger from "@/lib/logger";

export class CompositeFeedSource implements FeedSource {
  constructor(
    private cache: FeedSource,
    private archive: FeedSource,
  ) {}

  async add(contentId: string, score: number) {
    await this.archive.add(contentId, score);
    await this.cache.add(contentId, score);
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    const cacheResult = await this.cache.fetchPage(limit, cursor);
    logger.debug("Caching Result: ", JSON.stringify(cacheResult));

    if (cacheResult.items.length === limit) {
      return cacheResult;
    }

    const remaining = limit - cacheResult.items.length;
    const continuationCursor = cacheResult.nextCursor ?? cursor;

    const archiveResult = await this.archive.fetchPage(
      remaining,
      continuationCursor,
    );
    logger.debug("Archive Result: ", JSON.stringify(cacheResult));

    const items = [...cacheResult.items, ...archiveResult.items];
    const nextCursor =
      archiveResult.nextCursor ?? cacheResult.nextCursor ?? null;

    return { items, nextCursor };
  }
}
