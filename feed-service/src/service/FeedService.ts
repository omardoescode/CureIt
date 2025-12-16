import { Feed } from "./Feed";
import { RedisFeedSource } from "./RedisFeedSource";
import { MongoFeedSource } from "./MongoFeedSource";
import { CompositeFeedSource } from "./CompositeFeedSource";
import { ContentCacheService } from "./ContentCacheService";
import { FollowingService } from "./FollowingService";
import type Redis from "ioredis";
import type { FeedCursor, FeedType } from "@/types/Feed";
import { FeedId } from "./FeedId";
import { createRanker } from "./FeedRanker";
import { NotFoundInStorage } from "./ContentStorageClient";
import logger from "@/lib/logger";
import type { FeedFilter } from "./FeedSource";

export const FeedService = (coordinationId: string, redis: Redis) => {
  const createFeed = (
    ownerType: "user" | "topic",
    ownerId: string,
    type: FeedType,
    options?: { filtered?: boolean },
  ) => {
    const feedId = FeedId.new(ownerType, ownerId, type);

    let source;
    if (options?.filtered && ownerType === "topic") {
      // only Mongo supports filters for now
      source = new MongoFeedSource(ownerType, ownerId, type);
    } else {
      const redisSource = new RedisFeedSource(redis, feedId, 1_000);
      const mongoSource = new MongoFeedSource(ownerType, ownerId, type);
      source = new CompositeFeedSource(redisSource, mongoSource);
    }

    const ranker = createRanker(type);
    return new Feed(feedId, source, ranker);
  };

  return {
    async addContentToFeeds(coordinationId: string, contentId: string) {
      const cache = await ContentCacheService.fetchContentItem(
        coordinationId,
        contentId,
        ["topics", "upvotes", "downvotes", "created_at"],
      );
      if (cache instanceof NotFoundInStorage) return;

      const { topics, upvotes, downvotes, created_at } = cache;
      if (!topics || upvotes == null || downvotes == null || !created_at) {
        logger.warn(
          `Invalid path: (!topics || upvotes == null || downvotes == null || !created_at) ${JSON.stringify({ topics, upvotes, downvotes, created_at })}`,
        );
        return;
      }

      const users = await FollowingService.getTopicsFollowerIds(topics);

      await Promise.all(
        users
          .map((userId) => {
            return (["hot", "new", "top"] as FeedType[]).map((type) => {
              const userFeed = createFeed("user", userId, type);
              return userFeed.addItem(contentId, {
                upvotes,
                downvotes,
                createdAt: new Date(created_at),
              });
            });
          })
          .flat(),
      );

      await Promise.all(
        topics
          .map((topic) => {
            return (["hot", "new", "top"] as FeedType[]).map((type) => {
              const topicFeed = createFeed("topic", topic, type);
              return topicFeed.addItem(contentId, {
                upvotes,
                downvotes,
                createdAt: new Date(created_at),
              });
            });
          })
          .flat(),
      );
    },

    fetchUserFeed(
      userId: string,
      type: FeedType,
      limit: number,
      cursor: FeedCursor | null,
    ) {
      const userFeed = createFeed("user", userId, type);
      return userFeed.fetchPage(limit, cursor);
    },

    fetchTopicFeed(
      topic: string,
      type: FeedType,
      limit: number,
      cursor: FeedCursor | null,
      filters?: FeedFilter,
    ) {
      const filtered = filters && Object.keys(filters).length > 0;
      const topicFeed = createFeed("topic", topic, type, { filtered });
      return topicFeed.fetchPage(limit, cursor, filters);
    },
  };
};
