import type { Container } from "di-wise";
import type { z } from "zod";
import { Scope, Type } from "di-wise";

import type { insertAirQualitySchema, selectAirQualitySchema } from "@/api/services/db/schema/air-quality";

import { AirQualityRepository } from "./measurements.repo";

export type AirQualityMeasurement = z.infer<typeof insertAirQualitySchema>;
export type AirQualityData = z.infer<typeof selectAirQualitySchema>;

export type BucketWidth = "microsecond" | "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "decade" | "century";

export type AirQualityStats = {
  avgRelativeHumidity: number;
  timestamp: string;
  avgTemperature: number;
  avgHumidity: number;
  avgAbsoluteHumidity: number;
  avgCoGt: number;
  avgCoS1: number;
  avgNmhcGt: number;
  avgNmhcS2: number;
  avgBenzeneGt: number;
  avgNOxGt: number;
  avgNOxS3: number;
  avgNo2Gt: number;
  avgNo2S4: number;
  avgO3S5: number;
};

export type AirQualityRepositoryType = {
  insertBatch: (measurements: AirQualityMeasurement[]) => Promise<number>;
  queryByTimeRange: (from: Date, to: Date, groupBy: BucketWidth, limit?: number) => Promise<AirQualityStats[]>;
  getAllDataByTimeRange: (from: Date, to: Date, limit?: number) => Promise<AirQualityData[]>;
};

export const AiQualityRepo = Type<AirQualityRepositoryType>("AirQualityRepository");

export function registerAirQualityRepo(container: Container) {
  container.register(AiQualityRepo, {
    useClass: AirQualityRepository,
  }, { scope: Scope.Container });
}
