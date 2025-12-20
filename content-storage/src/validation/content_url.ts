import z from "zod";

export const SubmissionBodySchema = z.object({
  content_url: z.url(),
  topics: z.array(z.string()).default([]),
  is_private: z.boolean().default(false),
  submitted_at: z.coerce.date(),
});

export type SubmissionBody = z.infer<typeof SubmissionBodySchema>;
