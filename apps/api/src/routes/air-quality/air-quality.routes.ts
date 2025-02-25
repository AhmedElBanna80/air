import { createRoute } from "@hono/zod-openapi";


import { StatusCodes } from "http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";

const tags = ["Air Quality"];

const querySchema = z.object({
  from: z.string().transform((val) => new Date(val)),
  to: z.string().transform((val) => new Date(val)),
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(10000))
    .optional(),
});

export const measurements = createRoute({
  path: "/air-quality/measurements",
  method: "get",
  tags,
  request: {
    query: querySchema,
  },
  responses: {
    [StatusCodes.OK]: jsonContent(
      z.object({
        measurements: z.array(
          z.object({
            day: z.string(),
            avgTemperature: z.number(),
            avgHumidity: z.number(),
            avgCO: z.number(),
            avgNO2: z.number(),
            avgO3: z.number(),
          }),
        ),
        count: z.number(),
      }),
      "Air quality measurements",
    ),
    [StatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        error: z.string(),
        details: z.array(z.any()),
      }),
      "Invalid query parameters",
    ),
    [StatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        error: z.string(),
        details: z.string(),
      }),
      "Internal server error",
    ),
  },
});

export type MeasurementsRoute = typeof measurements;

export const upload = createRoute({
  path: "/air-quality/upload",
  method: "post",
  tags,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z
              .instanceof(File)
              .describe("CSV file containing air quality data"),
          }),
        },
      },
    },
  },
  responses: {
    [StatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        status: z.literal("success"),
        rowsProcessed: z.number(),
      }),
      "Upload successful",
    ),
    [StatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        error: z.string(),
      }),
      "Invalid request",
    ),
    [StatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        error: z.string(),
        details: z.string(),
      }),
      "Internal server error",
    ),
  },
});

export type UploadRoute = typeof upload;
