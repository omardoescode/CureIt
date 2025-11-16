import z from "zod";

export const SubmissionBodySchema = z.object({
  content_url: z.url(),
  topics: z.string(),
  is_private: z.boolean(),
  submitted_at: z.iso.date(),
});

export type SubmissionBody = z.infer<typeof SubmissionBodySchema>;
