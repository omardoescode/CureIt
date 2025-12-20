import redis from "@/lib/redis";
import type { ContentCache } from "@/types/ContentItemCache";
import {
  ContentStorageClient,
  NotFoundInStorage,
} from "./ContentStorageClient";
import logger from "@/lib/logger";
import assert from "assert";

const genContentItemKey = (contentId: string) =>
  `feed:content-cache:${contentId}`;

export const ContentCacheService = {
  TTL_SECONDS: 24 * 60 * 60, // one day
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
  /**
   * @requires fields = 'all' or fields.length > 0
   */
  async fetchContentItem(
    coordinationId: string,
    contentId: string,
    fields: (keyof ContentCache)[] | "all",
  ): Promise<Partial<ContentCache> | NotFoundInStorage> {
    assert(fields === "all" || fields.length != 0, "Invalid feilds count: 0");
    const key = genContentItemKey(contentId);
    const updated = await redis.expire(key, this.TTL_SECONDS);

    if (!updated) {
      const added = await this.addContentItem(coordinationId, contentId);
      if (!added) return new NotFoundInStorage(contentId);
    }

    let values: Record<string, string> | (string | null)[];
    let fieldNames: string[];

    if (fields === "all") {
      values = await redis.hgetall(key);
      fieldNames = Object.keys(values);
    } else {
      values = await redis.hmget(key, ...(fields as string[]));
      fieldNames = fields as string[];
    }

    const result: Partial<ContentCache> = {};
    fieldNames.forEach((field, i) => {
      if (field === "_id") return;
      const value =
        fields === "all"
          ? (values as Record<string, string>)[field]
          : (values as (string | null)[])[i];

      if (value != null)
        result[field as keyof ContentCache] = JSON.parse(value);
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

  async updateIfExists(
    coordinationId: string,
    contentId: string,
    data: Partial<ContentCache>,
  ): Promise<boolean> {
    const key = genContentItemKey(contentId);

    const exists = await redis.expire(key, this.TTL_SECONDS);
    if (!exists) {
      logger.info(
        `(Coordination Id=${coordinationId}): Content Item (contentId=${contentId}) not found for update`,
      );
      return false;
    }

    const redisObj: Record<string, string> = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) redisObj[k] = JSON.stringify(v);
    });

    if (Object.keys(redisObj).length === 0) {
      logger.info(
        `(Coordination Id=${coordinationId}): No valid fields to update for contentId=${contentId}`,
      );
      return false;
    }

    await redis.hset(key, redisObj);

    logger.info(
      `(Coordination Id=${coordinationId}): Content Item (contentId=${contentId}) updated successfully`,
    );

    return true;
  },

  async fetchItems(
    coordinationId: string,
    contentItemIds: string[],
    fields: (keyof ContentCache)[] | "all",
  ): Promise<(Partial<ContentCache> | null)[]> {
    return Promise.all(
      contentItemIds.map(async (id) => {
        const r = await this.fetchContentItem(coordinationId, id, fields);
        if (r instanceof NotFoundInStorage) return null;
        return r;
      }),
    );
  },
};
