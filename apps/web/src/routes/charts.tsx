import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import AirQualityChart from "../components/charts/air-quality-chart";
import {
    Card,
    CardContent
} from "../components/ui/card";
import { fetchTimeSeriesData } from "../lib/api";


const groupByOptions = [
	{ label: "Hour", value: "hour" },
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
	{ label: "Month", value: "month" },
];

// Move the getDateRange function outside the component
const calculateDateRange = (customFromDate: string, customToDate: string) => {
	return {
		from: new Date(customFromDate),
		to: new Date(customToDate),
	};
};

export function ChartsPage() {
	const [groupBy, setGroupBy] = useState("day");
	const [filterOpen, setFilterOpen] = useState(false);
	
	// Ensure dates are initialized correctly
	const today = new Date();
	const defaultStartDate = new Date("2001-01-01");
	
	const [customRange, setCustomRange] = useState({
		from: defaultStartDate.toISOString().split("T")[0],
		to: today.toISOString().split("T")[0],
	});

	// Use useMemo to prevent recalculating on every render
	const dateRange = useMemo(
		() => calculateDateRange(customRange.from, customRange.to), 
		[customRange.from, customRange.to]
	);
	
	// Log the actual date range being used (for debugging)
	useEffect(() => {
		console.log('Using date range:', {
			from: dateRange.from.toISOString(),
			to: dateRange.to.toISOString(),
			current_year: new Date().getFullYear()
		});
	}, [dateRange]);

	// Fetch time series data
	const { data, isLoading, isError, refetch, error } = useQuery({
		queryKey: ["timeSeriesData", dateRange.from.toISOString(), dateRange.to.toISOString(), groupBy],
		queryFn: () => {
			console.log('Query function executing with date range:', { 
				from: dateRange.from.toISOString(), 
				to: dateRange.to.toISOString(), 
				groupBy 
			});
			return fetchTimeSeriesData(dateRange.from, dateRange.to, groupBy);
		},
		retry: 1,
		// Add staleTime to prevent frequent refetches
		staleTime: 60000, // 1 minute
	});

	useEffect(() => {
		console.log('Time series data loading status:', { isLoading, isError, error });
		if (data) {
			console.log('Time series data loaded:', data);
		}
	}, [data, isLoading, isError, error]);

	// Handle custom date change
	const handleCustomDateChange = (field: "from" | "to", value: string) => {
		setCustomRange((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Handle popover open change
	const handlePopoverOpenChange = (open: boolean) => {
		setFilterOpen(open);
		// When closing the popover, refetch the data with new filters
		if (!open) {
			refetch();
		}
	};

	// Format date range for display
	const formatDateRange = () => {
		const fromDate = new Date(customRange.from).toLocaleDateString();
		const toDate = new Date(customRange.to).toLocaleDateString();
		return `${fromDate} to ${toDate}`;
	};
	
	// Format date range summary with groupBy
	const dateRangeSummary = `${formatDateRange()} • ${groupByOptions.find(g => g.value === groupBy)?.label || groupBy}`;

	return (
		<div className="w-full h-full flex">
			<Card className="w-full h-full flex flex-col flex-1 border-0 rounded-none shadow-none">
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
								onRefresh={() => refetch()}
								onDateChange={handleCustomDateChange}
								onGroupByChange={setGroupBy}
								dateRange={customRange}
								dateRangeSummary={dateRangeSummary}
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
