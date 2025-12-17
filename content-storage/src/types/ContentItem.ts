import type { ObjectId, Document } from "mongoose";

export const contentTypes = [
  "article",
  "tweet",
  "video",
  "book",
  "course",
  "other",
] as const;

export type ContentType = (typeof contentTypes)[number];

export interface IBaseContentItem extends Document<ObjectId> {
  slug: string;
  source_url: string;
  type: ContentType;
  title: string;
  page_title: string;
  page_description: string | null;
  page_author: string | null;
  extracted_at: Date;
  created_at: Date;
  topics: string[];
  upvotes: number;
  downvotes: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Payload = {};

export interface ArticlePayload extends Payload {
  title: string;
  author: string;
  markdown: string | null;
  profile_pic: string | null;
}

export interface TweetPayload extends Payload {
  author: string;
  markdown: string | null;
  profile_pic: string | null;
}

export interface CoursePayload extends Payload {
  lecture_count: number | null;
}

export interface VideoPayload extends Payload {
  duration_seconds: number | null;
  embed_url: string | null;
  title: string;
}

export interface BookPayload extends Payload {
  page_count: number | null;
  edition: number | null;
  url: string | null;
  is_free: boolean | null;
}

export type IContentItem = IBaseContentItem &
  (
    | ({ type: "article" } & ArticlePayload)
    | ({ type: "tweet" } & TweetPayload)
    | ({ type: "course" } & CoursePayload)
    | ({ type: "video" } & VideoPayload)
    | ({ type: "book" } & BookPayload)
    | { type: "other" }
  );
