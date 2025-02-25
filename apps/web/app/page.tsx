import airQualityData from "@/data/air-quality-measurements.json";
import { Suspense } from "react";

import AirQualityChart from "@/components/air-quality-chart";

async function getData() {
  try {
    console.log("Raw data:", airQualityData);

    // Map the data to match the expected property names
    const processedData = airQualityData.measurements.map(measurement => ({
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

    console.log("Processed data:", processedData[0]);
    return processedData;
  }
  catch (error) {
    console.error("Error parsing air quality data:", error);
    return [];
  }
}

export default async function Home() {
  const data = await getData();

  console.log("Data in Home component:", data.length);
  console.log("First data point:", data[0]);

  return (
    <div className="container">
      <Suspense fallback={<div>Loading chart...</div>}>
        <AirQualityChart data={data} />
      </Suspense>
    </div>
  );
}
