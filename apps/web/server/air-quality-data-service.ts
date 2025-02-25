import type { BucketWidth, ChartMeasurement } from "../../../packages/shared-types/src/air-quality";
import type { RawAirQualityMeasurement } from "../../../packages/shared-types/src/api-responses";

// lib/data-service.ts

// This function fetches data from the API or fallback to static data
export async function getAirQualityData(): Promise<ChartMeasurement[]> {
  try {
    // First try to fetch from the API
    const response = await fetch(
      `"http://localhost:3001"}/api/air-quality/measurements?from=${encodeURIComponent("2004-03-10T00:00:00.000Z")}&to=${encodeURIComponent("2004-03-17T00:00:00.000Z")}&groupBy=hour`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return mapToChartFormat(data.measurements);
  }
  catch (error) {
    console.warn("Failed to fetch from API, falling back to static data", error);
    // Fallback to static data
    const staticData = await import("@/data/air-quality-measurements.json");
    return mapToChartFormat(staticData.default.measurements);
  }
}

// This function converts API data to the format expected by the chart
function mapToChartFormat(measurements: RawAirQualityMeasurement[]): ChartMeasurement[] {
  return measurements.map(measurement => ({
    "timestamp": measurement.timestamp,
    "CO(GT)": measurement.avgCO_GT,
    "PT08.S1(CO)": measurement.avgCO_S1,
    "NMHC(GT)": measurement.avgNMHC_GT,
    "C6H6(GT)": measurement.avgBenzene_GT,
    "PT08.S2(NMHC)": measurement.avgNMHC_S2,
    "NOx(GT)": measurement.avgNOx_GT,
    "PT08.S3(NOx)": measurement.avgNOx_S3,
    "NO2(GT)": measurement.avgNO2_GT,
    "PT08.S4(NO2)": measurement.avgNO2_S4,
    "PT08.S5(O3)": measurement.avgO3_S5,
    "T": measurement.avgTemperature,
    "RH": measurement.avgHumidity,
    "AH": measurement.avgAbsoluteHumidity,
  }));
}

// Function to get data in chunks (for very large datasets)
export async function getAirQualityDataInChunks(
  from: Date,
  to: Date,
  chunkSize: number = 1000,
): Promise<ReadableStream<ChartMeasurement[]>> {
  return new ReadableStream({
    async start(controller) {
      try {
        const baseUrl = `${"http://localhost:3001"}/api/air-quality/all-data`;
        const url = new URL(baseUrl);
        url.searchParams.append("from", from.toISOString());
        url.searchParams.append("to", to.toISOString());
        url.searchParams.append("limit", chunkSize.toString());

        let offset = 0;
        let hasMoreData = true;

        while (hasMoreData) {
          const pageUrl = new URL(url);
          pageUrl.searchParams.append("offset", offset.toString());

          const response = await fetch(pageUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch data chunk");
          }

          const data = await response.json();
          const measurements = mapToChartFormat(data.data);

          if (measurements.length > 0) {
            controller.enqueue(measurements);
            offset += measurements.length;
          }
          else {
            hasMoreData = false;
          }

          // If we got less than chunkSize, we've reached the end
          if (measurements.length < chunkSize) {
            hasMoreData = false;
          }
        }

        controller.close();
      }
      catch (error) {
        console.error("Error streaming data:", error);
        controller.error(error);
      }
    },
  });
}
