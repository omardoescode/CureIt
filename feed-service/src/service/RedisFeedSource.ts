import type Redis from "ioredis";
import type { FeedSource } from "./FeedSource";
import type { FeedCursor } from "@/types/Feed";
import type { FeedId } from "./FeedId";

export class RedisFeedSource implements FeedSource {
  constructor(
    private redis: Redis,
    private key: FeedId,
    private feedLimit: number | null,
  ) {
    this.key = key;
  }

  async add(contentId: string, score: number) {
    const id = this.key.value();
    const pipeline = this.redis.pipeline();
    pipeline.zadd(id, score, contentId);
    if (this.feedLimit) pipeline.zremrangebyrank(id, 0, -this.feedLimit - 1);
    await pipeline.exec();
  }

  async fetchPage(
    limit: number,
    cursor: FeedCursor | null,
  ): Promise<{ items: FeedCursor[]; nextCursor: FeedCursor | null }> {
    const id = this.key.value();

    let raw: string[];
    if (!cursor) {
      raw = await this.redis.zrevrange(id, 0, limit - 1, "WITHSCORES");
    } else {
      raw = await this.redis.zrevrangebyscore(
        id,
        cursor.score,
        "-inf",
        "WITHSCORES",
        "LIMIT",
        0,
        limit + 1,
      );
    }

    const items: FeedCursor[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      items.push({
        contentId: raw[i]!,
        score: parseFloat(raw[i + 1]!),
      });
    }

    if (
      cursor &&
      items[0]?.contentId === cursor.contentId &&
      items[0]?.score === cursor.score
    ) {
      items.shift();
    }

    const page = items.slice(0, limit);
    const nextCursor = page.length ? page[page.length - 1]! : null;

    return { items: page, nextCursor };
  }
}
