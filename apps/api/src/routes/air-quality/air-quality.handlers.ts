import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import type { AppRouteHandler } from "../../lib/types";
import type { MeasurementsRoute, UploadRoute } from "./air-quality.routes.ts";

export const getMeasurements: AppRouteHandler<MeasurementsRoute> = async (
  c,
) => {
  const query = c.req.valid("query");

  try {
    const measurements = await c.var.airQualityRepository.queryByTimeRange(
      query.from,
      query.to,
      query.limit,
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

export const uploadMeasurements: AppRouteHandler<UploadRoute> = async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400) as never;
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
    ) as never;
  }
  catch (error) {
    c.var.logger.error("Upload error:", error);
    return c.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    ) as never;
  }
};
