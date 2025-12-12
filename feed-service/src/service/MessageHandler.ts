import type { ConsumerMessage } from "@/validation";
import { FollowingService } from "./FollowingService";
import { ContentCacheService } from "./ContentCacheService";

export const MessageHandler = {
  handleMessage: async (coordinationId: string, message: ConsumerMessage) => {
    switch (message.type) {
      case "follow_topic":
        await FollowingService.follow(message.topic, message.userId);
        break;
      case "unfollow_topic":
        await FollowingService.unfollow(message.topic, message.userId);
        break;
      // TODO: Consider which to update, and which to invalidate
      case "content_type_update":
      case "topic_list_updated":
      case "item_vote_update":
        await ContentCacheService.invalidate(
          coordinationId,
          message.content_id,
        );
        break;
      default:
        throw new Error("Unimplemented");
    }
  },
};
