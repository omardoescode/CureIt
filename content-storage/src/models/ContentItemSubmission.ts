// content_id
// user_id
// submitted_at
// topics: String[]

import type { Document, ObjectId } from "mongoose";
import ContentItem from "./ContentItem.ts";
import mongoose from "mongoose";

export interface IContentItemSubmission extends Document {
  content_id: ObjectId;
  user_id: string;
  submitted_at: Date;
  topics: string[];
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
    topics: [{ type: String }],
  });

const ContentItemSubmission = mongoose.model<IContentItemSubmission>(
  "ContentItemSubmission",
  ContentItemSubmissionSchema,
);

export default ContentItemSubmission;
