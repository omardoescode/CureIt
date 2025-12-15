import logger from "@/lib/logger";
import { ContentCacheService } from "./ContentCacheService";
import { NotFoundInStorage } from "./ContentStorageClient";
import { FollowingService } from "./FollowingService";
import redis from "@/lib/redis";

const calcUserFeedKey = {
  hot: (userId: string) => `feed:users:hot:${userId}`,
  new: (userId: string) => `feed:users:new:${userId}`,
  top: (userId: string) => `feed:users:top:${userId}`,
};

const baseEpoch = new Date("2005-12-08T07:46:43Z"); // Reddit’s reference

const scoreEval = {
  hot: (upvotes: number, downvotes: number): number => {
    const netVotes = upvotes - downvotes;
    const order = Math.log10(Math.max(Math.abs(netVotes), 1));
    const sign = netVotes > 0 ? 1 : netVotes < 0 ? -1 : 0;
    const secondsSinceBase = Date.now() / 1000 - baseEpoch.getTime() / 1000;
    return sign * order + secondsSinceBase / 45000;
  },
  new: (createdAt: Date): number => {
    return (createdAt.getTime() - baseEpoch.getTime()) / 1000;
  },
  top: (upvotes: number, downvotes: number, createdAt: Date): number => {
    const netVotes = upvotes - downvotes;
    const ageSeconds = Date.now() / 1000 - createdAt.getTime() / 1000;
    const decayFactor = 1 / 86400; // per day
    return netVotes - ageSeconds * decayFactor;
  },
};

async function addToFeed(feedId: string, contentId: string, score: number) {
  await redis.zadd(feedId, score, contentId);
}

async function addToUserFeed({
  userId,
  contentId,
  upvotes,
  downvotes,
  created_at,
}: {
  userId: string;
  contentId: string;
  upvotes: number;
  downvotes: number;
  created_at: Date;
}) {
  return Promise.all([
    addToFeed(
      calcUserFeedKey.hot(userId),
      contentId,
      scoreEval.hot(upvotes, downvotes),
    ),
    addToFeed(
      calcUserFeedKey.new(userId),
      contentId,
      scoreEval.new(created_at),
    ),
    addToFeed(
      calcUserFeedKey.top(userId),
      contentId,
      scoreEval.top(upvotes, downvotes, created_at),
    ),
  ]);
}

export const FeedService = {
  async addItemToFeeds(coordinationId: string, contentId: string) {
    logger.warn("This method has been called");
    const cache = await ContentCacheService.fetchContentItem(
      coordinationId,
      contentId,
      ["topics", "upvotes", "downvotes", "created_at"],
    );
    if (cache instanceof NotFoundInStorage) return;
    const { topics, upvotes, downvotes, created_at } = cache;
    logger.info("cache", cache);
    if (
      !topics ||
      upvotes === undefined ||
      downvotes === undefined ||
      !created_at
    )
      return;

    const users = await FollowingService.getTopicsFollowerIds(topics);
    logger.info("users: ", users);

    // TODO: Handle the celebrity problem, but for topics
    await Promise.all(
      users.map(async (userId) => {
        await addToUserFeed({
          userId,
          contentId,
          upvotes,
          downvotes,
          created_at: new Date(created_at),
        });
        logger.info(
          `Adding ${contentId} to ${[Object.values(calcUserFeedKey).map((f) => f(userId))]}`,
        );
      }),
    );
  },
};
