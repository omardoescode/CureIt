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
    userWeight: NonZeroNumber,
    contentId: z.string().nonempty(),
  }),
  BaseInteractionEvent.extend({
    type: z.literal(InteractionTypeSchema.enum.vote),
    userWeight: NonZeroNumber,
    contentId: z.string().nonempty(),
  }),
  BaseInteractionEvent.extend({
    type: z.literal(InteractionTypeSchema.enum.modify_type),
    userWeight: NonZeroNumber,
    contentType: z
      .string()
      .nonempty()
      .regex(/^(\d+|[a-zA-Z]+|:)$/)
      .transform((x) => x.toLowerCase()),
    contentId: z.string().nonempty(),
  }),
]);

export type InteractionEvent = z.infer<typeof InteractionEventSchema>;

const BaseCurationUpdateSchema = z.object({
  coordinationId: z.string().nonempty(),
  contentId: z.string().nonempty(),
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
    newType: z.string().nonempty(),
  }),
  BaseCurationUpdateSchema.extend({
    type: z.literal("item_vote_update"),
    incr: NonZeroNumber,
  }),
  BaseCurationUpdateSchema.extend({
    type: z.literal("item_downvote_update"),
    incr: NonZeroNumber,
  }),
]);

export type CurationUpdate = z.infer<typeof CurationUpdateSchmea>;
