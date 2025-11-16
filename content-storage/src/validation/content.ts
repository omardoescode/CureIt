import z from "zod";

const ContentSubmissionBase = z.object({
  topics: z.array(z.string().nonempty()).optional(),
  title: z.string(),
  is_private: z.boolean(),
  extracted_at: z.iso.datetime(),
  source_url: z.url(),
  submitted_at: z.iso.datetime(),
});

export const ContentSubmissionBodySchema = z.discriminatedUnion("type", [
  ContentSubmissionBase.extend({
    type: z.literal("article"),
    author: z.string(),
    markdown: z.string().optional(),
  }),
  ContentSubmissionBase.extend({
    type: z.literal("tweet"),
    author: z.string().nonempty(),
    markdown: z.string().optional(),
  }),
  ContentSubmissionBase.extend({
    type: z.literal("course"),
    lecture_count: z.number().int().positive().optional(),
  }),
  ContentSubmissionBase.extend({
    type: z.literal("book"),
    page_count: z.number().int().positive().optional(),
    edition: z.number().int().positive().optional(),
    url: z.url().optional(),
    is_free: z.boolean().default(false),
  }),
  ContentSubmissionBase.extend({
    type: z.literal("video"),
    duration_seconds: z.number().int().positive().optional(),
    embed_url: z.url().optional(),
  }),
]);

export type ContentSubmissionBody = z.infer<typeof ContentSubmissionBodySchema>;

export const ContentItemSlugSchema = z.object({
  slug: z.string().nonempty(),
});
