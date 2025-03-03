import { inject, Injectable } from "di-wise";

import type { AirQualityStats, BucketWidth } from "@/api/repositories";

import { AiQualityRepo, ParametersRepo } from "@/api/repositories";

import type { AirQualityServiceType, TimeSeriesData } from "./air-quality.types";

import { LoggerToken } from "../logger/logger.types";
import { AirQualityServiceToken } from "./air-quality.types";

@Injectable<AirQualityService>(AirQualityServiceToken)
export class AirQualityService implements AirQualityServiceType {
  private readonly airQualityRepo = inject(AiQualityRepo);
  private readonly parametersRepo = inject(ParametersRepo);
  private readonly logger = inject(LoggerToken);

  async getTimeSeriesData(
    from: Date,
    to: Date,
    groupBy: BucketWidth,
    limit?: number,
  ): Promise<TimeSeriesData> {
    try {
      // Get all parameters
      const parameters = await this.parametersRepo.getAllParameters();

      // Create a map for easier lookup
      const parameterMap = new Map();
      for (const param of parameters) {
        parameterMap.set(param.name, param);
      }

      // Get measurements within the time range
      const measurements = await this.airQualityRepo.queryByTimeRange(
        from,
        to,
        groupBy,
        limit,
      );

      // Default empty response structure
      const timeSeriesData: TimeSeriesData = {
        from,
        to,
        groupBy,
        parameters: [],
        environmentalData: {
          temperature: {
            series: [],
          },
          relativeHumidity: {
            series: [],
          },
          absoluteHumidity: {
            series: [],
          },
        },
      };

      // If we have measurements, process them
      if (measurements && measurements.length > 0) {
        // Process temperature data
        timeSeriesData.environmentalData.temperature.series = measurements.map((m: AirQualityStats) => ({
          timestamp: m.timestamp.toString(),
          value: m.avgTemperature,
        }));

        // Process relative humidity data
        timeSeriesData.environmentalData.relativeHumidity.series = measurements.map((m: AirQualityStats) => ({
          timestamp: m.timestamp.toString(),
          value: m.avgRelativeHumidity || m.avgHumidity,
        }));

        // Process absolute humidity data
        timeSeriesData.environmentalData.absoluteHumidity.series = measurements.map((m: AirQualityStats) => ({
          timestamp: m.timestamp.toString(),
          value: m.avgAbsoluteHumidity,
        }));

        // Process air quality parameters
        // CO
        if (parameterMap.has("co")) {
          const coParam = parameterMap.get("co");
          if (coParam) {
            timeSeriesData.parameters.push({
              parameter: coParam,
              series: measurements.map((m: AirQualityStats) => ({
                timestamp: m.timestamp.toString(),
                value: m.avgCoGt,
              })),
            });
          }
        }

        // NMHC
        if (parameterMap.has("nmhc")) {
          const nmhcParam = parameterMap.get("nmhc");
          if (nmhcParam) {
            timeSeriesData.parameters.push({
              parameter: nmhcParam,
              series: measurements.map((m: AirQualityStats) => ({
                timestamp: m.timestamp.toString(),
                value: m.avgNmhcGt,
              })),
            });
          }
        }

        // Benzene
        if (parameterMap.has("benzene")) {
          const benzeneParam = parameterMap.get("benzene");
          if (benzeneParam) {
            timeSeriesData.parameters.push({
              parameter: benzeneParam,
              series: measurements.map((m: AirQualityStats) => ({
                timestamp: m.timestamp.toString(),
                value: m.avgBenzeneGt,
              })),
            });
          }
        }

        // NOx
        if (parameterMap.has("nox")) {
          const noxParam = parameterMap.get("nox");
          if (noxParam) {
            timeSeriesData.parameters.push({
              parameter: noxParam,
              series: measurements.map((m: AirQualityStats) => ({
                timestamp: m.timestamp.toString(),
                value: m.avgNOxGt,
              })),
            });
          }
        }

        // NO2
        if (parameterMap.has("no2")) {
          const no2Param = parameterMap.get("no2");
          if (no2Param) {
            timeSeriesData.parameters.push({
              parameter: no2Param,
              series: measurements.map((m: AirQualityStats) => ({
                timestamp: m.timestamp.toString(),
                value: m.avgNo2Gt,
              })),
            });
          }
        }
      }

      return timeSeriesData;
    }
    catch (error) {
      this.logger.error("Error fetching time series data:", error);
      throw error;
    }
  }
}
