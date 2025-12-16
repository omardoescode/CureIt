import type Redis from "ioredis";
import type { FeedFilter, FeedSource } from "./FeedSource";
import type { FeedCursor } from "@/types/Feed";
import type { FeedId } from "./FeedId";
import assert from "assert";

export class RedisFeedSource implements FeedSource {
  constructor(
    private redis: Redis,
    private key: FeedId,
    private feedLimit: number | null,
  ) {}

  async add(contentId: string, score: number) {
    const id = this.key.value();
    const pipeline = this.redis.pipeline();
    pipeline.zadd(id, score, contentId);
    if (this.feedLimit) pipeline.zremrangebyrank(id, 0, -this.feedLimit - 1);
    await pipeline.exec();
  }

  /**
   * @requires Redis doesn't support filtering. Use another source for this
   */
  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
    filters?: FeedFilter,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    assert(limit > 0, "limit must be greater than 0");
    assert(!filters);
    const id = this.key.value();
    let raw: string[];
    if (!cursor) {
      raw = await this.redis.zrevrange(id, 0, limit - 1, "WITHSCORES");
    } else {
      const maxScore = `(${cursor.score}`;
      raw = await this.redis.zrevrangebyscore(
        id,
        maxScore,
        "-inf",
        "WITHSCORES",
        "LIMIT",
        0,
        limit,
      );
    }

    const items: FeedCursor[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      items.push({
        contentId: raw[i]!,
        score: parseFloat(raw[i + 1]!),
      });
    }

    const page = items.slice(0, limit);
    const nextCursor = page.length ? page[page.length - 1]! : null;

    return { items: page, nextCursor };
  }
}
