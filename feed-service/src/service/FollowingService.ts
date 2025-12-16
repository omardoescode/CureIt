import logger from "@/lib/logger";
import { FollowshipModel } from "@/models/Followship";

export const FollowingService = {
  getUserTopics: async (userId: string): Promise<string[]> => {
    return FollowshipModel.distinct("topic", { userId });
  },

  getTopicFollowerIds: async (topic: string): Promise<string[]> => {
    return FollowshipModel.distinct("userId", { topic });
  },

  getTopicsFollowerIds: async (topics: string[]): Promise<string[]> => {
    logger.info("topics", topics);
    return FollowshipModel.distinct("userId", { topic: { $in: topics } });
  },
  follow: async ({ userId, topic }: { userId: string; topic: string }) => {
    await FollowshipModel.updateOne(
      { userId, topic },
      { $setOnInsert: { userId, topic } },
      { upsert: true },
    );

    logger.debug("Followship saved");

    // TODO: Handle updates of the feed
  },
  unfollow: async ({
    userId,
    topic,
  }: {
    userId: string;
    topic: string;
  }): Promise<boolean> => {
    const follow = await FollowshipModel.deleteOne({ userId, topic });
    const res = follow.deletedCount > 0;
    // TODO: Handle updates of the feed

    return res;
  },
};
