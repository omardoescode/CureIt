import {
  contentTypes,
  type ArticlePayload,
  type BookPayload,
  type CoursePayload,
  type IContentItem,
  type TweetPayload,
  type VideoPayload,
} from "@/types/ContentItem";
import mongoose from "mongoose";

export const ContentItemSchema = new mongoose.Schema<IContentItem>(
  {
    slug: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      lowercase: true,
    },
    source_url: {
      type: String,
      required: true,
      match: /^https?:\/\/.+/,
      unique: true,
    },
    title: { type: String, required: true, trim: true },
    page_title: { type: String, required: true, trim: true },
    page_description: { type: String, trim: true },
    page_author: { type: String, trim: true },
    type: { type: String, enum: contentTypes },
    extracted_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    is_private: { type: Boolean, default: false },
  },
  { collection: "content_items", discriminatorKey: "type" },
);

ContentItemSchema.pre<IContentItem>(
  "save",
  function (this: IContentItem, next) {
    if (!this.slug) {
      const idPart = this._id.toString().slice(-6); // last 6 chars of ObjectId
      const slugPart = this.page_title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      this.slug = `${slugPart}-${idPart}`;
    }
    next();
  },
);

const ContentItem = mongoose.model<IContentItem>(
  "ContentItem",
  ContentItemSchema,
);

export const ArticleItem = ContentItem.discriminator<
  IContentItem & ArticlePayload
>(
  "article",
  new mongoose.Schema<ArticlePayload>({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    markdown: String,
    profile_pic: String,
  }),
);

export const TweetItem = ContentItem.discriminator<IContentItem & TweetPayload>(
  "tweet",
  new mongoose.Schema<TweetPayload>({
    author: { type: String, required: true, trim: true },
    markdown: String,
    profile_pic: String,
  }),
);

export const CourseItem = ContentItem.discriminator<
  IContentItem & CoursePayload
>(
  "course",
  new mongoose.Schema<CoursePayload>({
    lecture_count: {
      type: Number,
      min: [1, "a course must one lecture or more"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (v) => `${v} isn't an integer`,
      },
    },
  }),
);

export const VideoItem = ContentItem.discriminator<IContentItem & VideoPayload>(
  "video",
  new mongoose.Schema<VideoPayload>({
    title: { type: String, required: true, trim: true },
    duration_seconds: {
      type: Number,
      min: [1, "a course must one lecture or more"],
    },
    embed_url: String,
  }),
);

export const BookItem = ContentItem.discriminator<IContentItem & BookPayload>(
  "BookItem",
  new mongoose.Schema<BookPayload>({
    url: String,
    page_count: {
      type: Number,
      min: [1, "a page count must be > 1"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (v) => `${v} isn't an integer`,
      },
    },
    edition: {
      type: Number,
      min: [1, "an edition"],
      validate: {
        validator: function (v) {
          return Number.isInteger(v);
        },
        message: (v) => `${v} isn't an integer`,
      },
    },
    is_free: Boolean,
  }),
);

export default ContentItem;
