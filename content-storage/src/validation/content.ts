import z from "zod";

const ContentProcessingOutputBase = z
  .object({
    topics: z.array(z.string().nonempty()).optional(),
    title: z.string(),
    extracted_at: z.iso.datetime(),
    source_url: z.url(),
    submitted_at: z.iso.datetime(),

    // These are additional metadata that came from processing
    page_title: z.string(),
    page_description: z.string().optional().nullable(),
    page_author: z.string().optional().nullable(),
  })
  .strict();

export const ContentProcessingOutput = z.discriminatedUnion("type", [
  ContentProcessingOutputBase.extend({
    type: z.literal("article"),
    author: z.string().optional().nullable(),
    markdown: z.string().optional().nullable(),
  }),
  ContentProcessingOutputBase.extend({
    type: z.literal("tweet"),
    author: z.string().nonempty(),
    markdown: z.string().optional().nullable(),
  }),
  ContentProcessingOutputBase.extend({
    type: z.literal("course"),
    lecture_count: z.number().int().positive().optional().nullable(),
  }),
  ContentProcessingOutputBase.extend({
    type: z.literal("book"),
    page_count: z.number().int().positive().optional().nullable(),
    edition: z.number().int().positive().optional().nullable(),
    url: z.url().optional().nullable(),
    is_free: z.boolean().default(false),
  }),
  ContentProcessingOutputBase.extend({
    type: z.literal("video"),
    duration_seconds: z.number().int().positive().optional().nullable(),
    embed_url: z.url().optional().nullable(),
  }),
  ContentProcessingOutputBase.extend({
    type: z.literal("other"),
  }),
]);

export type ContentProcessingOuptut = z.infer<typeof ContentProcessingOutput>;

export const ContentItemSlugSchema = z.object({
  slug: z.string().nonempty(),
});
export const ContentItemIdSchema = z.object({
  id: z.string().nonempty(),
});
