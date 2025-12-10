import type { ConsumerMessage } from "@/validation";
import { FollowingService } from "./FollowingService";

export const MessageHandler = {
  handleMessage: async (message: ConsumerMessage) => {
    switch (message.type) {
      case "follow_topic":
        await FollowingService.follow(message.topic, message.userId);
        break;
      case "unfollow_topic":
        await FollowingService.unfollow(message.topic, message.userId);
        break;
      default:
        throw new Error("Unimplemented");
    }
  },
};
