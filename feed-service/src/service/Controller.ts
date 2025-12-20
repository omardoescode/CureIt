import type { ConsumerMessage } from "@/validation/ConsumerSchemas";
import { FollowingService } from "./FollowingService";
import { FeedService } from "./FeedService";
import redis from "@/lib/redis";
import { ContentCacheService } from "./ContentCacheService";

export const Controller = {
  handleMessage: async (message: ConsumerMessage) => {
    switch (message.type) {
      case "follow_topic":
        await FollowingService(message.coordinationId).follow({
          topic: message.topic,
          userId: message.userId,
        });
        break;
      case "unfollow_topic":
        await FollowingService(message.coordinationId).unfollow({
          topic: message.topic,
          userId: message.userId,
        });
        break;
      case "content_added":
        const service = FeedService(message.coordinationId, redis);
        await service.addContentToFeeds(
          message.coordinationId,
          message.contentId,
        );
        break;
      case "content_updated":
        const {
          topics,
          upvotes,
          downvotes,
          contentType: type,
          invalidateCache,
        } = message;

        if (invalidateCache)
          await ContentCacheService.invalidate(
            message.coordinationId,
            message.contentId,
          );
        else
          await ContentCacheService.updateIfExists(
            message.coordinationId,
            message.contentId,
            { topics, upvotes, downvotes, type },
          );
        break;
      default:
        throw new Error("Unimplemented");
    }
  },
};
