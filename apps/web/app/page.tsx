import { DataLoadingSkeleton } from "@/components/data-loading-skeleton";
import { getAirQualityData } from "@/lib/data-service";
import { Suspense } from "react";

import AirQualityChart from "@/components/air-quality-chart";

export default async function Home() {
  return (
    <div className="container">
      <Suspense fallback={<DataLoadingSkeleton />}>
        <AirQualityDataSection />
      </Suspense>
    </div>
  );
}

async function AirQualityDataSection() {
  const data = await getAirQualityData();

  return <AirQualityChart data={data} />;
}
