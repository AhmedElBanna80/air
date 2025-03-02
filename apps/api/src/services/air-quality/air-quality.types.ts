import type { Container } from "di-wise";

import { Type } from "di-wise";

import type { BucketWidth } from "@/api/repositories";

import { AirQualityService } from "./air-quality.service";

export type ParameterTimeSeriesData = {
  parameter: {
    id: number;
    name: string;
    display_name: string;
    unit: string;
    min_safe_value: number | null;
    max_safe_value: number | null;
  };
  series: {
    timestamp: string;
    value: number;
  }[];
};

export type TimeSeriesData = {
  from: Date;
  to: Date;
  groupBy: BucketWidth;
  parameters: ParameterTimeSeriesData[];
  environmentalData: {
    temperature: {
      series: { timestamp: string; value: number }[];
    };
    relativeHumidity: {
      series: { timestamp: string; value: number }[];
    };
    absoluteHumidity: {
      series: { timestamp: string; value: number }[];
    };
  };
};

export type AirQualityServiceType = {
  getTimeSeriesData: (from: Date, to: Date, groupBy: BucketWidth, limit?: number) => Promise<TimeSeriesData>;
};

export const AirQualityServiceToken = Type<AirQualityServiceType>("AirQualityService");

export function registerAirQualityService(container: Container) {
  container.register(AirQualityServiceToken, {
    useClass: AirQualityService,
  });
}
