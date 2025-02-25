import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import type { AppRouteHandler } from "../../lib/types";

// Define the schemas
export const bucketWidthEnum = z.enum([
  "microsecond",
  "millisecond",
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
  "decade",
  "century",
]);

export type BucketWidth = z.infer<typeof bucketWidthEnum>;

const querySchema = z.object({
  from: z.string().transform(val => new Date(val)),
  to: z.string().transform(val => new Date(val)),
  groupBy: bucketWidthEnum,
  limit: z
    .string()
    .transform(val => Number.parseInt(val, 10))
    .pipe(z.number().min(1).max(10000))
    .optional(),
});

const responseSchema = z.object({
  measurements: z.array(
    z.object({
      timestamp: z.string(),
      avg_pm25: z.number(),
      avg_pm10: z.number(),
      avg_temperature: z.number(),
      avg_humidity: z.number(),
      avg_pressure: z.number(),
      count: z.number(),
    }),
  ),
  count: z.number(),
});

const errorResponseSchema = z.object({
  error: z.string(),
  details: z.string().or(z.any()).optional(),
});

// Route definition
export const route = createRoute({
  method: "get",
  path: "/air-quality/measurements",
  request: {
    query: querySchema,
  },
  responses: {
    [StatusCodes.OK]: {
      content: {
        "application/json": {
          schema: responseSchema,
        },
      },
      description: "Air quality measurements aggregated by time bucket",
    },
    [StatusCodes.BAD_REQUEST]: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Invalid request parameters",
    },
  },
  tags: ["Air Quality"],
  summary: "Get air quality measurements aggregated by time bucket",
});

// Handler
export const handler: AppRouteHandler<typeof route> = async (c) => {
  const query = c.req.valid("query");
  try {
    const measurements = await c.var.airQualityRepository.queryByTimeRange(
      query.from,
      query.to,
      query.groupBy,
      query.limit ?? 500,
    );
    return c.json({ measurements, count: measurements.length }, 200) as never;
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid query parameters", details: error.errors },
        StatusCodes.BAD_REQUEST,
      ) as never;
    }
    return c.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    ) as never;
  }
};
