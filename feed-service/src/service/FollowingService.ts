import { FollowshipModel } from "@/models/Followship";

export const FollowingService = {
  getUserTopics: async (userId: string): Promise<string[]> => {
    const result = await FollowshipModel.find({ userId });
    return result.map((r) => r.topic);
  },
  getTopicFollowerIds: async (topic: string): Promise<string[]> => {
    const result = await FollowshipModel.find({ topic });
    return result.map((r) => r.userId);
  },
  follow: async (userId: string, topic: string) => {
    const follow = new FollowshipModel({
      userId,
      topic,
    });

    await follow.save().catch((err) => {
      // if a duplicate error
      if (err.code == 11000) return;
      throw err;
    });

    // TODO: Handle updates of the feed
  },
  unfollow: async (userId: string, topic: string): Promise<boolean> => {
    const follow = await FollowshipModel.deleteOne({ userId, topic });
    const res = follow.deletedCount > 0;
    // TODO: Handle updates of the feed

    return res;
  },
};
