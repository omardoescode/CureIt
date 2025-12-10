import type { Document, ObjectId } from "mongoose";

export interface IFollowship extends Document<ObjectId> {
  userId: string;
  topic: string;
  createdAt: Date;
  updatedAt: Date;
}
