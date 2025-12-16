import type { FeedOwnerType, FeedType } from "@/types/Feed";

export class FeedId {
  private constructor(private readonly key: string) {}

  static forUser(userId: string, type: FeedType): FeedId {
    return new FeedId(`feed:users:${type}:${userId}`);
  }

  static forTopic(topic: string, type: FeedType): FeedId {
    return new FeedId(`feed:topics:${type}:${topic}`);
  }

  static new(ownerType: FeedOwnerType, ownerId: string, type: FeedType) {
    switch (ownerType) {
      case "user":
        return this.forUser(ownerId, type);
      case "topic":
        return this.forTopic(ownerId, type);
    }
  }

  value(): string {
    return this.key;
  }
}
