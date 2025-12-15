import type { Document, ObjectId } from "mongoose";
import ContentItem from "./ContentItem.ts";
import mongoose from "mongoose";

export interface IContentItemSubmission extends Document {
  content_id: ObjectId;
  user_id: string;
  submitted_at: Date;
  is_private: boolean;
}

export const ContentItemSubmissionSchema =
  new mongoose.Schema<IContentItemSubmission>({
    content_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ContentItem,
      required: true,
    },
    user_id: { type: String, required: true },
    submitted_at: { type: Date, required: true },
    is_private: { type: Boolean, default: false },
  });

const ContentItemSubmission = mongoose.model<IContentItemSubmission>(
  "ContentItemSubmission",
  ContentItemSubmissionSchema,
);

export default ContentItemSubmission;
