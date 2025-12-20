import z from "zod";

const BaseInteractionEvent = z.object({
  timestamp: z.coerce.date(),
  coordinationId: z.string().nonempty(),
});

export const InteractionEventSchema = z.discriminatedUnion("type", [
  BaseInteractionEvent.extend({
    type: z.literal("follow_topic"),
    userId: z.string().nonempty(),
    topic: z.string().nonempty(),
  }),
  BaseInteractionEvent.extend({
    type: z.literal("unfollow_topic"),
    userId: z.string().nonempty(),
    topic: z.string().nonempty(),
  }),
]);

export const ContentCreationEventSchema = z.object({
  type: z.literal("content_added"),
  coordinationId: z.string().nonempty(),
  contentId: z.string().nonempty(),
});

export const ContentUpdateEventSchema = z.object({
  type: z.literal("content_updated"),
  coordinationId: z.string().nonempty(),
  contentId: z.string().nonempty(),
  upvotes: z.number().optional(),
  downvotes: z.number().optional(),
  topics: z.array(z.string()).default([]),
  contentType: z.string().nonempty(),
  invalidateCache: z.boolean().default(false),
  // NOTE: we might consider adding [x: string]: unknown in case I want to update values of specific payloads
});

export const ConsumerMessageSchema = z.union([
  InteractionEventSchema,
  ContentCreationEventSchema,
  ContentUpdateEventSchema,
]);

export type ConsumerMessage = z.infer<typeof ConsumerMessageSchema>;
