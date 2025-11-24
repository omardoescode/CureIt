import z from "zod";

const InteractionTypeSchema = z.enum([
  "correct_topic",
  "modify_topic",
  "vote",
  "report_dead",
  "report_outdated",
]);

export type InteractionType = z.infer<typeof InteractionTypeSchema>;

const BaseInteractionEvent = z.object({
  content_id: z.string().nonempty(),
  timestamp: z.coerce.date(),
});

export const InteractionEventSchema = z.discriminatedUnion("type", [
  BaseInteractionEvent.extend({
    type: z.literal(InteractionTypeSchema.enum.modify_topic),
    payload: z.object({
      topic: z
        .string()
        .nonempty()
        .regex(/^(\d+|[a-zA-Z]+|:)$/),
      weight: z.union([z.int().positive(), z.int().negative()]),
    }),
  }),
]);

export type InteractionEvent = z.infer<typeof InteractionEventSchema>;
