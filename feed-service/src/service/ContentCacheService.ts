import redis from "@/lib/redis";
import type { ContentCache } from "@/types/ContentItemCache";
import {
  ContentStorageClient,
  NotFoundInStorage,
} from "./ContentStorageClient";
import logger from "@/lib/logger";

const genContentItemKey = (contentId: string) =>
  `feed:content-cache:${contentId}`;

export const ContentCacheService = {
  TTL_SECONDS: 24 * 60 * 60, // one hour
  async addContentItem(
    coordinationId: string,
    contentId: string,
  ): Promise<boolean> {
    const key = genContentItemKey(contentId);
    logger.info(
      `(Coordination Id=${coordinationId}): Item (contentId=${contentId}) not found in cache. `,
    );
    const content = await ContentStorageClient.fetchContentItem(
      coordinationId,
      contentId,
    );

    if (content instanceof NotFoundInStorage) return false;

    logger.info(content);
    const redisObj: Record<string, unknown> = {};
    Object.entries(content).forEach(
      ([k, v]) => (redisObj[k] = JSON.stringify(v)),
    );
    logger.info(JSON.stringify(redisObj));

    // Write to Redis
    await redis.hset(key, redisObj);

    // Set or refresh TTL
    await redis.expire(key, this.TTL_SECONDS);

    return true;
  },
  async fetchContentItem(
    coordinationId: string,
    contentId: string,
    fields: (keyof ContentCache)[],
  ): Promise<Partial<ContentCache> | NotFoundInStorage> {
    const key = genContentItemKey(contentId);

    const updated = await redis.expire(key, this.TTL_SECONDS);

    if (!updated) {
      logger.info(
        `(Coordination Id=${coordinationId}): Item (contentId=${contentId}) not found in cache. `,
      );

      const added = await this.addContentItem(coordinationId, contentId);
      if (!added) return new NotFoundInStorage(contentId);

      return this.fetchContentItem(coordinationId, contentId, fields);
    }

    const values = await redis.hmget(key, ...(fields as string[]));

    const result: Partial<ContentCache> = {};
    fields.forEach((field, i) => {
      if (values[i] !== null && values[i] !== undefined)
        result[field] = JSON.parse(values[i]);
    });

    return result;
  },
  async invalidate(
    coordinationId: string,
    contentId: string,
  ): Promise<boolean> {
    const key = genContentItemKey(contentId);
    const updated = await redis.del(key);
    logger.info(
      `(Coordination Id=${coordinationId}): Content Item (contentId=${contentId}) Invalidation: ${!!updated ? "success" : "failure"}`,
    );
    return !!updated;
  },
  async update(coordinationId: string, contentId: string): Promise<boolean> {},
};
