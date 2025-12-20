import mongoose from "mongoose";
import { type FeedItem } from "@/types/Feed";

const FeedItemSchema = new mongoose.Schema<FeedItem>(
  {
    ownerType: {
      type: String,
      enum: ["user", "topic"],
      required: true,
      index: true,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    feedType: {
      type: String,
      enum: ["new", "hot", "top"],
      required: true,
      index: true,
    },
    itemType: { type: String, required: true },
  },
  {
    versionKey: false,
  },
);

FeedItemSchema.index(
  { ownerType: 1, ownerId: 1, feedType: 1, contentId: 1 },
  { unique: true },
);

FeedItemSchema.index({
  ownerType: 1,
  ownerId: 1,
  feedType: 1,
  score: -1,
  contentId: -1,
});

export const FeedItemModel = mongoose.model<FeedItem>(
  "FeedItem",
  FeedItemSchema,
);
