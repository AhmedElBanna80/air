import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import AirQualityChart from "../components/charts/air-quality-chart";
import {
    Card,
    CardContent
} from "../components/ui/card";
import { fetchTimeSeriesData } from "../lib/api";

// Define options outside the component to prevent recreation
const groupByOptions = [
	{ label: "Day", value: "day" },
	{ label: "Week", value: "week" },
	{ label: "Month", value: "month" },
];

// Pure function for date calculations
const calculateDateRange = (customFromDate: string, customToDate: string) => {
	return {
		from: new Date(customFromDate),
		to: new Date(customToDate),
	};
};

// Format date for display
const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString();
};

export function ChartsPage() {
	// State management with appropriate defaults
	const [groupBy, setGroupBy] = useState("day");
	const [filterOpen, setFilterOpen] = useState(false);
	
	// Initialize date values once
	const today = useMemo(() => new Date(), []);
	const defaultStartDate = useMemo(() => new Date("2001-01-01"), []);
	
	// Derive ISO date strings once
	const initialFromDate = useMemo(() => defaultStartDate.toISOString().split("T")[0], [defaultStartDate]);
	const initialToDate = useMemo(() => today.toISOString().split("T")[0], [today]);
	
	// Custom range state
	const [customRange, setCustomRange] = useState({
		from: initialFromDate,
		to: initialToDate,
	});

	// Use useMemo for derived state to prevent unnecessary recalculations
	const dateRange = useMemo(
		() => calculateDateRange(customRange.from, customRange.to), 
		[customRange.from, customRange.to]
	);
	
	// Debug logging with dependencies properly specified
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Using date range:', {
				from: dateRange.from.toISOString(),
				to: dateRange.to.toISOString(),
				current_year: new Date().getFullYear()
			});
		}
	}, [dateRange]);

	// Setup query parameters with memoization to prevent recreation on each render
	const queryParams = useMemo(() => ({
		from: dateRange.from.toISOString(),
		to: dateRange.to.toISOString(),
		groupBy
	}), [dateRange.from, dateRange.to, groupBy]);

	// Fetch time series data
	const { data, isLoading, isError, refetch, error } = useQuery({
		queryKey: ["timeSeriesData", queryParams.from, queryParams.to, queryParams.groupBy],
		queryFn: () => {
			if (process.env.NODE_ENV === 'development') {
				console.log('Query function executing with:', queryParams);
			}
			return fetchTimeSeriesData(dateRange.from, dateRange.to, groupBy);
		},
		retry: 1,
		staleTime: 60000, // 1 minute
	});

	// Debug logging with proper dependencies
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('Time series data loading status:', { isLoading, isError, error });
			if (data) {
				console.log('Time series data loaded:', data);
			}
		}
	}, [data, isLoading, isError, error]);

	// Use useCallback for stable function references
	const handleCustomDateChange = useCallback((field: "from" | "to", value: string) => {
		setCustomRange((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Handle popover state with useCallback
	const handlePopoverOpenChange = useCallback((open: boolean) => {
		setFilterOpen(open);
		// When closing the popover, refetch the data with new filters
		if (!open) {
			refetch();
		}
	}, [refetch]);

	// Memoize expensive formatting operations
	const formatDateRange = useCallback(() => {
		const fromDate = formatDate(customRange.from);
		const toDate = formatDate(customRange.to);
		return `${fromDate} to ${toDate}`;
	}, [customRange.from, customRange.to]);
	
	// Memoize the summary string to prevent recreation on each render
	const dateRangeSummary = useMemo(() => {
		const groupByLabel = groupByOptions.find(g => g.value === groupBy)?.label || groupBy;
		return `${formatDateRange()} • ${groupByLabel}`;
	}, [formatDateRange, groupBy]);

	// Memoize the onRefresh handler
	const handleRefresh = useCallback(() => {
		refetch();
	}, [refetch]);

	// Memoize the onGroupByChange handler
	const handleGroupByChange = useCallback((value: string) => {
		setGroupBy(value);
	}, []);

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
