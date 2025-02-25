import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import type { AppRouteHandler } from "../../lib/types";

// Route definition
export const route = createRoute({
  method: "post",
  path: "/air-quality/upload",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.any(),
          }),
        },
      },
    },
  },
  responses: {
    [StatusCodes.OK]: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            status: z.string(),
          }),
        },
      },
      description: "File upload successful",
    },
    [StatusCodes.BAD_REQUEST]: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            details: z.string().optional(),
          }),
        },
      },
      description: "Invalid file upload",
    },
  },
  tags: ["Air Quality"],
  summary: "Upload air quality measurements CSV file",
});

// Handler
export const handler: AppRouteHandler<typeof route> = async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const stream = c.var.csvParserService.parseAirQualityData(file);
    stream.on("data", async (batch) => {
      const rowsProcessed = await c.var.airQualityRepository.insertBatch(batch);
      c.var.logger.info(`Processed ${rowsProcessed} rows`);
    });

    return c.json(
      {
        message: "Processing started",
        status: "success",
      },
      200,
    );
  }
  catch (error) {
    c.var.logger.error("Upload error:", error);
    return c.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
};
