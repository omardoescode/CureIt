import { zValidator as zv } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { ZodType } from "zod";

const zValidator = <
  Target extends keyof ValidationTargets,
  Schema extends ZodType,
>(
  path: Target,
  schema: Schema,
) =>
  zv(path, schema, (result, c) => {
    if (!result.success) {
      const error = result.error;
      const firstIssue = error.issues[0];

      return c.json(
        {
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: {
              reason: firstIssue?.message || "Invalid request data",
              field: firstIssue?.path.join(".") || "unknown",
              issues: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            },
          },
        },
        400,
      );
    }
  });

export default zValidator;
