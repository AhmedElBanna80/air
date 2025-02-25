import type { PinoLogger } from "hono-pino";
import type { z } from "zod";

import { and, between, sql } from "drizzle-orm";

import type { Database } from "../db/index.ts";
import type { insertAirQualitySchema } from "../db/schema.ts";

import { airQualityMeasurements } from "../db/schema.ts";

type AirQualityMeasurement = z.infer<typeof insertAirQualitySchema>;

type AirQualityStats = {
  day: string;
  avgTemperature: number;
  avgHumidity: number;
  avgCO: number;
  avgNO2: number;
  avgO3: number;
};

export class AirQualityRepository {
  constructor(
    private readonly db: Database,
    private readonly logger: PinoLogger,
  ) {}

  async insertBatch(measurements: AirQualityMeasurement[]) {
    if (measurements.length === 0) {
      return 0;
    }

    try {
      await this.db
        .insert(airQualityMeasurements)
        .values(measurements)
        .onConflictDoUpdate({
          target: [airQualityMeasurements.timestamp],
          set: {
            coGT: sql`excluded.co_gt`,
            coS1: sql`excluded.co_s1`,
            nmhcGT: sql`excluded.nmhc_gt`,
            nmhcS2: sql`excluded.nmhc_s2`,
            benzeneGT: sql`excluded.benzene_gt`,
            noxGT: sql`excluded.nox_gt`,
            noxS3: sql`excluded.nox_s3`,
            no2GT: sql`excluded.no2_gt`,
            no2S4: sql`excluded.no2_s4`,
            o3S5: sql`excluded.o3_s5`,
            temperature: sql`excluded.temperature`,
            relativeHumidity: sql`excluded.relative_humidity`,
            absoluteHumidity: sql`excluded.absolute_humidity`,
          },
        });

      return measurements.length;
    }
    catch (error) {
      this.logger.error("Database upsert error:", error);
      throw error;
    }
  }

  async queryByTimeRange(
    from: Date,
    to: Date,
    limit?: number,
  ): Promise<AirQualityStats[]> {
    const bucket = sql<string>`time_bucket('1 day', ${airQualityMeasurements.timestamp})`;

    return await this.db
      .select({
        day: bucket.as("day"),
        avgTemperature:
          sql<number>`avg(${airQualityMeasurements.temperature})`.as(
            "avg_temperature",
          ),
        avgHumidity:
          sql<number>`avg(${airQualityMeasurements.relativeHumidity})`.as(
            "avg_humidity",
          ),
        avgCO: sql<number>`avg(${airQualityMeasurements.coGT})`.as("avg_co"),
        avgNO2: sql<number>`avg(${airQualityMeasurements.no2GT})`.as("avg_no2"),
        avgO3: sql<number>`avg(${airQualityMeasurements.o3S5})`.as("avg_o3"),
      })
      .from(airQualityMeasurements)
      .where(and(between(airQualityMeasurements.timestamp, from, to)))
      .groupBy(bucket)
      .orderBy(bucket)
      .limit(limit || Number.MAX_SAFE_INTEGER);
  }
}
