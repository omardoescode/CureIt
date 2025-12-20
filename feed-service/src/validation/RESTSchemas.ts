import z from "zod";

export const BaseHeadersSchema = z
  .object({
    "CureIt-Coordination-Id": z.string().nonempty(),
  })
  .loose();

export const BaseProtectedHeadersSchema = BaseHeadersSchema.extend({
  "CureIt-User-Id": z.string().nonempty(),
});

export const FEED_TYPES = ["new", "top", "hot"] as const;
export const FeedTypeSchema = z.object({ type: z.enum(FEED_TYPES) });

export const FeedFieldsQuerySchema = z.object({
  fields: z.string().optional(),
});

export const TopicQuerySchema = z.object({
  topic: z.string().nonempty(),
});

export const FeedFilterQuerySchema = z.object({
  itemType: z.string().optional(),
  createdAfter: z.iso.date().optional(),
  createdBefore: z.iso.date().optional(),
});
