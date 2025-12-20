import z from "zod";

const NonZeroNumber = z.union([z.int().positive(), z.int().negative()]);

const InteractionTypeSchema = z.enum(["modify_type", "modify_topic", "vote"]);

export type InteractionType = z.infer<typeof InteractionTypeSchema>;

const BaseInteractionEvent = z.object({
  coordinationId: z.string().nonempty(),
  timestamp: z.coerce.date(),
});

export const InteractionEventSchema = z.discriminatedUnion("type", [
  BaseInteractionEvent.extend({
    type: z.literal(InteractionTypeSchema.enum.modify_topic),
    topic: z
      .string()
      .nonempty()
      .regex(/^(\d+|[a-zA-Z]+|:)$/)
      .transform((x) => x.toLowerCase()),
    user_weight: NonZeroNumber,
    content_id: z.string().nonempty(),
  }),
  BaseInteractionEvent.extend({
    type: z.literal(InteractionTypeSchema.enum.vote),
    user_weight: NonZeroNumber,
    content_id: z.string().nonempty(),
  }),
  BaseInteractionEvent.extend({
    type: z.literal(InteractionTypeSchema.enum.modify_type),
    user_weight: NonZeroNumber,
    content_type: z
      .string()
      .nonempty()
      .regex(/^(\d+|[a-zA-Z]+|:)$/)
      .transform((x) => x.toLowerCase()),
    content_id: z.string().nonempty(),
  }),
]);

export type InteractionEvent = z.infer<typeof InteractionEventSchema>;

const BaseCurationUpdateSchema = z.object({
  coordinationId: z.string().nonempty(),
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
