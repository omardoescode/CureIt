import z from "zod";

const NonZeroNumber = z.union([z.int().positive(), z.int().negative()]);

const BaseCurationUpdateSchema = z.object({
  content_id: z.string().nonempty(),
  reason: z.string().nonempty(),
  coordinationId: z.string().nonempty(),
});

export const CurationUpdateEventSchmea = z.discriminatedUnion("type", [
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

export type CurationUpdateEvent = z.infer<typeof CurationUpdateEventSchmea>;
