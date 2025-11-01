import z from "zod";

export const BaseHeadersSchema = z
  .object({
    "CureIt-User-Id": z.string().nonempty(),
    "CureIt-Correlation-Id": z.string().nonempty(),
  })
  .loose();

export type BaseHeaders = z.infer<typeof BaseHeadersSchema>;
