import type { Document, ObjectId } from "mongoose";

export type FeedType = "new" | "hot" | "top";
export type FeedOwnerType = "user" | "topic";

export type FeedCursor = { score: number; contentId: string };

export interface FeedItem extends Document<ObjectId> {
  ownerType: FeedOwnerType;
  ownerId: string;

  feedType: FeedType;
  contentId: string;
  score: number;
  createdAt: Date;
}
