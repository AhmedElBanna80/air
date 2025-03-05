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
        // Create parameter data structures first
        type ParamType = ReturnType<typeof parameterMap.get>;
        
        interface ParameterObject {
          parameter: ParamType;
          series: Array<{ timestamp: string; value: number }>;
        }
        
        const parameterObjects: Record<string, ParameterObject> = {};
        
        // Set up objects for each parameter we'll track
        ["co", "nmhc", "benzene", "nox", "no2"].forEach(paramName => {
          if (parameterMap.has(paramName)) {
            const param = parameterMap.get(paramName);
            if (param) {
              parameterObjects[paramName] = {
                parameter: param,
                series: []
              };
            }
          }
        });
        
        // Initialize environmental data arrays
        timeSeriesData.environmentalData.temperature.series = [];
        timeSeriesData.environmentalData.relativeHumidity.series = [];
        timeSeriesData.environmentalData.absoluteHumidity.series = [];
        
        // Single loop through all measurements
        for (const m of measurements) {
          const timestamp = m.timestamp.toString();
          
          // Add environmental data
          timeSeriesData.environmentalData.temperature.series.push({
            timestamp,
            value: m.avgTemperature
          });
          
          timeSeriesData.environmentalData.relativeHumidity.series.push({
            timestamp,
            value: m.avgHumidity
          });
          
          timeSeriesData.environmentalData.absoluteHumidity.series.push({
            timestamp,
            value: m.avgAbsoluteHumidity
          });
          
          // Add parameter data
          if (parameterObjects.co) {
            parameterObjects.co.series.push({ timestamp, value: m.avgCoGt });
          }
          
          if (parameterObjects.nmhc) {
            parameterObjects.nmhc.series.push({ timestamp, value: m.avgNmhcGt });
          }
          
          if (parameterObjects.benzene) {
            parameterObjects.benzene.series.push({ timestamp, value: m.avgBenzeneGt });
          }
          
          if (parameterObjects.nox) {
            parameterObjects.nox.series.push({ timestamp, value: m.avgNOxGt });
          }
          
          if (parameterObjects.no2) {
            parameterObjects.no2.series.push({ timestamp, value: m.avgNo2Gt });
          }
        }
        
        // Add all parameter objects to timeSeriesData
        Object.values(parameterObjects).forEach(param => {
          timeSeriesData.parameters.push(param);
        });
      }

      return timeSeriesData;
    }
    catch (error) {
      this.logger.error("Error fetching time series data:", error);
      throw error;
    }
  }
}
