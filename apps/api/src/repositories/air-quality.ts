import type { PinoLogger } from "hono-pino";
import type { z } from "zod";

import { and, between, sql } from "drizzle-orm";

import type { Database } from "../db/index.ts";
import type { insertAirQualitySchema, selectAirQualitySchema } from "../db/schema.ts";

import { airQualityMeasurements } from "../db/schema.ts";

type AirQualityMeasurement = z.infer<typeof insertAirQualitySchema>;
type AirQualityData = z.infer<typeof selectAirQualitySchema>;

type BucketWidth = "microsecond" | "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century";

type AirQualityStats = {
  timestamp: string;
  avgTemperature: number;
  avgHumidity: number;
  avgAbsoluteHumidity: number;
  avgCO_GT: number;
  avgCO_S1: number;
  avgNMHC_GT: number;
  avgNMHC_S2: number;
  avgBenzene_GT: number;
  avgNOx_GT: number;
  avgNOx_S3: number;
  avgNO2_GT: number;
  avgNO2_S4: number;
  avgO3_S5: number;
};

// Add a mapping function to convert user-friendly values to TimescaleDB bucket values
function mapToBucketWidth(groupBy: BucketWidth): string {
  const bucketMap: Record<BucketWidth, string> = {
    microsecond: "1 microsecond",
    millisecond: "1 millisecond",
    second: "1 second",
    minute: "1 minute",
    hour: "1 hour",
    day: "1 day",
    week: "1 week",
    month: "1 month",
    year: "1 year",
    decade: "1 decade",
    century: "1 century",
  };

  return bucketMap[groupBy];
}

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
    groupBy: BucketWidth,
    limit?: number,
  ): Promise<AirQualityStats[]> {
    const bucketWidth = mapToBucketWidth(groupBy);
    const bucket = sql<string>`time_bucket('${sql.raw(bucketWidth)}', ${airQualityMeasurements.timestamp})`.as("timestamp");

    const dbDQuery = this.db
      .select({
        timestamp: bucket,
        avgTemperature: sql<number>`avg(${airQualityMeasurements.temperature})`.as("avg_temperature"),
        avgHumidity: sql<number>`avg(${airQualityMeasurements.relativeHumidity})`.as("avg_humidity"),
        avgAbsoluteHumidity: sql<number>`avg(${airQualityMeasurements.absoluteHumidity})`.as("avg_absolute_humidity"),
        avgCO_GT: sql<number>`avg(${airQualityMeasurements.coGT})`.as("avg_co_gt"),
        avgCO_S1: sql<number>`avg(${airQualityMeasurements.coS1})`.as("avg_co_s1"),
        avgNMHC_GT: sql<number>`avg(${airQualityMeasurements.nmhcGT})`.as("avg_nmhc_gt"),
        avgNMHC_S2: sql<number>`avg(${airQualityMeasurements.nmhcS2})`.as("avg_nmhc_s2"),
        avgBenzene_GT: sql<number>`avg(${airQualityMeasurements.benzeneGT})`.as("avg_benzene_gt"),
        avgNOx_GT: sql<number>`avg(${airQualityMeasurements.noxGT})`.as("avg_nox_gt"),
        avgNOx_S3: sql<number>`avg(${airQualityMeasurements.noxS3})`.as("avg_nox_s3"),
        avgNO2_GT: sql<number>`avg(${airQualityMeasurements.no2GT})`.as("avg_no2_gt"),
        avgNO2_S4: sql<number>`avg(${airQualityMeasurements.no2S4})`.as("avg_no2_s4"),
        avgO3_S5: sql<number>`avg(${airQualityMeasurements.o3S5})`.as("avg_o3_s5"),
      })
      .from(airQualityMeasurements)
      .where(and(between(airQualityMeasurements.timestamp, from, to)))
      .groupBy(bucket)
      .orderBy(bucket)
      .limit(limit || Number.MAX_SAFE_INTEGER);
    const query = dbDQuery.toSQL();
    console.log(query);
    return await dbDQuery;
  }

  // New method to get all raw data within a time range
  async getAllDataByTimeRange(
    from: Date,
    to: Date,
    limit?: number,
  ): Promise<AirQualityData[]> {
    return await this.db
      .select()
      .from(airQualityMeasurements)
      .where(and(between(airQualityMeasurements.timestamp, from, to)))
      .orderBy(airQualityMeasurements.timestamp)
      .limit(limit || Number.MAX_SAFE_INTEGER);
  }
}
