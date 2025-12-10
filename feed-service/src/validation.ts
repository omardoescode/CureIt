import z from "zod";

const NonZeroNumber = z.union([z.int().positive(), z.int().negative()]);

const InteractionTypeSchema = z.enum(["modify_type", "modify_topic", "vote"]);

export type InteractionType = z.infer<typeof InteractionTypeSchema>;

const BaseInteractionEvent = z.object({
  timestamp: z.coerce.date(),
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

export type InteractionEvent = z.infer<typeof InteractionEventSchema>;

const BaseCurationUpdateSchema = z.object({
  content_id: z.string().nonempty(),
  reason: z.string().nonempty(),
});

export const CurationUpdateSchmea = z.discriminatedUnion("type", [
  BaseCurationUpdateSchema.extend({
    type: z.literal("topic_list_updated"),
    topic: z.string().nonempty(),
    action: z.enum(["added", "removed"]),
  }),
  BaseCurationUpdateSchema.extend({
    type: z.literal("content_type_update"),
    new_type: z.string().nonempty(),
  }),
  BaseCurationUpdateSchema.extend({
    type: z.literal("item_vote_update"),
    incr: NonZeroNumber,
  }),
]);

export type CurationUpdate = z.infer<typeof CurationUpdateSchmea>;

export const ConsumerMessageSchema = z.union([
  CurationUpdateSchmea,
  InteractionEventSchema,
]);

export type ConsumerMessage = z.infer<typeof ConsumerMessageSchema>;
