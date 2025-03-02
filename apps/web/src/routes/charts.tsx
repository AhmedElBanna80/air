import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { FilterIcon, RefreshCcwIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AirQualityChart from "../components/charts/air-quality-chart";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { fetchTimeSeriesData } from "../lib/api";


const groupByOptions = [
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

	// Handle popover close
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

	return (
		<div className="w-full space-y-4 h-full flex flex-col">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold tracking-tight">
					Air Quality Charts
				</h1>
				<div className="flex items-center gap-2">
					<Popover open={filterOpen} onOpenChange={handlePopoverOpenChange}>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">
								<FilterIcon className="h-4 w-4 mr-2" />
								Filter
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80 p-4" align="end">
							<div className="space-y-4">
								<h4 className="font-medium">Chart Settings</h4>
								<div className="space-y-2">
									<Label htmlFor="date-from">From</Label>
									<Input
										id="date-from"
										type="date"
										value={customRange.from}
										onChange={(e) =>
											handleCustomDateChange("from", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="date-to">To</Label>
									<Input
										id="date-to"
										type="date"
										value={customRange.to}
										onChange={(e) =>
											handleCustomDateChange("to", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="group-by">Group By</Label>
									<Select value={groupBy} onValueChange={setGroupBy}>
										<SelectTrigger id="group-by">
											<SelectValue placeholder="Select grouping" />
										</SelectTrigger>
										<SelectContent>
											{groupByOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</PopoverContent>
					</Popover>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCcwIcon className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				</div>
			</div>

			<div className="text-sm text-muted-foreground mt-2">
				{formatDateRange()} • {groupByOptions.find(g => g.value === groupBy)?.label || groupBy}
			</div>

			<Card className="w-full h-full flex flex-col mt-4 flex-1">
				<CardHeader className="pb-0">
					<CardTitle>Air Quality Time Series</CardTitle>
					<CardDescription>
						View air quality parameters over time
					</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 pt-4">
					{isLoading ? (
						<div className="h-full min-h-[500px] flex items-center justify-center">
							<p>Loading chart data...</p>
						</div>
					) : isError ? (
						<div className="h-full min-h-[500px] flex items-center justify-center">
							<p className="text-red-500">
								Error loading chart data. Please try again.
							</p>
						</div>
					) : !data ? (
						<div className="h-full min-h-[500px] flex items-center justify-center">
							<p className="text-muted-foreground">
								No data available for the selected time range.
							</p>
						</div>
					) : (
						<div className="h-full min-h-[500px]">
							<AirQualityChart
								data={data}
								from={dateRange.from}
								to={dateRange.to}
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
