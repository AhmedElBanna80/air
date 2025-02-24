import { z } from "zod";
import type { MeasurementsRoute, UploadRoute } from "./air-quality.routes.js";
import { AppRouteHandler } from "@/lib/create-app.js";
import { StatusCodes } from "http-status-codes";
import { insertAirQualitySchema } from "@/db/schema.js";

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
  } catch (error) {
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

    const batchSize = 500; // Define batch size
    let batch: z.infer<typeof insertAirQualitySchema>[] = [];
    let rowsProcessed = 0;

     await c.var.csvParserService.parseAirQualityData(
      file,
      async (measurement: z.infer<typeof insertAirQualitySchema>) => {
        batch.push(measurement);
        rowsProcessed++;

        // Insert when batch size is reached
        if (batch.length >= batchSize) {
          try {
            await c.var.airQualityRepository.insertBatch(batch);
            batch = []; // Clear batch
          } catch (error) {
            console.error("Error inserting batch:", error);
          }
        }
      },
    );

    // Insert any remaining records
    if (batch.length > 0) {
      try {
        await c.var.airQualityRepository.insertBatch(batch);
      } catch (error) {
        console.error("Error inserting final batch:", error);
      }
    }

    return c.json({
      message: "Upload completed",
      status: "success",
      rowsProcessed,
    }) as never;
  } catch (error) {
    console.error("Upload error:", error);
    return c.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    ) as never;
  }
};

