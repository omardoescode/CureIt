import z from "zod";

export const ContentSubmissionBodySchema = z.object({
  content_slug: z.string().nonempty(),
  topics: z.array(z.string().nonempty()).optional(),
  title: z.string().nonempty(),
  author: z.string().nonempty(),
  markdown: z.string().optional(),
  private: z.boolean(),
  type: z.enum(["article"]),
  extracted_at: z.iso.datetime(),
  source_url: z.url(),
  submitted_at: z.iso.datetime(),
});

export type ContentSubmissionBody = z.infer<typeof ContentSubmissionBodySchema>;
