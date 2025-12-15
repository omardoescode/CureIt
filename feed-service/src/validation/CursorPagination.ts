import z from "zod";

export const CursorPaginationQuery = z.object({
  limit: z.string().transform((v) => parseInt(v)),
  cursor: z
    .string()
    .nullable()
    .default(null)
    .transform((str) => {
      if (!str) return null;

      const match = str.match(/^(-?\d+(\.\d+)?):(.+)$/);
      if (!match) return null;

      const score = parseFloat(match[1]!);
      const contentId = match[3]!;

      if (isNaN(score) || !contentId) return null;

      return { score, contentId };
    }),
});
