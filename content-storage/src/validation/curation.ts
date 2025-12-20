import z from "zod";

const BaseCurationUpdateSchema = z.object({
  contentId: z.string().nonempty(),
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
    newType: z.string().nonempty(),
  }),
  BaseCurationUpdateSchema.extend({
    type: z.literal("item_upvote_update"),
    value: z.number().int().positive(),
  }),
  BaseCurationUpdateSchema.extend({
    type: z.literal("item_downvote_update"),
    value: z.number().int().positive(),
  }),
]);

export type CurationUpdateEvent = z.infer<typeof CurationUpdateEventSchmea>;
