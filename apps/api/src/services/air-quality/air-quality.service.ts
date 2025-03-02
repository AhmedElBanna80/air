import { AiQualityRepo, BucketWidth, ParametersRepo } from "@/api/repositories";
import { inject, Injectable, Type } from "di-wise";
import { LoggerToken } from "../logger/logger.types";
import { AirQualityServiceToken, AirQualityServiceType, TimeSeriesData } from "./air-quality.types";



@Injectable<AirQualityService>(AirQualityServiceToken)
export class AirQualityService implements AirQualityServiceType {
  private readonly airQualityRepo = inject(AiQualityRepo);
  private readonly parametersRepo = inject(ParametersRepo);
  private readonly logger = inject(LoggerToken);

  async getTimeSeriesData(
    from: Date,
    to: Date,
    groupBy: BucketWidth,
    limit?: number
  ): Promise<TimeSeriesData> {
    try {
      // Get all parameters
      const parameters = await this.parametersRepo.getAllParameters();
      
      // Get air quality measurements
      const measurements = await this.airQualityRepo.queryByTimeRange(from, to, groupBy, limit);

      // Map parameter data to time series
      const parameterMap = new Map(
        parameters.map(param => [param.name, {
          id: param.id,
          name: param.name,
          display_name: param.display_name,
          unit: param.unit,
          min_safe_value: param.min_safe_value,
          max_safe_value: param.max_safe_value
        }])
      );

      const timeSeriesData: TimeSeriesData = {
        from,
        to,
        groupBy,
        parameters: [],
        environmentalData: {
          temperature: { series: [] },
          relativeHumidity: { series: [] },
          absoluteHumidity: { series: [] }
        }
      };

      // Map measurements to parameter time series
      if (measurements.length > 0) {
        // Map environmental data
        measurements.forEach(measurement => {
          timeSeriesData.environmentalData.temperature.series.push({
            timestamp: measurement.timestamp.toString(),
            value: measurement.avgTemperature
          });
          
          timeSeriesData.environmentalData.relativeHumidity.series.push({
            timestamp: measurement.timestamp.toString(),
            value: measurement.avgHumidity
          });
          
          timeSeriesData.environmentalData.absoluteHumidity.series.push({
            timestamp: measurement.timestamp.toString(),
            value: measurement.avgAbsoluteHumidity
          });
        });

        // Create parameter time series
        // CO
        if (parameterMap.has('co')) {
          const coParam = parameterMap.get('co')!;
          timeSeriesData.parameters.push({
            parameter: coParam,
            series: measurements.map(m => ({
              timestamp: m.timestamp.toString(),
              value: m.avgCoGt
            }))
          });
        }

        // NMHC
        if (parameterMap.has('nmhc')) {
          const nmhcParam = parameterMap.get('nmhc')!;
          timeSeriesData.parameters.push({
            parameter: nmhcParam,
            series: measurements.map(m => ({
              timestamp: m.timestamp.toString(),
              value: m.avgNmhcGt
            }))
          });
        }

        // Benzene
        if (parameterMap.has('benzene')) {
          const benzeneParam = parameterMap.get('benzene')!;
          timeSeriesData.parameters.push({
            parameter: benzeneParam,
            series: measurements.map(m => ({
              timestamp: m.timestamp.toString(),
              value: m.avgBenzeneGt
            }))
          });
        }

        // NOx
        if (parameterMap.has('nox')) {
          const noxParam = parameterMap.get('nox')!;
          timeSeriesData.parameters.push({
            parameter: noxParam,
            series: measurements.map(m => ({
              timestamp: m.timestamp.toString(),
              value: m.avgNOxGt
            }))
          });
        }

        // NO2
        if (parameterMap.has('no2')) {
          const no2Param = parameterMap.get('no2')!;
          timeSeriesData.parameters.push({
            parameter: no2Param,
            series: measurements.map(m => ({
              timestamp: m.timestamp.toString(),
              value: m.avgNo2Gt
            }))
          });
        }
      }

      return timeSeriesData;
    } catch (error) {
      this.logger.error("Error fetching time series data:", error);
      throw error;
    }
  }
}