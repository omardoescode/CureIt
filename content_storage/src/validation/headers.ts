import z from "zod";

export const BaseHeadersSchema = z
  .object({
    "CureIt-Correlation-Id": z.string().nonempty(),
  })
  .loose();
export type BaseHeaders = z.infer<typeof BaseHeadersSchema>;

export const BaseProtectedHeadersSchema = BaseHeadersSchema.extend({
  "CureIt-User-Id": z.string().nonempty(),
});

export type BaseProtectedHeaders = z.infer<typeof BaseProtectedHeadersSchema>;
