import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../components/ui/tabs";
import { fetchTimeSeriesData } from "../lib/api";


const groupByOptions = [
	{ label: "Minute", value: "minute" },
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
	const [activeTab, setActiveTab] = useState("time-series");
	const [groupBy, setGroupBy] = useState("hour");
	
	// Ensure dates are initialized correctly
	const today = new Date();
	const weekAgo = new Date(today);
	weekAgo.setDate(today.getDate() - 7);
	
	const [customRange, setCustomRange] = useState({
		from: weekAgo.toISOString().split("T")[0],
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

	return (
		<div className="w-full space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold tracking-tight">
					Air Quality Charts
				</h1>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<RefreshCcwIcon className="h-4 w-4 mr-2" />
					Refresh Data
				</Button>
			</div>

			<Tabs
				defaultValue="time-series"
				className="w-full"
				onValueChange={setActiveTab}
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="time-series">Time Series</TabsTrigger>
					<TabsTrigger value="comparison">Parameter Comparison</TabsTrigger>
				</TabsList>

				<Card className="mt-6 w-full">
					<CardHeader>
						<CardTitle>Chart Settings</CardTitle>
						<CardDescription>Configure your chart view</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
						
						<div className="mt-4 flex justify-end">
							<Button 
								variant="default" 
								size="sm" 
								onClick={() => refetch()}
							>
								Apply Date Range
							</Button>
						</div>
					</CardContent>
				</Card>

				<TabsContent value="time-series" className="mt-6">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Air Quality Time Series</CardTitle>
							<CardDescription>
								View air quality parameters over time
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="h-96 flex items-center justify-center">
									<p>Loading chart data...</p>
								</div>
							) : isError ? (
								<div className="h-96 flex items-center justify-center">
									<p className="text-red-500">
										Error loading chart data. Please try again.
									</p>
								</div>
							) : !data ? (
								<div className="h-96 flex items-center justify-center">
									<p className="text-muted-foreground">
										No data available for the selected time range.
									</p>
								</div>
							) : (
								<div className="h-96">
									<AirQualityChart
										data={data}
										from={dateRange.from}
										to={dateRange.to}
									/>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="comparison" className="mt-6">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Parameter Comparison</CardTitle>
							<CardDescription>
								Compare different air quality parameters
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-96 flex items-center justify-center">
								<p className="text-muted-foreground">
									Parameter comparison view coming soon...
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
