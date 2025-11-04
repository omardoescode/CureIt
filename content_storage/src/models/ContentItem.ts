import mongoose, { Document } from "mongoose";

interface IContentItem extends Document<string> {
  slug: string;
  source_url: string;
  title: string;
  author: string;
  markdown: string;
  type: "article";
  extracted_at: Date;
  created_at: Date;
  is_private: boolean;
}

const ContentItemSchema = new mongoose.Schema<IContentItem>(
  {
    slug: {
      type: String,
      required: false,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    source_url: { type: String, required: true, match: /^https?:\/\/.+/ },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    markdown: { type: String, required: true },
    type: { type: String, enum: ["article"] },
    extracted_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    is_private: { type: Boolean, default: false },
  },
  { collection: "content_items" },
);

ContentItemSchema.pre<IContentItem>(
  "save",
  function (this: IContentItem, next) {
    if (!this.slug) {
      const idPart = this._id.toString().slice(-6); // last 6 chars of ObjectId
      const slugPart = this.title
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

export default ContentItem;
