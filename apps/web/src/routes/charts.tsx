import { useTimeSeriesData } from "@/lib/queries/get-charts-data";
import AirQualityChart from "../components/charts/air-quality-chart";
import { Card, CardContent } from "../components/ui/card";

// Loading state component that uses the hook internally
function LoadingState() {
	const { isLoading } = useTimeSeriesData();
	
	if (!isLoading) return null;
	
	return (
		<div className="h-full min-h-[500px] flex items-center justify-center p-6">
			<p>Loading chart data...</p>
		</div>
	);
}

// Error state component that uses the hook internally
function ErrorState() {
	const { isError, isLoading } = useTimeSeriesData();
	
	if (isLoading || !isError) return null;
	
	return (
		<div className="h-full min-h-[500px] flex items-center justify-center p-6">
			<p className="text-red-500">
				Error loading chart data. Please try again.
			</p>
		</div>
	);
}

// No data state component that uses the hook internally
function NoDataState() {
	const { data, isLoading, isError } = useTimeSeriesData();
	
	if (isLoading || isError || data) return null;
	
	return (
		<div className="h-full min-h-[500px] flex items-center justify-center p-6">
			<p className="text-muted-foreground">
				No data available for the selected time range.
			</p>
		</div>
	);
}

// Main chart page component
export function ChartsPage() {
	const { isLoading, isError, data } = useTimeSeriesData();
	
	return (
		<div className="w-full h-full flex">
			<Card className="w-full h-full flex flex-col flex-1 border-0 rounded-none shadow-none card">
				<CardContent className="flex-1 p-0">
					<LoadingState />
					<ErrorState />
					<NoDataState />
					
					{!isLoading && !isError && data && (
						<div className="h-full w-full p-4">
							<AirQualityChart />
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
