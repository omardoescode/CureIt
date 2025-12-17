import z from "zod";

export const ContentUpdateEventSchema = z.object({
  type: z.literal("content_updated"),
  coordinationId: z.string().nonempty(),
  contentId: z.string().nonempty(),
  upvotes: z.number().optional(),
  downvotes: z.number().optional(),
  topics: z.array(z.string()).default([]),
  invalidateCache: z.boolean().default(false),
  // NOTE: we might consider adding [x: string]: unknown in case I want to update values of specific payloads
});

export type ContentUpdateEvent = z.input<typeof ContentUpdateEventSchema>;
