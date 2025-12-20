import mongoose from "mongoose";
import { type IFollowship } from "@/types/Followship";

const FollowshipSchema = new mongoose.Schema<IFollowship>(
  {
    userId: { type: String, trim: true, required: true },
    topic: { type: String, trim: true, required: true, lowercase: true },
  },
  { timestamps: true },
);

FollowshipSchema.index({ userId: 1, topic: 1 }, { unique: true });

export const FollowshipModel = mongoose.model("Followship", FollowshipSchema);
