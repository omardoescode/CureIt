import type { FeedCursor } from "@/types/Feed";
import type { FeedFilter, FeedSource } from "./FeedSource";
import logger from "@/lib/logger";

export class CompositeFeedSource implements FeedSource {
  constructor(
    private cache: FeedSource,
    private archive: FeedSource,
  ) {}

  async add(
    contentId: string,
    score: number,
    meta: Record<string, string | number | Date | boolean>,
  ) {
    await this.archive.add(contentId, score, meta);
    await this.cache.add(contentId, score, meta);
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
    filters: FeedFilter,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    const cacheResult = await this.cache.fetchPage(limit, cursor, filters);
    logger.debug("Caching Result: ", JSON.stringify(cacheResult));

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
    logger.debug("Archive Result: ", JSON.stringify(cacheResult));

    const items = [...cacheResult.items, ...archiveResult.items];
    const nextCursor =
      archiveResult.nextCursor ?? cacheResult.nextCursor ?? null;

    return { items, nextCursor };
  }
}
