import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import type { AppRouteHandler } from "../../lib/types";

// Route definition
export const route = createRoute({
  method: "get",
  path: "/air-quality/all-data",
  request: {
    query: z.object({
      from: z.string().transform(val => new Date(val)),
      to: z.string().transform(val => new Date(val)),
      limit: z
        .string()
        .transform(val => Number.parseInt(val, 10))
        .pipe(z.number().min(1).max(10000))
        .optional(),
    }),
  },
  responses: {
    [StatusCodes.OK]: {
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(
              z.object({
                id: z.number(),
                timestamp: z.string(),
                pm25: z.number(),
                pm10: z.number(),
                temperature: z.number(),
                humidity: z.number(),
                pressure: z.number(),
              }),
            ),
            count: z.number(),
          }),
        },
      },
      description: "All air quality data within time range",
    },
    [StatusCodes.BAD_REQUEST]: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            details: z.string().or(z.any()).optional(),
          }),
        },
      },
      description: "Invalid request parameters",
    },
  },
  tags: ["Air Quality"],
  summary: "Get all air quality data within time range",
});

// Handler
export const handler: AppRouteHandler<typeof route> = async (c) => {
  const query = c.req.valid("query");

  try {
    const data = await c.var.airQualityRepository.getAllDataByTimeRange(
      query.from,
      query.to,
      query.limit,
    );

    return c.json({ data, count: data.length }, 200) as never;
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
