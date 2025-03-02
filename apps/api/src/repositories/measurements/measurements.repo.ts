import { inject, Injectable } from "di-wise";
import { and, between, sql } from "drizzle-orm";

import { DataBase, DataBaseType } from "@/api/services/db/database.provider.js";

import { airQualityMeasurements } from "@/api/services/db/schema/air-quality.js";

import type { AirQualityData, AirQualityMeasurement, AirQualityRepositoryType, AirQualityStats, BucketWidth } from "./measurements.types.js";

import { LoggerToken } from "../../services/logger/logger.types.js";
import { AiQualityRepo } from "./measurements.types.js";

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

function airQualityByTimeRangeQuery(db: DataBaseType, from: Date, to: Date, groupBy: BucketWidth, limit?: number) {
  const bucketWidth = mapToBucketWidth(groupBy);
  const bucket = sql<string>`time_bucket('${sql.raw(bucketWidth)}', ${airQualityMeasurements.timestamp})`.as("timestamp");
  return db
    .select({
      timestamp: bucket,
      avgTemperature: sql<number>`avg(${airQualityMeasurements.temperature})`.as("avg_temperature"),
      avgHumidity: sql<number>`avg(${airQualityMeasurements.relativeHumidity})`.as("avg_humidity"),
      avgAbsoluteHumidity: sql<number>`avg(${airQualityMeasurements.absoluteHumidity})`.as("avg_absolute_humidity"),
      avgCoGt: sql<number>`avg(${airQualityMeasurements.coGT})`.as("avg_co_gt"),
      avgCoS1: sql<number>`avg(${airQualityMeasurements.coS1})`.as("avg_co_s1"),
      avgNmhcGt: sql<number>`avg(${airQualityMeasurements.nmhcGT})`.as("avg_nmhc_gt"),
      avgNmhcS2: sql<number>`avg(${airQualityMeasurements.nmhcS2})`.as("avg_nmhc_s2"),
      avgBenzeneGt: sql<number>`avg(${airQualityMeasurements.benzeneGT})`.as("avg_benzene_gt"),
      avgNOxGt: sql<number>`avg(${airQualityMeasurements.noxGT})`.as("avg_nox_gt"),
      avgNOxS3: sql<number>`avg(${airQualityMeasurements.noxS3})`.as("avg_nox_s3"),
      avgNo2Gt: sql<number>`avg(${airQualityMeasurements.no2GT})`.as("avg_no2_gt"),
      avgNo2S4: sql<number>`avg(${airQualityMeasurements.no2S4})`.as("avg_no2_s4"),
      avgO3S5: sql<number>`avg(${airQualityMeasurements.o3S5})`.as("avg_o3_s5"),
    })
    .from(airQualityMeasurements)
    .where(and(between(airQualityMeasurements.timestamp, from, to)))
    .groupBy(bucket)
    .orderBy(bucket)
    .limit(limit || Number.MAX_SAFE_INTEGER);
}

@Injectable<AirQualityRepository>(AiQualityRepo)
export class AirQualityRepository implements AirQualityRepositoryType {
  private readonly db = inject(DataBase);
  private readonly logger = inject(LoggerToken);

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
    const dbDQuery = await airQualityByTimeRangeQuery(this.db, from, to, groupBy, limit);
    return dbDQuery;
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
