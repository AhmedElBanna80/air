import { useEffect } from "react";
import AirQualityChart from "../components/charts/air-quality-chart";
import { Card, CardContent } from "../components/ui/card";
import { useChartData } from "../lib/chartState";

export function ChartsPage() {
	// Get all chart data and state from context
	const {
		data,
		isLoading,
		isError,
		dateRange,
		groupBy,
		customRange,
		dateRangeSummary,
		handleRefresh,
		handleCustomDateChange,
		handleGroupByChange,
	} = useChartData();

	// Trigger initial data fetch on first render
	useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return (
		<div className="w-full h-full flex">
			<Card className="w-full h-full flex flex-col flex-1 border-0 rounded-none shadow-none card">
				<CardContent className="flex-1 p-0">
					{isLoading ? (
						<div className="h-full min-h-[500px] flex items-center justify-center p-6">
							<p>Loading chart data...</p>
						</div>
					) : isError ? (
						<div className="h-full min-h-[500px] flex items-center justify-center p-6">
							<p className="text-red-500">
								Error loading chart data. Please try again.
							</p>
						</div>
					) : !data ? (
						<div className="h-full min-h-[500px] flex items-center justify-center p-6">
							<p className="text-muted-foreground">
								No data available for the selected time range.
							</p>
						</div>
					) : (
						<div className="h-full w-full p-4">
							<AirQualityChart
								data={data}
								from={dateRange.from}
								to={dateRange.to}
								groupBy={groupBy}
								onRefresh={handleRefresh}
								onDateChange={handleCustomDateChange}
								onGroupByChange={handleGroupByChange}
								customRange={customRange}
								dateRangeSummary={dateRangeSummary}
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
