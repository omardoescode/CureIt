import type { FeedType } from "@/types/Feed";

export interface FeedRankerInput {
  upvotes: number;
  downvotes: number;
  createdAt: Date;
}

export interface FeedRanker {
  score(params: FeedRankerInput): number;
}

const baseEpoch = new Date("2005-12-08T07:46:43Z");

export class HotFeedRanker implements FeedRanker {
  score({ upvotes, downvotes }: FeedRankerInput): number {
    const netVotes = upvotes - downvotes;
    const order = Math.log10(Math.max(Math.abs(netVotes), 1));
    const sign = netVotes > 0 ? 1 : netVotes < 0 ? -1 : 0;
    const secondsSinceBase = Date.now() / 1000 - baseEpoch.getTime() / 1000;
    return sign * order + secondsSinceBase / 45000;
  }
}

export class NewFeedRanker implements FeedRanker {
  score({ createdAt }: FeedRankerInput): number {
    return (createdAt.getTime() - baseEpoch.getTime()) / 1000;
  }
}

export class TopFeedRanker implements FeedRanker {
  score({ upvotes, downvotes, createdAt }: FeedRankerInput): number {
    const netVotes = upvotes - downvotes;
    const ageSeconds = Date.now() / 1000 - createdAt.getTime() / 1000;
    const decayFactor = 1 / 86400;
    return netVotes - ageSeconds * decayFactor;
  }
}

export function createRanker(type: FeedType): FeedRanker {
  switch (type) {
    case "new":
      return new NewFeedRanker();
    case "top":
      return new TopFeedRanker();
    case "hot":
      return new HotFeedRanker();
  }
}
