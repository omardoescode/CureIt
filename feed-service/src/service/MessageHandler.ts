import type { ConsumerMessage } from "@/validation";
import { FollowingService } from "./FollowingService";
import { ContentCacheService } from "./ContentCacheService";
import { FeedService } from "./FeedService";

export const MessageHandler = {
  handleMessage: async (message: ConsumerMessage) => {
    switch (message.type) {
      case "follow_topic":
        await FollowingService.follow({
          topic: message.topic,
          userId: message.userId,
        });
        break;
      case "unfollow_topic":
        await FollowingService.unfollow({
          topic: message.topic,
          userId: message.userId,
        });
        break;
      // TODO: Consider which to update, and which to invalidate
      case "content_type_update":
      case "topic_list_updated":
      case "item_vote_update":
        await ContentCacheService.invalidate(
          message.coordinationId,
          message.content_id,
        );
        break;
      case "content_added":
        await FeedService.addItemToFeeds(
          message.coordinationId,
          message.contentId,
        );
        break;
      default:
        throw new Error("Unimplemented");
    }
  },
};
