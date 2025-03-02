import { Hono } from "hono";
import { z } from "zod";

import { Validator } from "../lib/validator";
import { inject } from "../middlewares/middleware";
import { AirQualityServiceToken } from "../services/air-quality";
import { bucketWidthEnum } from "./air-measurements";

// Define the query schema
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

const app = new Hono();

// GET time series data with integrated parameter information
app.get(
  "/",
  Validator("query", querySchema),
  async (c) => {
    const { from, to, groupBy, limit } = c.req.valid("query");

    try {
      const airQualityService = inject(c, AirQualityServiceToken);
      const timeSeriesData = await airQualityService.getTimeSeriesData(from, to, groupBy, limit);

      return c.json({
        success: true,
        data: timeSeriesData,
      });
    }
    catch (error) {
      console.error("Error fetching time series data:", error);
      return c.json({
        success: false,
        error: "Failed to fetch time series data",
      }, 500);
    }
  },
);

export default app;
