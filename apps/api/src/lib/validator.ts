import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono/types";
import { z } from "zod";
import type { Context } from "hono";

export function Validator<T extends keyof ValidationTargets>(
  target: T,
  schema: z.ZodSchema
) {
  return zValidator(target, schema, (result, c: Context) => {
    if (!result.success) {
      return c.json(
        { 
          error: "Validation failed",
          issues: result.error.issues 
        },
        400
      );
    }
  });
}