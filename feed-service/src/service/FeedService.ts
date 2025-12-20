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
import { FEED_TYPES } from "@/validation/RESTSchemas";

/**
 * @notes When a user unsubscribes to a topic, a feed doesn't change because it's immutable. However, a user's feed won't have new items from now on
 */
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
        ["topics", "upvotes", "downvotes", "created_at", "type"],
      );
      if (cache instanceof NotFoundInStorage) return;

      const { topics, upvotes, downvotes, created_at, type: itemType } = cache;
      if (
        !topics ||
        upvotes == null ||
        downvotes == null ||
        !created_at ||
        !itemType
      ) {
        logger.warn(
          `Invalid path: (!topics || upvotes == null || downvotes == null || !created_at || itemType) ${JSON.stringify({ topics, upvotes, downvotes, created_at })}`,
        );
        return;
      }

      const users =
        await FollowingService(coordinationId).getTopicsFollowerIds(topics);

      await Promise.all(
        users
          .map((userId) => {
            return (["hot", "new", "top"] as FeedType[]).map((type) => {
              const userFeed = createFeed("user", userId, type);
              return userFeed.addItem(contentId, {
                upvotes,
                downvotes,
                createdAt: new Date(created_at),
                itemType,
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
                itemType,
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

    async subscribeToTopic(userId: string, topic: string, limit = 50) {
      await Promise.all(
        FEED_TYPES.map(async (feedType) => {
          const userFeed = createFeed("user", userId, feedType);
          const topicFeed = createFeed("topic", topic, feedType);

          const page = await topicFeed.fetchPage(limit, null);

          return Promise.all(
            page.items.map(async (item) => {
              const cache = await ContentCacheService.fetchContentItem(
                coordinationId,
                item.contentId,
                ["upvotes", "downvotes", "created_at", "type"],
              );
              if (cache instanceof NotFoundInStorage) return;

              const { upvotes, downvotes, created_at, type: itemType } = cache;
              if (
                upvotes == null ||
                downvotes == null ||
                !created_at ||
                !itemType
              ) {
                logger.warn(
                  `Invalid path: (upvotes == null || downvotes == null || !created_at || itemType) ${JSON.stringify({ upvotes, downvotes, created_at })}`,
                );
                return;
              }
              await userFeed.addItem(item.contentId, {
                upvotes,
                downvotes,
                itemType,
                createdAt: new Date(created_at),
              });
            }),
          );
        }),
      );
    },
  };
};
