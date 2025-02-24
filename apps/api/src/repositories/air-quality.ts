import { airQualityMeasurements, insertAirQualitySchema } from "@/db/schema.js";
import { and, between, sql } from "drizzle-orm";
import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { z } from "zod";
import { db } from "../db/index.js";

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
  constructor(private readonly db: NodePgDatabase) {}

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
            coGT: sql`excluded.cogt`,
            coS1: sql`excluded.cos1`,
            nmhcGT: sql`excluded.nmhcgt`,
            nmhcS2: sql`excluded.nmhcs2`,
            benzeneGT: sql`excluded.benzenegt`,
            noxGT: sql`excluded.noxgt`,
            noxS3: sql`excluded.noxs3`,
            no2GT: sql`excluded.no2gt`,
            no2S4: sql`excluded.no2s4`,
            o3S5: sql`excluded.o3s5`,
            temperature: sql`excluded.temperature`,
            relativeHumidity: sql`excluded.relative_humidity`,
            absoluteHumidity: sql`excluded.absolute_humidity`,
          },
        });
  
      return measurements.length;
    } catch (error) {
      console.error("Database upsert error:", error);
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

export const airQualityRepository = new AirQualityRepository(
  db as unknown as NodePgDatabase,
);
